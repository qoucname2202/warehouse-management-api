import { checkSchema, ParamSchema } from 'express-validator'
import { validate } from './validation-schema'
import { MESSAGE } from '~/constants/message'
import { hasWhitespace, isAllowedDomainFormat, isValidPassword, verifyDomainHasMX } from '~/utils/helper'
import { ErrorWithStatus } from '~/errors/Errors'
import HttpStatusCode from '~/constants/httpStatus'
import validator from 'validator'
import { ObjectId } from 'mongodb'
import { UserRole } from '~/constants/enums'
import { findUserByEmail } from '~/utils/user.utils'
import { isValidJwtFormat } from '~/utils/jwt'

import {
  validateAndSanitizeEmail,
  validateAndSanitizeFullName,
  validateRegistrationPayload
} from '~/utils/security.validation'
import { databaseServices } from '~/services/database.service'

// Validator full_name schema
export const fullNameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: MESSAGE.VALIDATION.REQUIRED.USER.FULLNAME
  },
  custom: {
    options: (value: unknown) => {
      const result = validateAndSanitizeFullName(value)
      if (!result.isValid && result.error) {
        throw result.error
      }
      return true
    }
  }
}

// Validator email schema
export const emailSchema: ParamSchema = {
  notEmpty: {
    errorMessage: MESSAGE.VALIDATION.REQUIRED.USER.EMAIL
  },
  custom: {
    options: async (value: unknown) => {
      const result = validateAndSanitizeEmail(value)
      if (!result.isValid && result.error) {
        throw result.error
      }

      // Check if email exists in database
      const existingUser = await databaseServices.users.findOne({ email: result.sanitizedValue })
      if (existingUser) {
        throw new ErrorWithStatus({
          status: HttpStatusCode.CONFLICT,
          message: MESSAGE.AUTH.VALIDATION.EMAIL.ALREADY_REGISTER_IN_SYSTEM
        })
      }

      return true
    }
  }
}

// Validation password schema
export const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: MESSAGE.VALIDATION.REQUIRED.USER.PASSWORD
  },
  isString: {
    errorMessage: MESSAGE.VALIDATION.FORMAT.USER.PASSWORD
  },
  trim: true,
  escape: true,
  isLength: {
    options: { min: 8, max: 16 },
    errorMessage: MESSAGE.VALIDATION.LENGTH.PASSWORD
  },
  isStrongPassword: {
    options: {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: MESSAGE.AUTH.VALIDATION.PASSWORD.STRONG
  },
  custom: {
    options: (value: string, { req }) => {
      const userInfo = {
        email: req.body.email,
        full_name: req.body.full_name
      }
      const error = isValidPassword(value, userInfo, false)
      if (error) {
        throw new ErrorWithStatus({
          status: HttpStatusCode.BAD_REQUEST,
          message: error
        })
      }
      return true
    }
  }
}

// Validation confirm_password schema
export const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: MESSAGE.VALIDATION.REQUIRED.USER.CONFIRM_PASSWORD
  },
  isString: {
    errorMessage: MESSAGE.VALIDATION.FORMAT.USER.CONFIRM_PASSWORD
  },
  trim: true,
  escape: true,
  isLength: {
    options: { min: 8, max: 16 },
    errorMessage: MESSAGE.VALIDATION.LENGTH.CONFIRM_PASSWORD
  },
  isStrongPassword: {
    options: {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: MESSAGE.AUTH.VALIDATION.CONFIRM_PASSWORD.STRONG
  },
  custom: {
    options: (value: string, { req }) => {
      const userInfo = {
        email: req.body.email,
        full_name: req.body.full_name
      }
      const error = isValidPassword(value, userInfo, true)
      if (error) {
        throw new ErrorWithStatus({
          status: HttpStatusCode.BAD_REQUEST,
          message: error
        })
      }
      if (value !== req.body.password) {
        throw new Error(MESSAGE.AUTH.VALIDATION.CONFIRM_PASSWORD.MUST_BE_THE_SAME_AS_PASSWORD)
      }
      return true
    }
  }
}

// Validator for refresh token
export const refreshTokenSchema: ParamSchema = {
  optional: {
    options: {
      values: 'falsy'
    }
  },
  isString: {
    errorMessage: MESSAGE.TOKEN.MUST_BE_STRING
  },
  trim: true,
  custom: {
    options: (value: string) => {
      if (!isValidJwtFormat(value)) {
        throw new Error(MESSAGE.AUTH.VALIDATION.TOKEN.INVALID)
      }
      return true
    }
  }
}

