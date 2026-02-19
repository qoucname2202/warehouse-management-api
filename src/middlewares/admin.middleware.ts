import { Request, Response, NextFunction } from 'express'
import { ErrorWithStatus } from '~/errors/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { MESSAGE } from '~/constants/message'
import { AuthenticatedRequest } from './auth.middleware'

import { ObjectId } from 'mongodb'
import { UserRole } from '~/constants/enums'
import { databaseServices } from '~/services/database.service'

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id

    if (!userId) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.VALIDATION.USER_ID.MISSING,
        status: HTTP_STATUS.UN_AUTHORIZED
      })
    }

    // Find user with their roles
    const user = await databaseServices.users.findOne({ _id: new ObjectId(userId) })

    if (!user) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Find the admin role
    const adminRole = await databaseServices.roles.findOne({ name: UserRole.Admin }, { projection: { _id: 1 } })

    if (!adminRole) {
      throw new ErrorWithStatus({
        message: 'Admin role not found in system',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }

    // Check if user has admin role
    const hasAdminRole = user.roles?.some((role) => role.toString() === adminRole._id.toString())

    if (!hasAdminRole) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.UNAUTHORIZED_ROLE_ASSIGNMENT,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // User has admin role, continue to the next middleware
    next()
  } catch (error) {
    next(error)
  }
}
