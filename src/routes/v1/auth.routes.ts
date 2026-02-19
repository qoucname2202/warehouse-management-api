import express from 'express'
import authController from '~/controllers/auth.controller'
import { wrapRequestHandler } from '~/utils/handeler'
import {
  logoutAllValidator,
  logoutValidator,
  registerValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailOTPValidator,
  resendOTPValidator,
  changePasswordValidator,
  refreshTokenValidator,
  validateTokenValidator,
  loginValidator
} from '~/validation/auth.validation'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { adminMiddleware } from '~/middlewares/admin.middleware'
import { proStatusAssignmentValidator, roleAssignmentValidator } from '~/validation/admin.validation'

const authRouter = express.Router()

/**
 * @route POST /register
 * @description Register a new user with role selection (student or teacher)
 * @access Public
 * @param {Object} req.body - User registration data
 * @param {string} req.body.full_name - User's full name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {string} req.body.confirm_password - Password confirmation
 * @param {string} req.body.role - User role (student or teacher)
 * @param {string} req.body.date_of_birth - User's date of birth
 * @returns {Object} 201 - Success response with user data and tokens
 * @returns {Object} 400 - Bad request (Missing fields, invalid input)
 * @returns {Object} 409 - Conflict (Email or username already exists)
 * @returns {Object} 422 - Unprocessable entity (Invalid input)
 * @returns {Object} 500 - Internal server error
 */
authRouter.post('/register', registerValidator, wrapRequestHandler(authController.register))

/**
 * @route POST /login
 * @description Authenticate user with email and password. Verifies account based on role
 * (students must have verified email, teachers must be approved by admin).
 * @summary Logs in a user and returns an access token & refresh token.
 * @access Public
 * @param {Object} req.body - User login credentials
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @returns {Object} 200 - Success response with access & refresh tokens
 * @returns {Object} 400 - Bad request (Missing fields, invalid input)
 * @returns {Object} 401 - Unauthorized (Invalid email/password, unverified account, or teacher not approved)
 * @returns {Object} 422 - Unprocessable entity (Invalid input)
 * @returns {Object} 500 - Internal server error
 */
authRouter.post('/login', loginValidator, wrapRequestHandler(authController.login))

/**
 * @route POST /logout
 * @description Logs out a user by invalidating their refresh token
 * @access Public
 * @param {Object} req.body - Logout data
 * @param {string} req.body.refresh_token - User's refresh token (optional if in cookies)
 * @returns {Object} 200 - Success response
 * @returns {Object} 400 - Bad request (Missing token)
 * @returns {Object} 401 - Unauthorized (Invalid token)
 * @returns {Object} 404 - Not found (Token not found)
 * @returns {Object} 500 - Internal server error
 */
authRouter.post('/logout', logoutValidator, wrapRequestHandler(authController.logout))

/**
 * @route POST /logout-all
 * @description Logs out a user from all devices by removing all refresh tokens
 * @access Private - Requires authentication
 * @returns {Object} 200 - Success response
 * @returns {Object} 401 - Unauthorized (Not authenticated)
 * @returns {Object} 500 - Internal server error
 */
authRouter.post('/logout-all', authMiddleware, logoutAllValidator, wrapRequestHandler(authController.logoutAllDevices))

/**
 * @route POST /forgot-password
 * @description Send password reset link to user's email
 * @access Public
 * @param {Object} req.body - Request data
 * @param {string} req.body.email - User's email address
 * @returns {Object} 200 - Success response
 * @returns {Object} 400 - Bad request (Missing fields, invalid input)
 * @returns {Object} 404 - Not found (Email not found)
 * @returns {Object} 422 - Unprocessable entity (Invalid input)
 * @returns {Object} 500 - Internal server error
 */
authRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(authController.forgotPassword))
/**
 * @route POST /verify-reset-otp
 * @description Verify password reset OTP
 * @access Public
 * @param {Object} req.body - Request body
 * @param {string} req.body.otp - Reset OTP
 * @param {string} req.body.email - User's email
 * @returns {Object} 200 - Success response
 * @returns {Object} 400 - Bad request (Invalid OTP)
 * @returns {Object} 500 - Internal server error
 */
authRouter.post('/verify-reset-otp', wrapRequestHandler(authController.verifyResetOTP))

/**
 * @route POST /reset-password
 * @description Reset user password with OTP
 * @access Public
 * @param {Object} req.body - Request data
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - New password
 * @param {string} req.body.confirm_password - Confirm new password
 * @returns {Object} 200 - Success response
 * @returns {Object} 400 - Bad request (Invalid OTP, passwords don't match, new password same as old password)
 * @returns {Object} 422 - Unprocessable entity (Invalid input)
 * @returns {Object} 500 - Internal server error
 */
authRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(authController.resetPassword))

