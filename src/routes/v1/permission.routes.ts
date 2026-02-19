import express from 'express'
import permissionController from '~/controllers/permission.controller'
import { createPermissionValidator, updatePermissionValidator, idValidator } from '~/validation/permission.validation'
import { requirePermissions } from '~/utils/route.utils'
import { wrapRequestHandler } from '~/utils/handeler'

const permissionRouter = express.Router()

/**
 * @route POST /
 * @description Create a new permission
 * @access Admin - requires manage:permissions
 */
permissionRouter.post(
  '/',
  requirePermissions(['manage:permissions']),
  createPermissionValidator,
  wrapRequestHandler(permissionController.createPermission)
)

/**
 * @route GET /
 * @description Get all permissions with pagination
 * @access Admin - requires read:any:permission
 */
permissionRouter.get(
  '/',
  requirePermissions(['read:any:permission']),
  wrapRequestHandler(permissionController.getPermissions)
)

/**
 * @route GET /:id
 * @description Get a permission by ID
 * @access Admin - requires read:any:permission
 */
permissionRouter.get(
  '/:id',
  requirePermissions(['read:any:permission']),
  idValidator,
  wrapRequestHandler(permissionController.getPermissionById)
)

/**
 * @route PUT /:id
 * @description Update a permission
 * @access Admin - requires update:any:permission
 */
permissionRouter.put(
  '/:id',
  requirePermissions(['update:any:permission']),
  idValidator,
  updatePermissionValidator,
  wrapRequestHandler(permissionController.updatePermission)
)

/**
 * @route DELETE /:id
 * @description Delete a permission
 * @access Admin - requires delete:any:permission
 */
permissionRouter.delete(
  '/:id',
  requirePermissions(['delete:any:permission']),
  idValidator,
  wrapRequestHandler(permissionController.deletePermission)
)

export default permissionRouter
