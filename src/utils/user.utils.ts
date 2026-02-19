import HttpStatusCode from '~/constants/httpStatus'
import { MESSAGE } from '~/constants/message'
import { ErrorWithStatus } from '~/errors/Errors'
import { User } from '~/models/User.schema'
import { databaseServices } from '~/services/database.service'

/**
 * Constants for user projection during login
 * Define required fields to minimize data transfer
 */
export const LOGIN_USER_PROJECTION = {
  _id: 1,
  email: 1,
  username: 1,
  password: 1, // Required for validation
  full_name: 1,
  roles: 1,
  verify: 1,
  is_approved: 1,
  is_removed: 1,
  avatar: 1
}

/**
 * Find user by email with optimized projection
 * Uses indexing for optimal performance with large datasets
 *
 * @param email - Normalized email to search for
 * @returns User document if found
 * @throws ErrorWithStatus if user not found
 */
export const findUserByEmail = async (email: string): Promise<User> => {
  // Only retrieve fields needed for login process
  // This significantly reduces data transfer for large user objects
  const user = await databaseServices.users.findOne(
    { email },
    {
      projection: LOGIN_USER_PROJECTION
    }
  )

  if (!user) {
    // Use generic message to avoid email enumeration
    throw new ErrorWithStatus({
      message: MESSAGE.AUTH.LOGIN.INVALID_CREDENTIALS,
      status: HttpStatusCode.UN_AUTHORIZED
    })
  }
  return user
}
