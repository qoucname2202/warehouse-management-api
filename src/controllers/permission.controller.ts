import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ResponseMessage } from '~/config/reponse.config'
import { MESSAGE } from '~/constants/message'
import roleService from '~/services/role.service'

const permissionController = {
  /**
   * @function createPermission
   * @description Create a new permission
   * @route POST /admin/permissions
   * @access Admin
   */
  createPermission: async (req: Request<ParamsDictionary, any, any>, res: Response) => {
    const permission = await roleService.createPermission(req.body)
    return ResponseMessage.created(res, permission, MESSAGE.PERMISSION.CREATE_SUCCESS)
  },

  /**
   * @function getPermissions
   * @description Get all permissions with pagination
   * @route GET /admin/permissions
   * @access Admin
   */
  getPermissions: async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const search = (req.query.search as string) || ''

    const permissions = await roleService.getPermissions({ page, limit, search })
    return ResponseMessage.success(res, permissions, MESSAGE.PERMISSION.GET_SUCCESS)
  },

  /**
   * @function getPermissionById
   * @description Get a permission by ID
   * @route GET /admin/permissions/:id
   * @access Admin
   */
  getPermissionById: async (req: Request<ParamsDictionary & { id: string }>, res: Response) => {
    const { id } = req.params
    const permission = await roleService.getPermissionById(id)
    return ResponseMessage.success(res, permission, MESSAGE.PERMISSION.GET_SUCCESS)
  },

  /**
   * @function updatePermission
   * @description Update a permission
   * @route PUT /admin/permissions/:id
   * @access Admin
   */
  updatePermission: async (req: Request<ParamsDictionary & { id: string }, any, any>, res: Response) => {
    const { id } = req.params
    const permissionData = req.body
    const updatedPermission = await roleService.updatePermission(id, permissionData)
    return ResponseMessage.success(res, updatedPermission, MESSAGE.PERMISSION.UPDATE_SUCCESS)
  },

  /**
   * @function deletePermission
   * @description Delete a permission
   * @route DELETE /admin/permissions/:id
   * @access Admin
   */
  deletePermission: async (req: Request<ParamsDictionary & { id: string }>, res: Response) => {
    const { id } = req.params
    const deletedPermission = await roleService.deletePermission(id)
    return ResponseMessage.success(res, deletedPermission, MESSAGE.PERMISSION.DELETE_SUCCESS)
  }
}

export default permissionController
