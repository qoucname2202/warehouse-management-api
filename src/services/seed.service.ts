import { UserRole } from '~/constants/enums'
import { Permission } from '~/models/Permission.schema'
import { Role } from '~/models/Role.schema'
import logger from '~/utils/logger'
import { databaseServices } from './database.service'

/**
 * Initialize default permissions
 * @returns Array of created permission IDs
 */
const seedPermissions = async () => {
  // Check if permissions already exist
  const existingPermissions = await databaseServices.permissions.find().toArray()
  if (existingPermissions.length > 0) {
    logger.info(`Found ${existingPermissions.length} existing permissions, skipping permission seeding`)
    return existingPermissions.map((p) => p._id)
  }

  // Define default permissions
  const defaultPermissions = [
    // User permissions
    {
      name: 'read:own:profile',
      action: 'read',
      subject: 'User',
      conditions: { ownResource: true }
    },
    {
      name: 'update:own:profile',
      action: 'update',
      subject: 'User',
      conditions: { ownResource: true }
    },

    // Admin permissions
    {
      name: 'read:any:user',
      action: 'read',
      subject: 'User',
      conditions: {}
    },
    {
      name: 'create:any:user',
      action: 'create',
      subject: 'User',
      conditions: {}
    },
    {
      name: 'update:any:user',
      action: 'update',
      subject: 'User',
      conditions: {}
    },
    {
      name: 'delete:any:user',
      action: 'delete',
      subject: 'User',
      conditions: {}
    },

    // Role permissions
    {
      name: 'manage:roles',
      action: 'manage',
      subject: 'Role',
      conditions: {}
    },

    // Permission permissions
    {
      name: 'manage:permissions',
      action: 'manage',
      subject: 'Permission',
      conditions: {}
    },
    {
      name: 'read:any:permission',
      action: 'read',
      subject: 'Permission',
      conditions: {}
    },
    {
      name: 'update:any:permission',
      action: 'update',
      subject: 'Permission',
      conditions: {}
    },
    {
      name: 'delete:any:permission',
      action: 'delete',
      subject: 'Permission',
      conditions: {}
    },
    {
      name: 'read:any:role',
      action: 'read',
      subject: 'Role',
      conditions: {}
    },
    {
      name: 'update:any:role',
      action: 'update',
      subject: 'Role',
      conditions: {}
    },
    {
      name: 'delete:any:role',
      action: 'delete',
      subject: 'Role',
      conditions: {}
    }
  ]

  // Insert permissions
  const permissionDocs = defaultPermissions.map(
    (p) =>
      new Permission({
        ...p,
        created_at: new Date()
      })
  )

  try {
    const result = await databaseServices.permissions.insertMany(permissionDocs)
    logger.info(`Created ${result.insertedCount} default permissions`)
    return Object.values(result.insertedIds)
  } catch (error) {
    logger.error('Error seeding permissions:', error)
    return []
  }
}

/**
 * Initialize default roles
 */
const seedRoles = async () => {
  // Check if roles already exist
  const existingRoles = await databaseServices.roles.find().toArray()
  if (existingRoles.length > 0) {
    logger.info(`Found ${existingRoles.length} existing roles, skipping role seeding`)
    return
  }

  // Get all permissions
  const permissions = await databaseServices.permissions.find().toArray()

  // Define default roles with permissions
  const adminPermissions = permissions.map((p) => p._id)
  const studentPermissions = permissions
    .filter((p) => p.name.startsWith('read:own') || p.name.startsWith('update:own'))
    .map((p) => p._id)

  const defaultRoles = [
    {
      name: UserRole.Admin,
      description: 'Administrator with full access',
      permissions: adminPermissions,
      is_active: true
    },
    {
      name: UserRole.Student,
      description: 'Student with limited access to own resources',
      permissions: studentPermissions,
      is_active: true
    },
    {
      name: UserRole.Instructor,
      description: 'Instructor with access to courses and students',
      permissions: studentPermissions,
      is_active: true
    },
    {
      name: UserRole.Guest,
      description: 'Guest with minimal access',
      permissions: permissions.filter((p) => p.name === 'read:own:profile').map((p) => p._id),
      is_active: true
    }
  ]

  // Insert roles
  const roleDocs = defaultRoles.map(
    (r) =>
      new Role({
        ...r,
        created_at: new Date()
      })
  )

  try {
    const result = await databaseServices.roles.insertMany(roleDocs)
    logger.info(`Created ${result.insertedCount} default roles`)
  } catch (error) {
    logger.error('Error seeding roles:', error)
  }
}

/**
 * Initialize database with default roles and permissions
 */
export const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...')
    await seedPermissions()
    await seedRoles()
    logger.info('Database seeding completed')
  } catch (error) {
    logger.error('Error during database seeding:', error)
  }
}