// Validator for user ID
export const userIdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: MESSAGE.AUTH.VALIDATION.USER_ID.MISSING
  },
  isString: {
    errorMessage: MESSAGE.AUTH.VALIDATION.USER_ID.INVALID
  },
  custom: {
    options: (value: string) => {
      // Validate if the string is a valid ObjectId
      if (!ObjectId.isValid(value)) {
        throw new Error(MESSAGE.AUTH.VALIDATION.USER_ID.INVALID)
      }
      return true
    }
  }
}

// Validation for role
export const roleSchema: ParamSchema = {
  notEmpty: {
    errorMessage: MESSAGE.VALIDATION.REQUIRED.AUTH.ROLE
  },
  isString: {
    errorMessage: MESSAGE.VALIDATION.FORMAT.AUTH.ROLE
  },
  isIn: {
    options: [[UserRole.Student.toLowerCase(), UserRole.Instructor.toLowerCase()]],
    errorMessage: MESSAGE.VALIDATION.FORMAT.AUTH.ROLE
  }
}

/**
 * Validate and parse date of birth
 * @param {string} dateString - Date of birth string
 * @returns {Date} Parsed date object
 * @throws {ErrorWithStatus} If date format is invalid
 */
export const dateOfBirthSchema: ParamSchema = {
  notEmpty: {
    errorMessage: MESSAGE.VALIDATION.REQUIRED.USER.DATE_OF_BIRTH
  },
  isDate: {
    errorMessage: MESSAGE.VALIDATION.FORMAT.USER.DATE_OF_BIRTH
  },
  custom: {
    options: (value: string) => {
      const birthDate = new Date(value)
      const today = new Date()

      // Check if date is valid
      if (isNaN(birthDate.getTime())) {
        throw new ErrorWithStatus({
          message: MESSAGE.AUTH.VALIDATION.DOB.INVALID_FORMAT,
          status: HttpStatusCode.BAD_REQUEST
        })
      }

      // Check if date is in the past
      if (birthDate >= today) {
        throw new ErrorWithStatus({
          message: MESSAGE.AUTH.VALIDATION.DOB.FUTURE_DATE,
          status: HttpStatusCode.BAD_REQUEST
        })
      }

      // Check if user is at least 10 years old (for students)
      const MIN_AGE = 10
      const minAgeDate = new Date()
      minAgeDate.setFullYear(today.getFullYear() - MIN_AGE)

      if (birthDate > minAgeDate) {
        throw new ErrorWithStatus({
          message: MESSAGE.AUTH.VALIDATION.DOB.MIN_AGE,
          status: HttpStatusCode.BAD_REQUEST
        })
      }
      return true
    }
  }
}

