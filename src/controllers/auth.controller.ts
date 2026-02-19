import { ResponseMessage } from '~/config/reponse.config'
import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { MESSAGE } from '~/constants/message'
import authService from '~/services/auth.service'
import HTTP_STATUS from '~/constants/httpStatus'
import { AuthenticatedRequest } from '~/middlewares/auth.middleware'
import { ErrorWithStatus } from '~/errors/Errors'
import { LoginDto, ProStatusAssignmentDto, RegisterDto, ResetPasswordDto, RoleAssignmentDto } from '~/dtos/Auth.dto'
import { TokenType } from '~/constants/enums'

const authController = {
  /**
   * @function registerController
   * @description Handles user registration with Rule-Based Access Control (RBAC)
   * @route POST /api/v1/auth/register
   * @access Public
   */
  register: async (req: Request<ParamsDictionary, any, RegisterDto>, res: Response, next: NextFunction) => {
    const result = await authService.register(req.body)
    return ResponseMessage.created(res, result, MESSAGE.AUTH.REGISTER.SUCCESS)
  },

  /**
   * @function loginController
   * @description Handles login requests, validates input, and returns a signed JWT token.
   * @route POST /api/v1/auth/login
   * @access Public
   */
  login: async (req: Request<ParamsDictionary, any, LoginDto>, res: Response, next: NextFunction) => {
    const result = await authService.login(req.body)
    return ResponseMessage.created(res, result, MESSAGE.AUTH.LOGIN.SUCCESS)
  },

  /**
   * @function logoutController
   * @description Logout a user by invalidating their refresh token
   * @route POST /api/v1/auth/logout
   * @access Public
   */
  logout: async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies?.refresh_token || req.body?.refresh_token

    if (!refreshToken) {
      return next(
        new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: MESSAGE.AUTH.VALIDATION.TOKEN.MISSING
        })
      )
    }

    await authService.logout(refreshToken)

    // Clear token cookies if present
    if (req.cookies?.refresh_token) res.clearCookie('refresh_token')
    if (req.cookies?.access_token) res.clearCookie('access_token')

    // Use unified success response format
    return ResponseMessage.success(res, null, MESSAGE.AUTH.LOGOUT.SUCCESS)
  },

  /**
   * Logout a user from all devices
   * @route POST /logout-all
   * @access Private - Requires authentication
   */
  logoutAllDevices: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // At this point, authMiddleware has guaranteed that req.user exists and has an ID
      const userId = req.user?.id

      if (!userId) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UN_AUTHORIZED,
          message: MESSAGE.AUTH.VALIDATION.USER_ID.MISSING
        })
      }

      await authService.logoutFromAllDevices(userId)

      // Clear cookies
      res.clearCookie('refresh_token')
      res.clearCookie('access_token')

      return ResponseMessage.success(res, null, MESSAGE.AUTH.LOGOUT.ALL_DEVICES_SUCCESS)
    } catch (error) {
      next(error)
    }
  },

  /**
   * Forgot password - send reset link
   * @route POST /forgot-password
   * @access Public
   */
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    await authService.forgotPassword(req.body)
    return ResponseMessage.success(res, null, MESSAGE.AUTH.PASSWORD.FORGOT.SUCCESS)
  },

  /**
   * Verify password reset OTP
   * @route POST /verify-reset-otp
   * @access Public
   */
  verifyResetOTP: async (req: Request, res: Response, next: NextFunction) => {
    const { otp, email } = req.body

    if (!otp || !email) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'OTP and email are required'
      })
    }

    await authService.verifyPasswordResetOTP(otp, email)
    return ResponseMessage.success(res, null, MESSAGE.AUTH.PASSWORD.FORGOT.VERIFY)
  },

  /**
   * Reset password with token
   * @route POST /reset-password
   * @access Public
   */
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    const resetPasswordData = req.body as ResetPasswordDto

    // Attempt to reset the password
    await authService.resetPassword(resetPasswordData)

    // Return success response
    return ResponseMessage.success(res, null, MESSAGE.AUTH.PASSWORD.RESET.SUCCESS)
  },

  /**
   * Verify email OTP for account activation
   * @route POST /verify-email-otp
   * @access Public
   */
  verifyEmailOTP: async (req: Request, res: Response, next: NextFunction) => {
    const { otp, email } = req.body

    if (!otp || !email) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'OTP and email are required'
      })
    }

    await authService.verifyOTP(otp, email)
    return ResponseMessage.success(res, null, MESSAGE.AUTH.VERIFY_EMAIL.SUCCESS)
  },

  /**
   * Resend OTP for email verification or password reset
   * @route POST /resend-otp
   * @access Public
   */
  resendOTP: async (req: Request, res: Response, next: NextFunction) => {
    const { email, type } = req.body

    if (!email) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'Email is required'
      })
    }

    await authService.resendOTP({ email, type })

    // Use appropriate success message based on type
    const successMessage =
      type === 'password_reset' ? MESSAGE.AUTH.PASSWORD.FORGOT.SUCCESS : MESSAGE.AUTH.VERIFY_EMAIL.RESEND_OTP

    return ResponseMessage.success(res, null, successMessage)
  },

  /**
   * Change password when authenticated
   * @route POST /change-password
   * @access Private - Requires authentication
   */
  changePassword: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id

    if (!userId) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UN_AUTHORIZED,
        message: MESSAGE.AUTH.VALIDATION.USER_ID.MISSING
      })
    }

    await authService.changePassword(userId, req.body)
    return ResponseMessage.success(res, null, MESSAGE.AUTH.PASSWORD.CHANGE.SUCCESS)
  },

  /**
   * Refresh access and refresh tokens using a valid refresh token
   * @route POST /refresh-token
   * @access Public
   */
  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    // Get refresh token from request body or cookies
    const refreshToken = req.cookies?.refresh_token || req.body?.refresh_token

    if (!refreshToken) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: MESSAGE.AUTH.VALIDATION.TOKEN.MISSING
      })
    }

    // Use the authService to reissue tokens
    const tokens = await authService.reissueToken(refreshToken)

    // If cookies were used, update them
    if (req.cookies?.refresh_token) {
      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })

      res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
    }

    return ResponseMessage.success(res, tokens, MESSAGE.AUTH.TOKEN.REFRESH_TOKEN.SUCCESS)
  },

  /**
   * Validate a token and check its expiration status
   * @route POST /validate-token
   * @access Public
   */
  validateToken: async (req: Request, res: Response, next: NextFunction) => {
    const { token, token_type } = req.body

    if (!token) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: MESSAGE.AUTH.VALIDATION.TOKEN.MISSING
      })
    }

    // Validate token type
    const tokenType = token_type === 'refresh_token' ? TokenType.RefreshToken : TokenType.AccessToken

    // Use the auth service to validate the token
    const validationResult = await authService.validateToken(token, tokenType)

    if (!validationResult.valid) {
      const status = validationResult.expired
        ? HTTP_STATUS.UN_AUTHORIZED 
        : HTTP_STATUS.BAD_REQUEST

      if (status === HTTP_STATUS.UN_AUTHORIZED) {
        return ResponseMessage.unauthorized(res, null, validationResult.error || MESSAGE.AUTH.VALIDATION.TOKEN.INVALID)
      } else {
        return ResponseMessage.badRequest(res, null, validationResult.error || MESSAGE.AUTH.VALIDATION.TOKEN.INVALID)
      }
    }

    // Return success with validation result
    return ResponseMessage.success(
      res,
      {
        valid: true,
        expired: false,
        user_id: validationResult.payload?.sub,
        email: validationResult.payload?.email,
        token_type: validationResult.payload?.token_type
      },
      'Token is valid'
    )
  },

  /**
   * Assign admin role to a user
   * @route POST /admin/assign-role
   * @access Private - Requires admin authentication
   */
  assignAdminRole: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.id

      if (!adminId) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UN_AUTHORIZED,
          message: MESSAGE.AUTH.VALIDATION.USER_ID.MISSING
        })
      }

      const { target_user_id } = req.body as RoleAssignmentDto

      if (!target_user_id) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Target user ID is required'
        })
      }

      await authService.assignAdminRole(target_user_id, adminId)

      return ResponseMessage.success(res, null, MESSAGE.AUTH.ADMIN_ROLE_ASSIGNED_SUCCESS)
    } catch (error) {
      next(error)
    }
  },

  /**
   * Set a user as a pro user
   * @route POST /admin/set-pro
   * @access Private - Requires admin authentication
   */
  setUserAsPro: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.id

      if (!adminId) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UN_AUTHORIZED,
          message: MESSAGE.AUTH.VALIDATION.USER_ID.MISSING
        })
      }

      const { target_user_id } = req.body as ProStatusAssignmentDto

      if (!target_user_id) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Target user ID is required'
        })
      }

      await authService.setUserAsPro(target_user_id, adminId)

      return ResponseMessage.success(res, null, MESSAGE.AUTH.PRO_STATUS_ASSIGNED_SUCCESS)
    } catch (error) {
      next(error)
    }
  }
}

export default authController
