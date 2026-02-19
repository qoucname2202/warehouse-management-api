import { check, param } from 'express-validator'
import { validate } from './validation-schema'
import { idValidator } from './permission.validation'

export const createPermissionValidator = validate([
  check('name')
    .notEmpty()
    .withMessage('Permission name is required')
    .isString()
    .withMessage('Permission name must be a string')
    .trim(),

  check('action').notEmpty().withMessage('Action is required').isString().withMessage('Action must be a string').trim(),

  check('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isString()
    .withMessage('Subject must be a string')
    .trim(),

  check('conditions').optional().isObject().withMessage('Conditions must be an object')
])

export const updatePermissionValidator = validate([
  check('name').optional().isString().withMessage('Permission name must be a string').trim(),

  check('action').optional().isString().withMessage('Action must be a string').trim(),

  check('subject').optional().isString().withMessage('Subject must be a string').trim(),

  check('conditions').optional().isObject().withMessage('Conditions must be an object')
])

export const createRoleValidator = validate([
  check('name')
    .notEmpty()
    .withMessage('Role name is required')
    .isString()
    .withMessage('Role name must be a string')
    .trim(),

  check('description').optional().isString().withMessage('Description must be a string').trim(),

  check('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
    .custom((permissions) => {
      if (permissions && !Array.isArray(permissions)) {
        throw new Error('Permissions must be an array')
      }

      if (permissions && Array.isArray(permissions)) {
        for (const permissionId of permissions) {
          if (typeof permissionId !== 'string') {
            throw new Error('Each permission ID must be a string')
          }
        }
      }

      return true
    }),

  check('is_active').optional().isBoolean().withMessage('Is active must be a boolean')
])

export const updateRoleValidator = validate([
  check('name').optional().isString().withMessage('Role name must be a string').trim(),

  check('description').optional().isString().withMessage('Description must be a string').trim(),

  check('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
    .custom((permissions) => {
      if (permissions && !Array.isArray(permissions)) {
        throw new Error('Permissions must be an array')
      }

      if (permissions && Array.isArray(permissions)) {
        for (const permissionId of permissions) {
          if (typeof permissionId !== 'string') {
            throw new Error('Each permission ID must be a string')
          }
        }
      }

      return true
    }),

  check('is_active').optional().isBoolean().withMessage('Is active must be a boolean')
])

export const addPermissionsToRoleValidator = validate([
  param('roleId')
    .notEmpty()
    .withMessage('Role ID is required')
    .isString()
    .withMessage('Role ID must be a string')
    .isMongoId()
    .withMessage('Role ID must be a valid MongoDB ID'),

  check('permissionIds')
    .notEmpty()
    .withMessage('Permission IDs are required')
    .isArray()
    .withMessage('Permission IDs must be an array')
    .custom((permissionIds) => {
      if (!Array.isArray(permissionIds)) {
        throw new Error('Permission IDs must be an array')
      }

      for (const permissionId of permissionIds) {
        if (typeof permissionId !== 'string') {
          throw new Error('Each permission ID must be a string')
        }
      }

      return true
    })
])

// Re-export ID validator for convenience
export { idValidator }
