import { RequestHandler } from 'express'
import { authMiddleware, optionalAuth } from '~/middlewares/auth.middleware'
import { hasRoles, hasPermissions, hasAnyPermission } from '~/middlewares/permission.middleware'
import { UserRole } from '~/constants/enums'
import { NextFunction } from 'express'
import { ObjectId } from 'mongodb'
/**
 * Authentication middleware
 * @returns Middleware that checks if the user is logged in
 */
export const auth = (): RequestHandler => authMiddleware

/**
 * Optional authentication middleware
 * @returns Middleware that optionally checks if the user is logged in
 */
export const optionalAuthentication = (): RequestHandler => optionalAuth

/**
 * Role-based authorization middleware
 * @param roles Array of roles the user must have at least one of
 * @returns Middleware that checks if the user has at least one of the specified roles
 */
export const authorize = (roles: UserRole[]): RequestHandler => {
  return async (req, res, next) => {
    // First authenticate the user
    await authMiddleware(req, res, ((err: any) => {
      if (err) return next(err)

      // Then check role permissions
      hasRoles(roles)(req, res, next)
    }) as NextFunction)
  }
}

/**
 * Admin-only authorization middleware
 * @returns Middleware that checks if the user is an admin
 */
export const adminOnly = (): RequestHandler => authorize([UserRole.Admin])

/**
 * Instructor-only authorization middleware
 * @returns Middleware that checks if the user is an instructor or admin
 */
export const instructorOnly = (): RequestHandler => authorize([UserRole.Admin, UserRole.Instructor])

/**
 * Student-only authorization middleware
 * @returns Middleware that checks if the user is a student
 */
export const studentOnly = (): RequestHandler => authorize([UserRole.Student])

/**
 * Permission-based authorization middleware (all permissions required)
 * @param permissions Array of permission names the user must have
 * @returns Middleware that checks if the user has all of the specified permissions
 */
export const requirePermissions = (permissions: string[]): RequestHandler => {
  return async (req, res, next) => {
    // First authenticate the user
    await authMiddleware(req, res, ((err: any) => {
      if (err) return next(err)

      // Then check permissions
      hasPermissions(permissions)(req, res, next)
    }) as NextFunction)
  }
}

/**
 * Permission-based authorization middleware (any permission required)
 * @param permissions Array of permission names, user must have at least one
 * @returns Middleware that checks if the user has at least one of the specified permissions
 */
export const requireAnyPermission = (permissions: string[]): RequestHandler => {
  return async (req, res, next) => {
    // First authenticate the user
    await authMiddleware(req, res, ((err: any) => {
      if (err) return next(err)

      // Then check permissions
      hasAnyPermission(permissions)(req, res, next)
    }) as NextFunction)
  }
}

/**
 * Permission-based authorization middleware with resource ownership check
 * @param permission Permission name or array of permissions required
 * @param ownerField Field to check for ownership (defaults to 'user_id')
 * @returns Middleware that checks if user has permission or owns the resource
 */
export const requirePermissionOrOwnership = (permission: string | string[], ownerField = 'user_id'): RequestHandler => {
  const permissions = Array.isArray(permission) ? permission : [permission]

  return async (req, res, next) => {
    // First authenticate the user
    await authMiddleware(req, res, ((err: any) => {
      if (err) return next(err)

      // If req.params.id exists, try to check ownership
      if (req.params.id && (req as any).user) {
        // Add ownership-specific permission for the owner check
        // This will be handled by the permission middleware
        req.body[ownerField] = (req as any).user.id
      }

      // Then check permissions or ownership
      hasAnyPermission(permissions)(req, res, next)
    }) as NextFunction)
  }
}

/**
 * @function validateObjectId
 * @description Checks whether a given string is a valid MongoDB ObjectId
 * @param id string to validate
 * @returns true if valid ObjectId, false otherwise
 */
export const validateObjectId = (id: string): boolean => {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id
}
//Create a new ObjectId from the id string
// Then .toString() to convert it to the standard string MongoDB will use.
//If the original id string does not match the standard string of the ObjectId → return false.
