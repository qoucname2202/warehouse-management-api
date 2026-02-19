import { ObjectId } from 'mongodb'
import { Role } from '~/models/Role.schema'
import { Permission } from '~/models/Permission.schema'
import { ErrorWithStatus } from '~/errors/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { databaseServices } from './database.service'

interface CreatePermissionBody {
  name: string
  action: string
  subject: string
  conditions?: Record<string, any>
}

interface UpdatePermissionBody {
  name?: string
  action?: string
  subject?: string
  conditions?: Record<string, any>
}

interface CreateRoleBody {
  name: string
  description?: string
  permissions?: string[] // Permission IDs
  is_active?: boolean
}

interface UpdateRoleBody {
  name?: string
  description?: string
  permissions?: string[] // Permission IDs
  is_active?: boolean
}

interface PaginationOptions {
  page?: number
  limit?: number
  search?: string
}

const roleService = {
  /**
   * Create a new permission
   * @param permissionData Permission data
   * @returns Created permission
   */
  createPermission: async (permissionData: CreatePermissionBody) => {
    // Check if permission already exists
    const existingPermission = await databaseServices.permissions.findOne({
      name: permissionData.name
    })

    if (existingPermission) {
      throw new ErrorWithStatus({
        message: 'Permission with this name already exists',
        status: HTTP_STATUS.CONFLICT
      })
    }

    // Create new permission
    const newPermission = new Permission({
      ...permissionData,
      created_at: new Date()
    })

    // Insert permission into database
    const result = await databaseServices.permissions.insertOne(newPermission as any)

    return {
      _id: result.insertedId,
      ...permissionData
    }
  },

  /**
   * Get all permissions with pagination
   * @param options Pagination options
   * @returns Paginated list of permissions
   */
  getPermissions: async (options: PaginationOptions = {}) => {
    const { page = 1, limit = 10, search = '' } = options
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ]
    }

    // Get total count for pagination
    const total = await databaseServices.permissions.countDocuments(query)

    // Get permissions
    const permissions = await databaseServices.permissions
      .find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return {
      data: permissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  },

  /**
   * Get a single permission by ID
   * @param id Permission ID
   * @returns Permission
   */
  getPermissionById: async (id: string) => {
    try {
      const objId = new ObjectId(id)
      const permission = await databaseServices.permissions.findOne({ _id: objId })

      if (!permission) {
        throw new ErrorWithStatus({
          message: 'Permission not found',
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      return permission
    } catch (error) {
      if (error instanceof ErrorWithStatus) throw error

      throw new ErrorWithStatus({
        message: 'Invalid permission ID',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
  },

  /**
   * Update a permission
   * @param id Permission ID
   * @param updateData Permission update data
   * @returns Updated permission
   */
  updatePermission: async (id: string, updateData: UpdatePermissionBody) => {
    try {
      const objId = new ObjectId(id)

      // Check if permission exists
      const permission = await databaseServices.permissions.findOne({ _id: objId })
      if (!permission) {
        throw new ErrorWithStatus({
          message: 'Permission not found',
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      // If updating name, check if new name already exists for another permission
      if (updateData.name && updateData.name !== permission.name) {
        const existingWithName = await databaseServices.permissions.findOne({
          _id: { $ne: objId },
          name: updateData.name
        })

        if (existingWithName) {
          throw new ErrorWithStatus({
            message: 'Permission with this name already exists',
            status: HTTP_STATUS.CONFLICT
          })
        }
      }

      // Update permission
      const updateResult = await databaseServices.permissions.findOneAndUpdate(
        { _id: objId },
        {
          $set: {
            ...updateData,
            updated_at: new Date()
          }
        },
        { returnDocument: 'after' }
      )

      if (!updateResult.value) {
        throw new ErrorWithStatus({
          message: 'Failed to update permission',
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        })
      }

      return updateResult.value
    } catch (error) {
      if (error instanceof ErrorWithStatus) throw error

      throw new ErrorWithStatus({
        message: 'Invalid permission ID',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
  },

  /**
   * Delete a permission
   * @param id Permission ID
   * @returns Deleted permission
   */
  deletePermission: async (id: string) => {
    try {
      const objId = new ObjectId(id)

      // Check if permission exists
      const permission = await databaseServices.permissions.findOne({ _id: objId })
      if (!permission) {
        throw new ErrorWithStatus({
          message: 'Permission not found',
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      // Check if permission is used by any roles
      const rolesUsingPermission = await databaseServices.roles.findOne({
        permissions: objId
      })

      if (rolesUsingPermission) {
        throw new ErrorWithStatus({
          message: 'Cannot delete permission because it is used by one or more roles',
          status: HTTP_STATUS.CONFLICT
        })
      }

      // Delete permission
      const deleteResult = await databaseServices.permissions.findOneAndDelete({ _id: objId })

      if (!deleteResult.value) {
        throw new ErrorWithStatus({
          message: 'Failed to delete permission',
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        })
      }

      return deleteResult.value
    } catch (error) {
      if (error instanceof ErrorWithStatus) throw error

      throw new ErrorWithStatus({
        message: 'Invalid permission ID',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
  },

  /**
   * Create a new role
   * @param roleData Role data
   * @returns Created role
   */
  createRole: async (roleData: CreateRoleBody) => {
    // Check if role already exists
    const existingRole = await databaseServices.roles.findOne({
      name: roleData.name
    })

    if (existingRole) {
      throw new ErrorWithStatus({
        message: 'Role with this name already exists',
        status: HTTP_STATUS.CONFLICT
      })
    }

    // Convert permission string IDs to ObjectIds
    let permissionIds: ObjectId[] = []
    if (roleData.permissions && roleData.permissions.length > 0) {
      // Verify all permissions exist
      const permissionObjectIds = roleData.permissions.map((id) => new ObjectId(id))
      const existingPermissions = await databaseServices.permissions
        .find({
          _id: { $in: permissionObjectIds }
        })
        .toArray()

      if (existingPermissions.length !== roleData.permissions.length) {
        throw new ErrorWithStatus({
          message: 'Some permission IDs are invalid',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      permissionIds = permissionObjectIds
    }

    // Create new role
    const newRole = new Role({
      name: roleData.name,
      description: roleData.description,
      permissions: permissionIds,
      is_active: roleData.is_active ?? true,
      created_at: new Date()
    })

    // Insert role into database
    const result = await databaseServices.roles.insertOne(newRole)

    return {
      _id: result.insertedId,
      name: roleData.name,
      description: roleData.description,
      permissions: permissionIds,
      is_active: roleData.is_active ?? true
    }
  },

  /**
   * Get all roles with pagination
   * @param options Pagination options
   * @returns Paginated list of roles
   */
  getRoles: async (options: PaginationOptions = {}) => {
    const { page = 1, limit = 10, search = '' } = options
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}
    if (search) {
      query.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }]
    }

    // Get total count for pagination
    const total = await databaseServices.roles.countDocuments(query)

    // Get roles with their permissions
    const roles = await databaseServices.roles.find(query).sort({ name: 1 }).skip(skip).limit(limit).toArray()

    // Get all permission IDs from roles
    const permissionIds = roles.reduce((ids: ObjectId[], role) => {
      if (role.permissions && role.permissions.length) {
        return [...ids, ...role.permissions]
      }
      return ids
    }, [])

    // Get permissions if there are any
    let permissionsMap: { [key: string]: any } = {}
    if (permissionIds.length > 0) {
      const permissions = await databaseServices.permissions.find({ _id: { $in: permissionIds } }).toArray()

      permissionsMap = permissions.reduce((map: { [key: string]: any }, permission) => {
        map[permission._id.toString()] = permission
        return map
      }, {})
    }

    // Add permission details to roles
    const rolesWithPermissions = roles.map((role) => {
      const permissionDetails = role.permissions ? role.permissions.map((id) => permissionsMap[id.toString()]) : []

      return {
        ...role,
        permissionDetails
      }
    })

    return {
      data: rolesWithPermissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  },

  /**
   * Get a single role by ID
   * @param id Role ID
   * @returns Role with permission details
   */
  getRoleById: async (id: string) => {
    try {
      const objId = new ObjectId(id)
      const role = await databaseServices.roles.findOne({ _id: objId })

      if (!role) {
        throw new ErrorWithStatus({
          message: 'Role not found',
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      // Get permission details if role has permissions
      let permissionDetails: any[] = []
      if (role.permissions && role.permissions.length > 0) {
        permissionDetails = await databaseServices.permissions.find({ _id: { $in: role.permissions } }).toArray()
      }

      return {
        ...role,
        permissionDetails
      }
    } catch (error) {
      if (error instanceof ErrorWithStatus) throw error

      throw new ErrorWithStatus({
        message: 'Invalid role ID',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
  },

  /**
   * Update a role
   * @param id Role ID
   * @param updateData Role update data
   * @returns Updated role
   */
  updateRole: async (id: string, updateData: UpdateRoleBody) => {
    try {
      const objId = new ObjectId(id)

      // Check if role exists
      const role = await databaseServices.roles.findOne({ _id: objId })
      if (!role) {
        throw new ErrorWithStatus({
          message: 'Role not found',
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      // If updating name, check if new name already exists for another role
      if (updateData.name && updateData.name !== role.name) {
        const existingWithName = await databaseServices.roles.findOne({
          _id: { $ne: objId },
          name: updateData.name
        })

        if (existingWithName) {
          throw new ErrorWithStatus({
            message: 'Role with this name already exists',
            status: HTTP_STATUS.CONFLICT
          })
        }
      }

      // Convert permission string IDs to ObjectIds if provided
      let permissionIds: ObjectId[] | undefined = undefined
      if (updateData.permissions) {
        // Verify all permissions exist
        permissionIds = updateData.permissions.map((id) => new ObjectId(id))
        const existingPermissions = await databaseServices.permissions
          .find({
            _id: { $in: permissionIds }
          })
          .toArray()

        if (existingPermissions.length !== updateData.permissions.length) {
          throw new ErrorWithStatus({
            message: 'Some permission IDs are invalid',
            status: HTTP_STATUS.BAD_REQUEST
          })
        }
      }

      // Prepare update data
      const updateFields: any = {
        ...updateData,
        permissions: permissionIds,
        updated_at: new Date()
      }

      // Remove undefined fields
      Object.keys(updateFields).forEach((key) => {
        if (updateFields[key] === undefined) {
          delete updateFields[key]
        }
      })

      // Update role
      const updateResult = await databaseServices.roles.findOneAndUpdate(
        { _id: objId },
        { $set: updateFields },
        { returnDocument: 'after' }
      )

      if (!updateResult.value) {
        throw new ErrorWithStatus({
          message: 'Failed to update role',
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        })
      }

      // Get permission details
      let permissionDetails: any[] = []
      if (updateResult.value.permissions && updateResult.value.permissions.length > 0) {
        permissionDetails = await databaseServices.permissions
          .find({ _id: { $in: updateResult.value.permissions } })
          .toArray()
      }

      return {
        ...updateResult.value,
        permissionDetails
      }
    } catch (error) {
      if (error instanceof ErrorWithStatus) throw error

      throw new ErrorWithStatus({
        message: 'Invalid role ID',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
  },

  /**
   * Delete a role
   * @param id Role ID
   * @returns Deleted role
   */
  deleteRole: async (id: string) => {
    try {
      const objId = new ObjectId(id)

      // Check if role exists
      const role = await databaseServices.roles.findOne({ _id: objId })
      if (!role) {
        throw new ErrorWithStatus({
          message: 'Role not found',
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      // Check if role is assigned to any users
      const usersWithRole = await databaseServices.users.findOne({
        roles: objId
      })

      if (usersWithRole) {
        throw new ErrorWithStatus({
          message: 'Cannot delete role because it is assigned to one or more users',
          status: HTTP_STATUS.CONFLICT
        })
      }

      // Delete role
      const deleteResult = await databaseServices.roles.findOneAndDelete({ _id: objId })

      if (!deleteResult.value) {
        throw new ErrorWithStatus({
          message: 'Failed to delete role',
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        })
      }

      return deleteResult.value
    } catch (error) {
      if (error instanceof ErrorWithStatus) throw error

      throw new ErrorWithStatus({
        message: 'Invalid role ID',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
  },

  /**
   * Add permissions to a role
   * @param roleId Role ID
   * @param permissionIds Permission IDs to add
   * @returns Updated role
   */
  addPermissionsToRole: async (roleId: string, permissionIds: string[]) => {
    const objRoleId = new ObjectId(roleId)

    // Check if role exists
    const role = await databaseServices.roles.findOne({ _id: objRoleId })
    if (!role) {
      throw new ErrorWithStatus({
        message: 'Role not found',
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Convert permission IDs to ObjectIds
    const permissionObjectIds = permissionIds.map((id) => new ObjectId(id))

    // Verify all permissions exist
    const existingPermissions = await databaseServices.permissions
      .find({
        _id: { $in: permissionObjectIds }
      })
      .toArray()

    if (existingPermissions.length !== permissionIds.length) {
      throw new ErrorWithStatus({
        message: 'Some permission IDs are invalid',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Get current permissions and add new ones without duplicates
    const currentPermissions = role.permissions || []
    const newPermissions = [
      ...currentPermissions,
      ...permissionObjectIds.filter((id) => !currentPermissions.some((p) => p.toString() === id.toString()))
    ]

    // Update role with new permissions
    await databaseServices.roles.updateOne(
      { _id: objRoleId },
      {
        $set: {
          permissions: newPermissions,
          updated_at: new Date()
        }
      }
    )

    // Get updated role
    const updatedRole = await databaseServices.roles.findOne({ _id: objRoleId })
    return updatedRole
  }
}

export default roleService
