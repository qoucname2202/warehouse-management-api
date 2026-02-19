import { ObjectId } from 'mongodb'
import { CachedPermission, PermissionCheckParams, UserPermissionCache } from '~/interfaces/permission.interface'
import { UserRole } from '~/constants/enums'
import { ErrorWithStatus } from '~/errors/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { MESSAGE } from '~/constants/message'
import { databaseServices } from './database.service'

// Cache storage for permissions to reduce database queries
// Key: userId, Value: user's permissions cache object
const permissionCache = new Map<string, UserPermissionCache>()

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

// Define permission enforcer type
type PermissionEnforcer = (params: PermissionCheckParams) => Promise<void>

// Define the permissionService type with enforcer properties
interface PermissionService {
  clearUserCache: (userId: string) => void
  clearCache: () => void
  getUserPermissionsFromDB: (userId: string) => Promise<CachedPermission[]>
  getUserPermissions: (userId: string) => Promise<CachedPermission[]>
  hasAllPermissions: (params: PermissionCheckParams) => Promise<boolean>
  hasAnyPermission: (params: PermissionCheckParams) => Promise<boolean>
  hasRoles: (userId: string, requiredRoles: UserRole[]) => Promise<boolean>
  createPermissionEnforcer: (checkFn: (params: PermissionCheckParams) => Promise<boolean>) => PermissionEnforcer
  enforceAllPermissions: PermissionEnforcer
  enforceAnyPermission: PermissionEnforcer
}

const permissionService: PermissionService = {
  /**
   * Clears the permission cache for a specific user
   * @param userId The user ID
   */
  clearUserCache: (userId: string): void => {
    permissionCache.delete(userId)
  },

  /**
   * Clears the entire permission cache
   */
  clearCache: (): void => {
    permissionCache.clear()
  },

  /**
   * Get all permissions for a user from the database
   * @param userId The user ID
   * @returns Array of user's permissions
   */
  getUserPermissionsFromDB: async (userId: string): Promise<CachedPermission[]> => {
    // Get user with roles
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(userId)
    })

    if (!user || !user.roles || user.roles.length === 0) {
      return []
    }

    // Get user's roles
    const userRoles = await databaseServices.roles
      .find({
        _id: { $in: user.roles },
        is_active: true
      })
      .toArray()

    if (userRoles.length === 0) {
      return []
    }

    // Check if user is admin
    const isAdmin = userRoles.some((role) => role.name === UserRole.Admin)

    // If admin, return all permissions
    if (isAdmin) {
      const allPermissions = await databaseServices.permissions.find().toArray()
      return allPermissions.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        action: p.action,
        subject: p.subject,
        conditions: p.conditions
      }))
    }

    // Extract all permission IDs from user's roles
    const permissionIds = userRoles.reduce((ids: ObjectId[], role) => {
      if (role.permissions && role.permissions.length) {
        return [...ids, ...role.permissions]
      }
      return ids
    }, [])

    if (permissionIds.length === 0) {
      return []
    }

    // Get permissions from database
    const permissions = await databaseServices.permissions
      .find({
        _id: { $in: permissionIds }
      })
      .toArray()

    // Map to cached format
    return permissions.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      action: p.action,
      subject: p.subject,
      conditions: p.conditions
    }))
  },

  /**
   * Get all permissions for a user (with caching)
   * @param userId The user ID
   * @returns Array of user's permissions
   */
  getUserPermissions: async (userId: string): Promise<CachedPermission[]> => {
    // Check if permissions are cached and not expired
    const cachedData = permissionCache.get(userId)
    const now = Date.now()

    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
      return cachedData.permissions
    }

    // If not cached or expired, fetch from database
    const permissions = await permissionService.getUserPermissionsFromDB(userId)

    // Cache the permissions
    permissionCache.set(userId, {
      permissions,
      timestamp: now
    })

    return permissions
  },

  /**
   * Check if a user has all required permissions
   * @param params Check parameters
   * @returns True if user has all permissions
   */
  hasAllPermissions: async (params: PermissionCheckParams): Promise<boolean> => {
    const { userId, requiredPermissions } = params

    // If no permissions required, return true
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    // Get user permissions
    const userPermissions = await permissionService.getUserPermissions(userId)

    // Get permission names for quick checking
    const permissionNames = userPermissions.map((p) => p.name)

    // Check if user has all required permissions
    return requiredPermissions.every((name) => permissionNames.includes(name))
  },

  /**
   * Check if a user has any of the required permissions
   * @param params Check parameters
   * @returns True if user has any permission
   */
  hasAnyPermission: async (params: PermissionCheckParams): Promise<boolean> => {
    const { userId, requiredPermissions } = params

    // If no permissions required, return true
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    // Get user permissions
    const userPermissions = await permissionService.getUserPermissions(userId)

    // Get permission names for quick checking
    const permissionNames = userPermissions.map((p) => p.name)

    // Check if user has any required permission
    return requiredPermissions.some((name) => permissionNames.includes(name))
  },

  /**
   * Check if a user has specific roles
   * @param userId The user ID
   * @param requiredRoles Array of roles to check
   * @returns True if user has any of the roles
   */
  hasRoles: async (userId: string, requiredRoles: UserRole[]): Promise<boolean> => {
    // If no roles required, return true
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    // Get user with roles
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(userId)
    })

    if (!user || !user.roles || user.roles.length === 0) {
      return false
    }

    // Get user's roles
    const userRoles = await databaseServices.roles
      .find({
        _id: { $in: user.roles },
        is_active: true
      })
      .toArray()

    // Extract role names
    const roleNames = userRoles.map((role) => role.name)

    // Check if user has any required role
    return requiredRoles.some((role) => roleNames.includes(role))
  },

  /**
   * Create a permission check function that throws an error if check fails
   * @param checkFn The permission check function to use
   * @returns A function that throws an error if permission check fails
   */
  createPermissionEnforcer: (checkFn: (params: PermissionCheckParams) => Promise<boolean>): PermissionEnforcer => {
    return async (params: PermissionCheckParams): Promise<void> => {
      const hasPermission = await checkFn(params)

      if (!hasPermission) {
        throw new ErrorWithStatus({
          message: 'You do not have permission to access this resource',
          status: HTTP_STATUS.FORBIDDEN
        })
      }
    }
  },

  // These will be set after the object is defined
  enforceAllPermissions: null as unknown as PermissionEnforcer,
  enforceAnyPermission: null as unknown as PermissionEnforcer
}

// Create enforcer functions
permissionService.enforceAllPermissions = permissionService.createPermissionEnforcer(
  permissionService.hasAllPermissions
)

permissionService.enforceAnyPermission = permissionService.createPermissionEnforcer(permissionService.hasAnyPermission)

/**
 * Enforce required roles or throw an error if missing
 * @param userId The user ID
 * @param requiredRoles Array of required roles (e.g. [UserRole.Admin])
 */
export const enforceRoles = async (userId: string, requiredRoles: UserRole[]): Promise<void> => {
  const hasRole = await permissionService.hasRoles(userId, requiredRoles)
  if (!hasRole) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.FORBIDDEN,
      message: MESSAGE.ERROR.AUTH.REQUIRE_ADMIN
    })
  }
}

export default permissionService
