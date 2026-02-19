import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ResponseMessage } from '~/config/reponse.config'
import { MESSAGE } from '~/constants/message'
import roleService from '~/services/role.service'

const roleController = {
  /**
   * @function createRole
   * @description Create a new role
   * @route POST /admin/roles
   * @access Admin
   */
  createRole: async (req: Request<ParamsDictionary, any, any>, res: Response) => {
    const role = await roleService.createRole(req.body)
    return ResponseMessage.created(res, role, MESSAGE.ROLE.CREATE_SUCCESS)
  },

  /**
   * @function getRoles
   * @description Get all roles with pagination
   * @route GET /admin/roles
   * @access Admin
   */
  getRoles: async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const search = (req.query.search as string) || ''

    const roles = await roleService.getRoles({ page, limit, search })
    return ResponseMessage.success(res, roles, MESSAGE.ROLE.GET_SUCCESS)
  },

  /**
   * @function getRoleById
   * @description Get a role by ID
   * @route GET /admin/roles/:id
   * @access Admin
   */
  getRoleById: async (req: Request<ParamsDictionary & { id: string }>, res: Response) => {
    const { id } = req.params
    const role = await roleService.getRoleById(id)
    return ResponseMessage.success(res, role, MESSAGE.ROLE.GET_SUCCESS)
  },

  /**
   * @function updateRole
   * @description Update a role
   * @route PUT /admin/roles/:id
   * @access Admin
   */
  updateRole: async (req: Request<ParamsDictionary & { id: string }, any, any>, res: Response) => {
    const { id } = req.params
    const roleData = req.body
    const updatedRole = await roleService.updateRole(id, roleData)
    return ResponseMessage.success(res, updatedRole, MESSAGE.ROLE.UPDATE_SUCCESS)
  },

  /**
   * @function deleteRole
   * @description Delete a role
   * @route DELETE /admin/roles/:id
   * @access Admin
   */
  deleteRole: async (req: Request<ParamsDictionary & { id: string }>, res: Response) => {
    const { id } = req.params
    const deletedRole = await roleService.deleteRole(id)
    return ResponseMessage.success(res, deletedRole, MESSAGE.ROLE.DELETE_SUCCESS)
  },

  /**
   * @function addPermissionsToRole
   * @description Add permissions to a role
   * @route PATCH /admin/roles/:roleId/permissions
   * @access Admin
   */
  addPermissionsToRole: async (
    req: Request<ParamsDictionary & { roleId: string }, any, { permissionIds: string[] }>,
    res: Response
  ) => {
    const { roleId } = req.params
    const { permissionIds } = req.body

    const updatedRole = await roleService.addPermissionsToRole(roleId, permissionIds)
    return ResponseMessage.success(res, updatedRole, MESSAGE.ROLE.UPDATE_SUCCESS)
  }
}

export default roleController
