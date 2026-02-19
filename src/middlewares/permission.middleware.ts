import { Request, Response, NextFunction } from 'express'
import { ErrorWithStatus } from '~/errors/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { MESSAGE } from '~/constants/message'
import { UserRole } from '~/constants/enums'
import permissionService from '~/services/permission.service'
import { PermissionCheckParams } from '~/interfaces/permission.interface'

/**
 * Check if the user has the required roles
 * @param roles Array of roles the user must have at least one of
 */
export const hasRoles = (roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user exists in request
      if (!req.user) {
        throw new ErrorWithStatus({
          message: MESSAGE.TOKEN.ACCESS_REQUIRED,
          status: HTTP_STATUS.UN_AUTHORIZED
        })
      }
      // Check if the user has any of the required roles
      const hasRequiredRole = await permissionService.hasRoles(req.user.id, roles)
      if (!hasRequiredRole) {
        throw new ErrorWithStatus({
          message: 'You do not have permission to access this resource',
          status: HTTP_STATUS.FORBIDDEN
        })
      }
      // Continue to the next middleware
      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Check if the user has the required permissions
 * @param requiredPermissions Array of permission names the user must have
 */
export const hasPermissions = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user exists in request
      if (!req.user) {
        throw new ErrorWithStatus({
          message: MESSAGE.TOKEN.ACCESS_REQUIRED,
          status: HTTP_STATUS.UN_AUTHORIZED
        })
      }
      // Prepare check parameters
      const checkParams: PermissionCheckParams = {
        userId: req.user.id,
        requiredPermissions,
        resourceId: req.params.id || undefined,
        resource: req.body
      }
      // Get all user permissions for later use
      const userPermissions = await permissionService.getUserPermissions(req.user.id)
      // Store user permissions in the request for later use
      req.user.permissions = userPermissions.map((p) => p.name)

      // Check if the user has all required permissions
      const hasAllRequiredPermissions = await permissionService.hasAllPermissions(checkParams)

      if (!hasAllRequiredPermissions) {
        throw new ErrorWithStatus({
          message: 'You do not have permission to access this resource',
          status: HTTP_STATUS.FORBIDDEN
        })
      }

      // Continue to the next middleware
      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Check if the user has at least one of the required permissions
 * @param requiredPermissions Array of permission names, user must have at least one
 */
export const hasAnyPermission = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user exists in request
      if (!req.user) {
        throw new ErrorWithStatus({
          message: MESSAGE.TOKEN.ACCESS_REQUIRED,
          status: HTTP_STATUS.UN_AUTHORIZED
        })
      }

      // Prepare check parameters
      const checkParams: PermissionCheckParams = {
        userId: req.user.id,
        requiredPermissions,
        resourceId: req.params.id || undefined,
        resource: req.body
      }

      // Get all user permissions for later use
      const userPermissions = await permissionService.getUserPermissions(req.user.id)

      // Store user permissions in the request for later use
      req.user.permissions = userPermissions.map((p) => p.name)

      // Check if the user has any required permission
      const hasAnyRequiredPermission = await permissionService.hasAnyPermission(checkParams)

      if (!hasAnyRequiredPermission) {
        throw new ErrorWithStatus({
          message: 'You do not have permission to access this resource',
          status: HTTP_STATUS.FORBIDDEN
        })
      }

      // Continue to the next middleware
      next()
    } catch (error) {
      next(error)
    }
  }
}
