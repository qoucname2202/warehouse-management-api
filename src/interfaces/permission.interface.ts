import { BaseType } from './global.interface'

// Permission Model
export interface PermissionType extends BaseType {
  name: string
  action: string
  subject: string
  conditions?: Record<string, any>
  description?: string
  method?: string
  path?: string
}

/**
 * Interface for cached permission data
 */
export interface CachedPermission {
  id: string
  name: string
  action: string
  subject: string
  conditions?: Record<string, any>
}

/**
 * Interface for user permission cache entry
 */
export interface UserPermissionCache {
  permissions: CachedPermission[]
  timestamp: number
}

/**
 * Interface for permission check parameters
 */
export interface PermissionCheckParams {
  userId: string
  requiredPermissions: string[]
  resourceId?: string
  resource?: any
}

/**
 * Interface for role-based permission check parameters
 */
export interface RoleCheckParams {
  userId: string
  requiredRoles: string[]
}

/**
 * Interface for permission operation result
 */
export interface PermissionResult {
  granted: boolean
  reason?: string
}
