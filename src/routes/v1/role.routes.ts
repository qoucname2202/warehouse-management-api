import express from 'express'
import roleController from '~/controllers/role.controller'
import {
  createRoleValidator,
  updateRoleValidator,
  addPermissionsToRoleValidator,
  idValidator
} from '~/validation/role.validation'
import { adminOnly, requirePermissions } from '~/utils/route.utils'
import { wrapRequestHandler } from '~/utils/handeler'

const roleRouter = express.Router()

/**
 * @route POST /
 * @description Create a new role
 * @access Admin - requires admin role
 */
roleRouter.post('', adminOnly(), createRoleValidator, wrapRequestHandler(roleController.createRole))

/**
 * @route GET /
 * @description Get all roles with pagination
 * @access Admin - requires read:any:role permission
 */
roleRouter.get('', requirePermissions(['read:any:role']), wrapRequestHandler(roleController.getRoles))

/**
 * @route GET /:id
 * @description Get a role by ID
 * @access Admin - requires read:any:role permission
 */
roleRouter.get(
  '/:id',
  requirePermissions(['read:any:role']),
  idValidator,
  wrapRequestHandler(roleController.getRoleById)
)

/**
 * @route PUT /:id
 * @description Update a role
 * @access Admin - requires update:any:role permission
 */
roleRouter.put(
  '/:id',
  requirePermissions(['update:any:role']),
  idValidator,
  updateRoleValidator,
  wrapRequestHandler(roleController.updateRole)
)

/**
 * @route DELETE /:id
 * @description Delete a role
 * @access Admin - requires delete:any:role permission
 */
roleRouter.delete(
  '/:id',
  requirePermissions(['delete:any:role']),
  idValidator,
  wrapRequestHandler(roleController.deleteRole)
)

/**
 * @route PATCH /:roleId/permissions
 * @description Add permissions to a role
 * @access Admin - requires manage:roles permission
 */
roleRouter.patch(
  '/:roleId/permissions',
  requirePermissions(['manage:roles']),
  addPermissionsToRoleValidator,
  wrapRequestHandler(roleController.addPermissionsToRole)
)

export default roleRouter
