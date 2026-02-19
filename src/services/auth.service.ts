import { OtpVerifyType, TokenType, UserRole, UserVerifyStatus } from '~/constants/enums'
import { User } from '~/models/User.schema'
import { Otp } from '~/models/Otp.schema'

import { hashPassword, comparePassword } from '~/utils/crypto'
import { generateOTP, encryptOTP, createOTPExpiration, verifyOTP } from '~/utils/otp'
import emailService from './email.service'
import { ErrorWithStatus } from '~/errors/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { generateEmailContent, generatePasswordResetContent } from '~/utils/email'
import { MESSAGE } from '~/constants/message'
import {
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ResendOtpDto,
  ChangePasswordDto,
  LoginDto
} from '~/dtos/Auth.dto'
import { generateUsername, normalizeEmail } from '~/utils/helper'
import { ObjectId } from 'mongodb'
import { UserInfoGenerateToken, UserInfoGenerateTokenAndOtp } from '~/utils/interface/Auth.interface'
import tokenService from './token.service'
import { validateDateString } from '~/utils/date'
import { findUserByEmail } from '~/utils/user.utils'
import { validateAndSanitizeEmail, validateAndSanitizeFullName } from '~/utils/security.validation'
import { databaseServices } from './database.service'

const authService = {
  /**
   * @function register
   * @description Register a new user with role selection (student or teacher)
   * @param {RegisterDto} userData - User registration data
   * @route POST /api/v1/auth/register
   * @access Public
   * @returns {Promise<Object>} Object containing tokens and user information
   * @throws {ErrorWithStatus} If email or username already exists or role not found
   */
  register: async (userData: RegisterDto) => {
    // Validate and sanitize email
    const emailValidation = validateAndSanitizeEmail(userData.email)
    if (!emailValidation.isValid || !emailValidation.sanitizedValue) {
      throw emailValidation.error
    }

    // Validate and sanitize full name
    const fullNameValidation = validateAndSanitizeFullName(userData.full_name)
    if (!fullNameValidation.isValid || !fullNameValidation.sanitizedValue) {
      throw fullNameValidation.error
    }

    const { password, role, date_of_birth } = userData
    const email = emailValidation.sanitizedValue
    const full_name = fullNameValidation.sanitizedValue

    const birthDate = validateDateString(date_of_birth)
    if (date_of_birth && !birthDate) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.VALIDATION.DOB.INVALID_FORMAT,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Get role based on role parameter
    const normalizedRole = (role || '').toLowerCase()
    const roleName: UserRole =
      normalizedRole === UserRole.Instructor.toLowerCase() ? UserRole.Instructor : UserRole.Student

    const userRole = await databaseServices.roles.findOne({ name: roleName }, { projection: { _id: 1 } })

    if (!userRole || !userRole._id) {
      throw new ErrorWithStatus({
        message: `Role ${roleName} not found`,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Create the user with hashed password
    const hashedPassword = hashPassword(password)
    const newUsername = generateUsername(full_name)

    // Set initial verification status based on role
    const verifyStatus = roleName === UserRole.Instructor ? UserVerifyStatus.Verified : UserVerifyStatus.Unverified

    const newUser = new User({
      email,
      full_name,
      username: newUsername,
      password: hashedPassword,
      date_of_birth: birthDate,
      verify: verifyStatus,
      is_approved: false,
      roles: [userRole._id as ObjectId]
    })

    // Insert user into database
    const { insertedId: userId } = await databaseServices.users.insertOne(newUser)

    // Generate tokens
    const userInfo = { userId: userId.toString(), email }
    const { accessToken, refreshToken } = await authService.generateAuthTokens(userInfo)

    // Generate and send OTP for verification for students only
    if (roleName === UserRole.Student) {
      await authService.generateAndSendOTP({ userId: userId.toString(), email, type: OtpVerifyType.EmailVerification })
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        _id: userId,
        username: newUser.username,
        email: newUser.email,
        role: roleName,
        verify: newUser.verify,
        is_approved: newUser.is_approved
      }
    }
  },

  /**
   * @function login
   * @description Handles login requests, validates input, and returns a signed JWT token.
   * @route POST /api/v1/auth/login
   * @access Public
   * @returns {Promise<Object>} Object containing tokens and user information
   * @throws {ErrorWithStatus} If invalid credentials or user not found
   */
  login: async (loginData: LoginDto) => {
    const { email, password } = loginData

    const normalizedEmail = normalizeEmail(email)
    const user = await findUserByEmail(normalizedEmail)

    // Check if user exists
    if (!user || user.is_removed) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.LOGIN.INVALID_CREDENTIALS,
        status: HTTP_STATUS.UN_AUTHORIZED
      })
    }

    // Compare passwords
    const isPasswordValid = comparePassword(password, user.password)
    if (!isPasswordValid) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.LOGIN.INVALID_CREDENTIALS,
        status: HTTP_STATUS.UN_AUTHORIZED
      })
    }

    // Get user's roles
    const roles = user.roles ?? []
    const roleDocs = await databaseServices.roles
      .find(
        {
          _id: { $in: roles }
        },
        { projection: { name: 1 } }
      )
      .toArray()

    const roleNames = roleDocs.map((role) => role.name.toLowerCase())
    const isInstructor = roleNames.includes(UserRole.Instructor.toLowerCase())

    // For students, check if they're verified account
    if (!isInstructor && user.verify !== UserVerifyStatus.Verified) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.LOGIN.ACCOUNT_NOT_VERIFIED,
        status: HTTP_STATUS.UN_AUTHORIZED
      })
    }

    // For instructors, check if they're approved
    if (isInstructor && !user.is_approved) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.LOGIN.ACCOUNT_PENDING_APPROVAL,
        status: HTTP_STATUS.UN_AUTHORIZED
      })
    }

    const userInfo = {
      userId: user._id?.toString() ?? '',
      email: user.email
    }

    const { accessToken, refreshToken } = await authService.generateAuthTokens(userInfo)

    // Update last login timestamp
    await databaseServices.users.updateOne({ _id: user._id }, { $set: { last_login: new Date() } })

    // Return tokens and user info
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        roles: roleNames,
        verify: user.verify,
        is_approved: user.is_approved,
        avatar: user.avatar
      }
    }
  },

  /**
   * Logout a user by invalidating their refresh token
   * @param {string} refreshToken - Refresh token to invalidate
   * @returns {Promise<boolean>} Success status
   * @throws {ErrorWithStatus} If token is invalid or not found
   */
  logout: async (refreshToken: string): Promise<boolean> => {
    if (!refreshToken) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.VALIDATION.TOKEN.MISSING,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    try {
      // Validate the refresh token
      const result = await tokenService.validateToken(refreshToken, TokenType.RefreshToken)

      if (!result.valid) {
        throw new ErrorWithStatus({
          message: result.error || MESSAGE.AUTH.VALIDATION.TOKEN.INVALID,
          status: HTTP_STATUS.UN_AUTHORIZED
        })
      }

      // Invalidate the token - now async
      await tokenService.invalidateToken(refreshToken)

      return true
    } catch (error) {
      if (error instanceof ErrorWithStatus) throw error
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.VALIDATION.TOKEN.INVALID,
        status: HTTP_STATUS.UN_AUTHORIZED
      })
    }
  },

  /**
   * Logout a user from all devices by removing all refresh tokens
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  logoutFromAllDevices: async (userId: string): Promise<boolean> => {
    if (!userId) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.VALIDATION.USER_ID.MISSING,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    try {
      // Invalidate all refresh tokens for the user
      await tokenService.invalidateAllUserRefreshTokens(userId)
      return true
    } catch (error) {
      throw new ErrorWithStatus({
        message: 'Failed to logout from all devices',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }
  },

  /**
   * Generate auth tokens (access and refresh) for a user
   * @param {UserInfoGenerateTokenAndOtp} userData - User data for token generation
   * @returns {Promise<{accessToken: string, refreshToken: string}>} Generated tokens
   */
  generateAuthTokens: async (
    userData: UserInfoGenerateToken
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    const { userId, email } = userData

    // Get user's roles
    const user = await databaseServices.users.findOne({ _id: new ObjectId(userId) })

    if (!user) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Generate access token
    const accessToken = await tokenService.generateAccessToken(userId.toString(), email, user.roles || [])

    // Generate refresh token
    const { token: refreshToken } = await tokenService.generateRefreshToken(userId.toString())

    return { accessToken, refreshToken }
  },

  /**
   * Generate and send OTP for account verification
   * @param {ObjectId} userId - User ID
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  generateAndSendOTP: async (userData: UserInfoGenerateTokenAndOtp): Promise<void> => {
    const { userId, email, type } = userData
    const plainOtp = generateOTP()
    const encryptedOtp = encryptOTP(plainOtp)
    const otpExpiration = createOTPExpiration()
    // Normalize email to prevent case sensitivity issues
    const normalizedEmail = email.trim().toLowerCase()

    // Delete any existing OTPs for this user
    await databaseServices.otps.deleteMany({ user_id: new ObjectId(userId) })

    // Store OTP in database
    const otpDoc = new Otp({
      user_id: new ObjectId(userId),
      code: encryptedOtp,
      expired_at: otpExpiration,
      created_at: new Date(),
      type: type || OtpVerifyType.EmailVerification
    })

    await databaseServices.otps.insertOne(otpDoc)

    // Generate appropriate email content based on type
    let htmlContent: string
    let emailSubject: string

    // Send OTP email to user
    if (type === 'password_reset') {
      htmlContent = await generatePasswordResetContent(plainOtp)
      emailSubject = 'Elearning System Hutech - Password Reset OTP'

      // Send OTP email for password reset
      await emailService.sendEmail(normalizedEmail, emailSubject, htmlContent)
    } else {
      // Default to email verification
      htmlContent = await generateEmailContent(plainOtp)
      emailSubject = 'Elearning System Hutech - Account Verification'

      // Send OTP email for verification
      await emailService.sendOTPEmail(normalizedEmail, emailSubject, htmlContent)
    }
  },

  /**
   * Request a password reset OTP for a user
   * @param {ForgotPasswordDto} forgotPasswordData - User's email
   * @returns {Promise<void>}
   * @throws {ErrorWithStatus} If email not found or other errors occur
   */
  forgotPassword: async (forgotPasswordData: ForgotPasswordDto): Promise<void> => {
    const { email } = forgotPasswordData

    // Normalize email to prevent case sensitivity issues
    const normalizedEmail = email.trim().toLowerCase()

    // Find user by email
    const user = await databaseServices.users.findOne({ email: normalizedEmail })

    if (!user) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Generate a 6-digit OTP code
    const plainOtp = generateOTP()

    // Encrypt OTP before storing in database
    const encryptedOtp = encryptOTP(plainOtp)

    // Set OTP expiration (default is from .env or 15 minutes)
    const otpExpiration = createOTPExpiration()

    // Delete any existing OTPs for this user (for security and to avoid confusion)
    await databaseServices.otps.deleteMany({ user_id: user._id, type: OtpVerifyType.PasswordReset })

    // Store OTP in database with type 'password_reset'
    const otpDoc = new Otp({
      user_id: user._id,
      code: encryptedOtp,
      expired_at: otpExpiration,
      created_at: new Date(),
      type: OtpVerifyType.PasswordReset
    })

    await databaseServices.otps.insertOne(otpDoc)

    // Generate email content with OTP
    const htmlContent = await generatePasswordResetContent(plainOtp)

    // Send OTP to user's email
    await emailService.sendEmail(normalizedEmail, 'Elearning System Hutech - Password Reset OTP', htmlContent)
  },

  /**
   * Validate password reset OTP
   * @param {string} otp - OTP from email
   * @param {string} email - User's email
   * @returns {Promise<{ userId: string }>} User ID if OTP is valid
   * @throws {ErrorWithStatus} If OTP is invalid or expired or user not found
   */
  verifyPasswordResetOTP: async (otp: string, email: string): Promise<{ userId: string; email: string }> => {
    // Normalize email to prevent case sensitivity issues
    const normalizedEmail = email.trim().toLowerCase()

    // Find user by email
    const user = await databaseServices.users.findOne({ email: normalizedEmail })

    if (!user) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Find the most recent OTP for this user with type 'password_reset'
    const otpRecord = await databaseServices.otps.findOne(
      {
        user_id: user._id,
        type: OtpVerifyType.PasswordReset,
        expired_at: { $gt: new Date() }
      },
      { sort: { created_at: -1 } }
    )

    if (!otpRecord) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.PASSWORD.FORGOT.INVALID_OTP,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Verify OTP
    const isValid = verifyOTP(otp, otpRecord.code)

    if (!isValid) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.PASSWORD.FORGOT.INVALID_OTP,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    await databaseServices.otps.updateOne({ _id: otpRecord._id }, { $set: { is_used: true } })

    return { userId: user._id.toString(), email: user.email }
  },

  /**
   * Reset user's password using OTP
   * @param {ResetPasswordDto} resetData - Password reset data
   * @returns {Promise<boolean>} Success status
   * @throws {ErrorWithStatus} If OTP is invalid or expired or new password matches old password
   */
  resetPassword: async (resetData: ResetPasswordDto): Promise<boolean> => {
    const { email, password } = resetData

    // Get the user to check current password
    const user = await databaseServices.users.findOne({ email })

    if (!user) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check if new password matches the current password
    const passwordMatches = comparePassword(password, user.password)
    if (passwordMatches) {
      throw new ErrorWithStatus({
        message: MESSAGE.VALIDATION.MISMATCH.NEW_PASSWORD_SAME_AS_CURRENT,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Hash the new password
    const hashedPassword = hashPassword(password)

    // Update user's password and set password_change_at field
    await databaseServices.users.updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          password_change_at: new Date()
        }
      }
    )

    // For security, invalidate all refresh tokens for this user
    await tokenService.invalidateAllUserRefreshTokens(user._id.toString())

    // Delete all password reset OTPs for this user
    await databaseServices.otps.deleteMany({
      user_id: new ObjectId(user._id.toString()),
      type: OtpVerifyType.PasswordReset,
      is_used: true
    })

    return true
  },

  /**
   * Verify email verification OTP
   * @param {string} otp - OTP from email
   * @param {string} email - User's email
   * @returns {Promise<boolean>} Success status
   * @throws {ErrorWithStatus} If OTP is invalid or expired
   */
  verifyOTP: async (otp: string, email: string): Promise<boolean> => {
    // Normalize email to prevent case sensitivity issues
    const normalizedEmail = email.trim().toLowerCase()

    // Find user by email
    const user = await databaseServices.users.findOne({ email: normalizedEmail })

    if (!user) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check if user is already verified
    if (user.verify === UserVerifyStatus.Verified) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.PASSWORD.FORGOT.INVALID_OTP,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Find the most recent OTP for this user (without type, for email verification)
    const otpRecord = await databaseServices.otps.findOne(
      {
        user_id: user._id,
        type: OtpVerifyType.EmailVerification,
        expired_at: { $gt: new Date() },
        is_used: { $ne: true }
      },
      { sort: { created_at: -1 } }
    )

    if (!otpRecord) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.PASSWORD.FORGOT.INVALID_OTP,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Verify OTP
    const isValid = verifyOTP(otp, otpRecord.code)

    if (!isValid) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.PASSWORD.FORGOT.INVALID_OTP,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    await databaseServices.otps.updateOne({ _id: otpRecord._id }, { $set: { is_used: true } })

    await databaseServices.users.updateOne({ _id: user._id }, { $set: { verify: UserVerifyStatus.Verified } })

    return true
  },

  /**
   * Resend OTP to a user
   * @param {ResendOtpDto} resendOtpData - User's email and OTP type
   * @returns {Promise<void>}
   * @throws {ErrorWithStatus} If email not found or other errors occur
   */
  resendOTP: async (resendOtpData: ResendOtpDto): Promise<void> => {
    const { email, type } = resendOtpData

    // Normalize email to prevent case sensitivity issues
    const normalizedEmail = email.trim().toLowerCase()

    // Find user by email
    const user = await databaseServices.users.findOne({ email: normalizedEmail })

    if (!user) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Generate a new OTP and set expiration
    const plainOtp = generateOTP()
    const encryptedOtp = encryptOTP(plainOtp)
    const otpExpiration = createOTPExpiration()

    // Create new OTP document
    const otpDoc = new Otp({
      user_id: user._id,
      code: encryptedOtp,
      expired_at: otpExpiration,
      type
    })

    // Insert new OTP
    await databaseServices.otps.insertOne(otpDoc)

    // Generate appropriate email content based on type
    let htmlContent: string
    let emailSubject: string

    if (type === 'password_reset') {
      htmlContent = await generatePasswordResetContent(plainOtp)
      emailSubject = 'Elearning System Hutech - Password Reset OTP'

      // Send OTP email for password reset
      await emailService.sendEmail(normalizedEmail, emailSubject, htmlContent)
    } else {
      // Default to email verification
      htmlContent = await generateEmailContent(plainOtp)
      emailSubject = 'Elearning System Hutech - Email Verification OTP'

      // Send OTP email for verification
      await emailService.sendOTPEmail(normalizedEmail, emailSubject, htmlContent)
    }
  },

  /**
   * Change user's password when they're already logged in
   * @param {string} userId - Authenticated user's ID
   * @param {ChangePasswordDto} changePasswordData - Password change data
   * @returns {Promise<boolean>} Success status
   * @throws {ErrorWithStatus} If current password is incorrect or other validation fails
   */
  changePassword: async (userId: string, changePasswordData: ChangePasswordDto): Promise<boolean> => {
    const { current_password, new_password } = changePasswordData

    // Check if userId is valid
    if (!ObjectId.isValid(userId)) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.INVALID_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Find user by ID
    const user = await databaseServices.users.findOne({ _id: new ObjectId(userId) })

    if (!user) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Verify that current password is correct
    const isPasswordValid = comparePassword(current_password, user.password)

    if (!isPasswordValid) {
      throw new ErrorWithStatus({
        message: MESSAGE.VALIDATION.MISMATCH.OLD_PASSWORD,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Check if new password is the same as current password
    if (comparePassword(new_password, user.password)) {
      throw new ErrorWithStatus({
        message: MESSAGE.VALIDATION.MISMATCH.NEW_PASSWORD_SAME_AS_CURRENT,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Hash the new password
    const hashedPassword = hashPassword(new_password)

    // Update user's password
    await databaseServices.users.updateOne({ _id: new ObjectId(userId) }, { $set: { password: hashedPassword } })

    // For security, invalidate all refresh tokens for this user
    await tokenService.invalidateAllUserRefreshTokens(userId)

    return true
  },

  /**
   * Reissue access and refresh tokens using a valid refresh token
   * @param {string} refreshToken - Current refresh token
   * @returns {Promise<{access_token: string, refresh_token: string}>} New tokens
   * @throws {ErrorWithStatus} If refresh token is invalid, expired, or not found
   */
  reissueToken: async (refreshToken: string): Promise<{ access_token: string; refresh_token: string }> => {
    // Validate refresh token exists
    if (!refreshToken) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.VALIDATION.TOKEN.MISSING,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    try {
      // Validate the refresh token
      const validationResult = await tokenService.validateToken(refreshToken, TokenType.RefreshToken)

      if (!validationResult.valid) {
        throw new ErrorWithStatus({
          message: validationResult.error || MESSAGE.AUTH.VALIDATION.TOKEN.INVALID,
          status: HTTP_STATUS.UN_AUTHORIZED
        })
      }

      const userId = validationResult.payload?.sub

      if (!userId) {
        throw new ErrorWithStatus({
          message: MESSAGE.AUTH.VALIDATION.USER_ID.MISSING,
          status: HTTP_STATUS.UN_AUTHORIZED
        })
      }

      // Check if user still exists
      const user = await databaseServices.users.findOne({
        _id: new ObjectId(userId),
        is_removed: false
      })

      if (!user) {
        throw new ErrorWithStatus({
          message: MESSAGE.USER.NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      // Invalidate old refresh token - now async
      await tokenService.invalidateToken(refreshToken)

      // Generate new tokens
      const accessToken = await tokenService.generateAccessToken(userId, user.email, user.roles || [])

      const { token: newRefreshToken } = await tokenService.generateRefreshToken(userId)

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken
      }
    } catch (error) {
      if (error instanceof ErrorWithStatus) {
        throw error
      }

      // Handle JWT verification errors
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.VALIDATION.TOKEN.INVALID,
        status: HTTP_STATUS.UN_AUTHORIZED
      })
    }
  },

  /**
   * Validate a token's authenticity and check if it's expired
   * @param {string} token - The token to validate
   * @param {TokenType} tokenType - Type of token
   * @returns {Promise<{valid: boolean, expired: boolean, payload?: any, error?: string}>}
   */
  validateToken: async (
    token: string,
    tokenType: TokenType
  ): Promise<{
    valid: boolean
    expired: boolean
    payload?: any
    error?: string
  }> => {
    return tokenService.validateToken(token, tokenType)
  },

  /**
   * Assign admin role to a user
   * @param {string} targetUserId - ID of the user to be made admin
   * @param {string} assignerId - ID of the user assigning the role (must be admin)
   * @returns {Promise<boolean>} Success status
   * @throws {ErrorWithStatus} If validation fails or user not found
   */
  assignAdminRole: async (targetUserId: string, assignerId: string): Promise<boolean> => {
    // Validate that both IDs are valid ObjectIds
    if (!ObjectId.isValid(targetUserId) || !ObjectId.isValid(assignerId)) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.INVALID_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Check if assigner is an admin
    const assigner = await databaseServices.users.findOne({
      _id: new ObjectId(assignerId)
    })

    if (!assigner) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Get admin role
    const adminRole = await databaseServices.roles.findOne({ name: UserRole.Admin })
    if (!adminRole) {
      throw new ErrorWithStatus({
        message: 'Admin role not found in the system',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }

    // Check if the assigner has admin role
    const hasAdminRole = assigner.roles?.some((role) => role.toString() === adminRole._id.toString())
    if (!hasAdminRole) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.UNAUTHORIZED_ROLE_ASSIGNMENT,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // Find the target user
    const targetUser = await databaseServices.users.findOne({
      _id: new ObjectId(targetUserId)
    })

    if (!targetUser) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check if user is verified
    if (targetUser.verify !== UserVerifyStatus.Verified) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // Check if the user already has admin role
    const alreadyHasAdminRole = targetUser.roles?.some((role) => role.toString() === adminRole._id.toString())
    if (alreadyHasAdminRole) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.USER_ALREADY_ADMIN,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Make sure the user is a pro user
    if (!targetUser.is_pro) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.PRO_REQUIRED_FOR_ADMIN,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Add admin role to the user's roles array
    const userRoles = targetUser.roles || []
    userRoles.push(adminRole._id)

    // Update the user
    await databaseServices.users.updateOne(
      { _id: new ObjectId(targetUserId) },
      {
        $set: {
          roles: userRoles,
          updated_at: new Date()
        }
      }
    )

    return true
  },

  /**
   * Set a user as a pro user
   * @param {string} targetUserId - ID of the user to be made pro
   * @param {string} assignerId - ID of the user assigning pro status (must be admin)
   * @returns {Promise<boolean>} Success status
   * @throws {ErrorWithStatus} If validation fails or user not found
   */
  setUserAsPro: async (targetUserId: string, assignerId: string): Promise<boolean> => {
    // Validate that both IDs are valid ObjectIds
    if (!ObjectId.isValid(targetUserId) || !ObjectId.isValid(assignerId)) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.INVALID_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Check if assigner is an admin
    const assigner = await databaseServices.users.findOne({
      _id: new ObjectId(assignerId)
    })

    if (!assigner) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Get admin role
    const adminRole = await databaseServices.roles.findOne({ name: UserRole.Admin })
    if (!adminRole) {
      throw new ErrorWithStatus({
        message: 'Admin role not found in the system',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }

    // Check if the assigner has admin role
    const hasAdminRole = assigner.roles?.some((role) => role.toString() === adminRole._id.toString())
    if (!hasAdminRole) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.UNAUTHORIZED_ROLE_ASSIGNMENT,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // Find the target user
    const targetUser = await databaseServices.users.findOne({
      _id: new ObjectId(targetUserId)
    })

    if (!targetUser) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check if user is verified
    if (targetUser.verify !== UserVerifyStatus.Verified) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // Check if the user is already a pro user
    if (targetUser.is_pro) {
      throw new ErrorWithStatus({
        message: MESSAGE.AUTH.USER_ALREADY_PRO,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Update the user to pro status
    await databaseServices.users.updateOne(
      { _id: new ObjectId(targetUserId) },
      {
        $set: {
          is_pro: true,
          updated_at: new Date()
        }
      }
    )

    return true
  }
}

export default authService