// Validator for register endpoint
export const registerValidator = validate(
  checkSchema(
    {
      // Validate entire payload first
      _: {
        custom: {
          options: (value: unknown, { req }) => {
            const result = validateRegistrationPayload(req.body)
            if (!result.isValid && result.error) {
              throw result.error
            }
            return true
          }
        }
      },
      full_name: fullNameSchema,
      email: emailSchema,
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      role: roleSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

// Validator for login endpoint
export const loginValidator = validate(
  checkSchema(
    {
      email: {
        ...emailSchema,
        custom: {
          options: async (value: string) => {
            if (hasWhitespace(value)) {
              throw new Error(MESSAGE.AUTH.VALIDATION.EMAIL.CONTAINS_WHITESPACE)
            }

            const normalized = value.trim().toLowerCase()

            if (!validator.isEmail(normalized)) {
              throw new Error(MESSAGE.VALIDATION.FORMAT.USER.EMAIL)
            }

            const domain = normalized.split('@')[1]

            if (!isAllowedDomainFormat(domain)) {
              throw new Error(MESSAGE.AUTH.VALIDATION.EMAIL.DOMAIN_INVALID)
            }

            const domainHasMx = await verifyDomainHasMX(domain)
            if (!domainHasMx) {
              throw new Error(MESSAGE.AUTH.VALIDATION.EMAIL.DOMAIN_HAS_MX)
            }

            // Check if email exists in the system - we need this for password reset
            const user = await findUserByEmail(value)
            if (!user) {
              throw new ErrorWithStatus({
                message: MESSAGE.USER.NOT_FOUND,
                status: HttpStatusCode.NOT_FOUND
              })
            }
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: MESSAGE.VALIDATION.REQUIRED.USER.PASSWORD
        },
        isString: {
          errorMessage: MESSAGE.VALIDATION.FORMAT.USER.PASSWORD
        },
        trim: true,
        escape: true,
        isLength: {
          options: { min: 8, max: 16 },
          errorMessage: MESSAGE.VALIDATION.LENGTH.PASSWORD
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: MESSAGE.AUTH.VALIDATION.PASSWORD.STRONG
        }
      }
    },
    ['body']
  )
)

// Validator for refresh token endpoint
export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: refreshTokenSchema
    },
    ['body', 'cookies']
  )
)

// Validator for logout function
export const logoutValidator = validate(
  checkSchema(
    {
      refresh_token: refreshTokenSchema
    },
    ['body', 'cookies']
  )
)

// Validator for logout from all devices function
export const logoutAllValidator = validate(
  checkSchema(
    {
      // This validator uses authMiddleware to get userId
      // No additional validations needed here as it relies on authenticated user
    },
    ['body']
  )
)

// Validator for forgot password
export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        ...emailSchema,
        custom: {
          options: async (value: string) => {
            if (hasWhitespace(value)) {
              throw new Error(MESSAGE.AUTH.VALIDATION.EMAIL.CONTAINS_WHITESPACE)
            }

            const normalized = value.trim().toLowerCase()

            if (!validator.isEmail(normalized)) {
              throw new Error(MESSAGE.VALIDATION.FORMAT.USER.EMAIL)
            }

            const domain = normalized.split('@')[1]

            if (!isAllowedDomainFormat(domain)) {
              throw new Error(MESSAGE.AUTH.VALIDATION.EMAIL.DOMAIN_INVALID)
            }

            const domainHasMx = await verifyDomainHasMX(domain)
            if (!domainHasMx) {
              throw new Error(MESSAGE.AUTH.VALIDATION.EMAIL.DOMAIN_HAS_MX)
            }

            // Don't check if email exists - we don't want to reveal which emails are registered
            // for security reasons

            return true
          }
        }
      }
    },
    ['body']
  )
)

