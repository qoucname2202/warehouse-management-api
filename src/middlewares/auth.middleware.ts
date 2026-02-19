import { Request, Response, NextFunction } from 'express'
import { TokenType } from '~/constants/enums'
import { ErrorWithStatus } from '~/errors/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { MESSAGE } from '~/constants/message'

import { ObjectId } from 'mongodb'
import tokenService from '~/services/token.service'
import { databaseServices } from '~/services/database.service'

// Extend Express Request type to include user property and file from multer
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email?: string
    roles?: ObjectId[]
    permissions?: string[]
  }
  file?: Express.Multer.File
}

/**
 * Authentication middleware to verify the user is logged in and set user information in request
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization

    // Check if the authorization header exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ErrorWithStatus({
        message: MESSAGE.TOKEN.ACCESS_REQUIRED,
        status: HTTP_STATUS.UN_AUTHORIZED
      })
    }

    // Get the token from the authorization header
    const accessToken = authHeader.split(' ')[1]

    // Validate the token
    const validationResult = await tokenService.validateToken(accessToken, TokenType.AccessToken)

    if (!validationResult.valid) {
      if (validationResult.expired) {
        throw new ErrorWithStatus({
          message: MESSAGE.AUTH.VALIDATION.TOKEN.EXPIRED,
          status: HTTP_STATUS.UN_AUTHORIZED
        })
      } else {
        throw new ErrorWithStatus({
          message: validationResult.error || MESSAGE.TOKEN.INVALID_ACCESS_TOKEN,
          status: HTTP_STATUS.UN_AUTHORIZED
        })
      }
    }

    // Get the user ID from the validated payload
    const userId = validationResult.payload?.sub

    if (!userId) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.VALIDATION.USER_ID.MISSING,
        status: HTTP_STATUS.UN_AUTHORIZED
      })
    }

    // Find the user in the database
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(userId),
      is_removed: false // Only active users can authenticate
    })

    // Check if the user exists
    if (!user) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Set the user on the request object
    ;(req as AuthenticatedRequest).user = {
      id: user._id.toString(),
      email: user.email,
      roles: user.roles
    }

    // Continue to the next middleware
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Authentication middleware that optionally checks if the user is logged in
 * Does not throw an error if the user is not logged in
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization

    // If no auth header is provided, continue without verification
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next()
    }

    // Get the token from the authorization header
    const accessToken = authHeader.split(' ')[1]

    try {
      // Validate the token
      const validationResult = await tokenService.validateToken(accessToken, TokenType.AccessToken)

      // If the token is invalid or expired, just continue without setting user
      if (!validationResult.valid || !validationResult.payload) {
        return next()
      }

      // Get the user ID from the token
      const userId = validationResult.payload.sub

      // Find the user in the database
      const user = await databaseServices.users.findOne({
        _id: new ObjectId(userId),
        is_removed: false // Only active users
      })

      // If user is found, set user on the request object
      if (user) {
        ;(req as AuthenticatedRequest).user = {
          id: user._id.toString(),
          email: user.email,
          roles: user.roles
        }
      }
    } catch (error) {
      // If token validation fails, just continue without setting user
    }

    // Continue to the next middleware
    next()
  } catch (error) {
    next(error)
  }
}