/**
 * @route POST /verify-email
 * @description Verify user's email with OTP
 * @access Public
 * @param {Object} req.body - Request data
 * @param {string} req.body.otp - Email verification OTP
 * @param {string} req.body.email - User's email
 * @returns {Object} 200 - Success response
 * @returns {Object} 400 - Bad request (Invalid OTP)
 * @returns {Object} 422 - Unprocessable entity (Invalid input)
 * @returns {Object} 500 - Internal server error
 */
authRouter.post('/verify-email', verifyEmailOTPValidator, wrapRequestHandler(authController.verifyEmailOTP))

/**
 * @route POST /resend-otp
 * @description Resend OTP for email verification or password reset
 * @access Public
 * @param {Object} req.body - Request data
 * @param {string} req.body.email - User's email
 * @param {string} [req.body.type] - OTP type ('email_verification' or 'password_reset')
 * @returns {Object} 200 - Success response
 * @returns {Object} 400 - Bad request (Invalid email)
 * @returns {Object} 404 - Not found (User not found)
 * @returns {Object} 422 - Unprocessable entity (Invalid input)
 * @returns {Object} 500 - Internal server error
 */
authRouter.post('/resend-otp', resendOTPValidator, wrapRequestHandler(authController.resendOTP))

/**
 * @route POST /change-password
 * @description Change user's password (requires authentication)
 * @access Private - Requires authentication
 * @param {Object} req.body - Request data
 * @param {string} req.body.current_password - User's current password
 * @param {string} req.body.new_password - User's new password
 * @param {string} req.body.confirm_password - Confirmation of new password
 * @returns {Object} 200 - Success response
 * @returns {Object} 400 - Bad request (Invalid passwords)
 * @returns {Object} 401 - Unauthorized (Not authenticated)
 * @returns {Object} 422 - Unprocessable entity (Invalid input)
 * @returns {Object} 500 - Internal server error
 */
authRouter.post(
  '/change-password',
  authMiddleware,
  changePasswordValidator,
  wrapRequestHandler(authController.changePassword)
)

/**
 * @route POST /refresh-token
 * @description Refresh access and refresh tokens using a valid refresh token
 * @access Public
 * @param {Object} req.body - Request data
 * @param {string} req.body.refresh_token - User's refresh token (optional if in cookies)
 * @returns {Object} 200 - Success response with new tokens
 * @returns {Object} 400 - Bad request (Missing token)
 * @returns {Object} 401 - Unauthorized (Invalid token)
 * @returns {Object} 404 - Not found (Token not found)
 * @returns {Object} 500 - Internal server error
 */
authRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(authController.refreshToken))

/**
 * @route POST /validate-token
 * @description Validate a token and check its expiration status
 * @access Public
 * @param {Object} req.body - Request data
 * @param {string} req.body.token - Token to validate
 * @param {string} req.body.token_type - Type of token ('access_token' or 'refresh_token')
 * @returns {Object} 200 - Success response with token validation result
 * @returns {Object} 400 - Bad request (Invalid token)
 * @returns {Object} 401 - Unauthorized (Expired token)
 * @returns {Object} 422 - Unprocessable entity (Validation failed)
 * @returns {Object} 500 - Internal server error
 */
authRouter.post('/validate-token', validateTokenValidator, wrapRequestHandler(authController.validateToken))

/**
 * @route POST /admin/assign-role
 * @description Assign admin role to a user
 * @access Private - Requires admin authentication
 * @param {Object} req.body - Request data
 * @param {string} req.body.target_user_id - ID of the user to be made admin
 * @returns {Object} 200 - Success response
 * @returns {Object} 400 - Bad request (Invalid input)
 * @returns {Object} 401 - Unauthorized (Not authenticated)
 * @returns {Object} 403 - Forbidden (Not an admin)
 * @returns {Object} 404 - Not found (User not found)
 * @returns {Object} 422 - Unprocessable entity (Validation failed)
 * @returns {Object} 500 - Internal server error
 */
authRouter.post(
  '/admin/assign-role',
  authMiddleware,
  adminMiddleware,
  roleAssignmentValidator,
  wrapRequestHandler(authController.assignAdminRole)
)

/**
 * @route POST /admin/set-pro
 * @description Set a user as a pro user
 * @access Private - Requires admin authentication
 * @param {Object} req.body - Request data
 * @param {string} req.body.target_user_id - ID of the user to be made pro
 * @returns {Object} 200 - Success response
 * @returns {Object} 400 - Bad request (Invalid input)
 * @returns {Object} 401 - Unauthorized (Not authenticated)
 * @returns {Object} 403 - Forbidden (Not an admin)
 * @returns {Object} 404 - Not found (User not found)
 * @returns {Object} 422 - Unprocessable entity (Validation failed)
 * @returns {Object} 500 - Internal server error
 */
authRouter.post(
  '/admin/set-pro',
  authMiddleware,
  adminMiddleware,
  proStatusAssignmentValidator,
  wrapRequestHandler(authController.setUserAsPro)
)

export default authRouter