// Validator for password reset
export const resetPasswordValidator = validate(
  checkSchema(
    {
      email: {
        ...emailSchema,
        custom: {
          options: async (value: string) => {
            if (hasWhitespace(value)) {
              throw new Error(MESSAGE.AUTH.VALIDATION.EMAIL.CONTAINS_WHITESPACE)
            }

            const normalized = value.trim().toLowerCase()

            if (!validator.isEmail(normalized)) {
              throw new Error(MESSAGE.VALIDATION.FORMAT.USER.EMAIL)
            }

            const domain = normalized.split('@')[1]

            if (!isAllowedDomainFormat(domain)) {
              throw new Error(MESSAGE.AUTH.VALIDATION.EMAIL.DOMAIN_INVALID)
            }

            const domainHasMx = await verifyDomainHasMX(domain)
            if (!domainHasMx) {
              throw new Error(MESSAGE.AUTH.VALIDATION.EMAIL.DOMAIN_HAS_MX)
            }

            // Check if email exists in the system - we need this for password reset
            const user = await findUserByEmail(value)
            if (!user) {
              throw new ErrorWithStatus({
                message: MESSAGE.USER.NOT_FOUND,
                status: HttpStatusCode.NOT_FOUND
              })
            }

            return true
          }
        }
      },
      password: {
        ...passwordSchema,
        custom: {
          options: (value: string, { req }) => {
            const userInfo = {
              email: req.body.email,
              // Can't use full_name here as it's not part of the reset password flow
              full_name: ''
            }

            const error = isValidPassword(value, userInfo, false)
            if (error) {
              throw new ErrorWithStatus({
                status: HttpStatusCode.BAD_REQUEST,
                message: error
              })
            }

            return true
          }
        }
      },
      confirm_password: {
        ...confirmPasswordSchema,
        custom: {
          options: (value: string, { req }) => {
            if (value !== req.body.password) {
              throw new Error(MESSAGE.AUTH.VALIDATION.CONFIRM_PASSWORD.MUST_BE_THE_SAME_AS_PASSWORD)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

// Validator for email verification OTP
export const verifyEmailOTPValidator = validate(
  checkSchema(
    {
      otp: {
        notEmpty: {
          errorMessage: 'OTP is required'
        },
        isString: {
          errorMessage: 'OTP must be a string'
        },
        isLength: {
          options: { min: 6, max: 6 },
          errorMessage: 'OTP must be exactly 6 characters'
        },
        trim: true
      },
      email: {
        ...emailSchema,
        custom: {
          options: async (value: string) => {
            if (hasWhitespace(value)) {
              throw new Error(MESSAGE.AUTH.VALIDATION.EMAIL.CONTAINS_WHITESPACE)
            }

            const normalized = value.trim().toLowerCase()

            if (!validator.isEmail(normalized)) {
              throw new Error(MESSAGE.VALIDATION.FORMAT.USER.EMAIL)
            }

            const domain = normalized.split('@')[1]

            if (!isAllowedDomainFormat(domain)) {
              throw new Error(MESSAGE.AUTH.VALIDATION.EMAIL.DOMAIN_INVALID)
            }

            const domainHasMx = await verifyDomainHasMX(domain)
            if (!domainHasMx) {
              throw new Error(MESSAGE.AUTH.VALIDATION.EMAIL.DOMAIN_HAS_MX)
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

// Validator for resending OTP
export const resendOTPValidator = validate(
  checkSchema(
    {
      email: {
        ...emailSchema,
        custom: {
          options: async (value: string) => {
            if (hasWhitespace(value)) {
              throw new Error(MESSAGE.AUTH.VALIDATION.EMAIL.CONTAINS_WHITESPACE)
            }

            const normalized = value.trim().toLowerCase()

            if (!validator.isEmail(normalized)) {
              throw new Error(MESSAGE.VALIDATION.FORMAT.USER.EMAIL)
            }

            const domain = normalized.split('@')[1]

            if (!isAllowedDomainFormat(domain)) {
              throw new Error(MESSAGE.AUTH.VALIDATION.EMAIL.DOMAIN_INVALID)
            }

            const domainHasMx = await verifyDomainHasMX(domain)
            if (!domainHasMx) {
              throw new Error(MESSAGE.AUTH.VALIDATION.EMAIL.DOMAIN_HAS_MX)
            }

            return true
          }
        }
      },
      type: {
        optional: true,
        isString: {
          errorMessage: 'Type must be a string'
        },
        isIn: {
          options: [['email_verification', 'password_reset']],
          errorMessage: 'Type must be either "email_verification" or "password_reset"'
        }
      }
    },
    ['body']
  )
)

// Validator for changing password
export const changePasswordValidator = validate(
  checkSchema(
    {
      current_password: {
        notEmpty: {
          errorMessage: 'Current password is required'
        },
        isString: {
          errorMessage: 'Current password must be a string'
        },
        trim: true
      },
      new_password: {
        ...passwordSchema,
        custom: {
          options: (value: string, { req }) => {
            if (value === req.body.current_password) {
              throw new Error(MESSAGE.VALIDATION.MISMATCH.NEW_PASSWORD_SAME_AS_CURRENT)
            }
            return true
          }
        }
      },
      confirm_password: {
        ...confirmPasswordSchema,
        custom: {
          options: (value: string, { req }) => {
            if (value !== req.body.new_password) {
              throw new Error(MESSAGE.AUTH.VALIDATION.CONFIRM_PASSWORD.MUST_BE_THE_SAME_AS_PASSWORD)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

// Validator for token validation endpoint
export const validateTokenValidator = validate(
  checkSchema(
    {
      token: {
        notEmpty: {
          errorMessage: MESSAGE.TOKEN.REQUIRED
        },
        isString: {
          errorMessage: MESSAGE.TOKEN.MUST_BE_STRING
        },
        trim: true,
        custom: {
          options: (value: string) => {
            // Basic JWT format validation (header.payload.signature)
            const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/

            if (!jwtRegex.test(value)) {
              throw new Error(MESSAGE.AUTH.VALIDATION.TOKEN.INVALID)
            }

            // Check minimum JWT length (at least 30 characters)
            if (value.length < 30) {
              throw new Error(MESSAGE.AUTH.VALIDATION.TOKEN.INVALID)
            }

            return true
          }
        }
      },
      token_type: {
        notEmpty: {
          errorMessage: 'Token type is required'
        },
        isString: {
          errorMessage: 'Token type must be a string'
        },
        isIn: {
          options: [['access_token', 'refresh_token']],
          errorMessage: 'Token type must be either "access_token" or "refresh_token"'
        }
      }
    },
    ['body']
  )
)
