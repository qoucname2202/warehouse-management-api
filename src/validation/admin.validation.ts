import { checkSchema } from 'express-validator'
import { validate } from './validation-schema'
import { MESSAGE } from '~/constants/message'
import { ObjectId } from 'mongodb'
import { userIdSchema } from './auth.validation'

// Validator for admin role assignment
export const roleAssignmentValidator = validate(
  checkSchema(
    {
      target_user_id: {
        notEmpty: {
          errorMessage: 'Target user ID is required'
        },
        isString: {
          errorMessage: 'Target user ID must be a string'
        },
        custom: {
          options: (value: string) => {
            // Check if the string is a valid ObjectId
            if (!ObjectId.isValid(value)) {
              throw new Error(MESSAGE.USER.INVALID_ID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

// The same validation applies to setting a user as pro
export const proStatusAssignmentValidator = roleAssignmentValidator

// Validator for admin password reset
export const adminPasswordResetValidator = validate(
  checkSchema(
    {
      target_user_id: {
        notEmpty: {
          errorMessage: 'Target user ID is required'
        },
        isString: {
          errorMessage: 'Target user ID must be a string'
        },
        custom: {
          options: (value: string) => {
            // Check if the string is a valid ObjectId
            if (!ObjectId.isValid(value)) {
              throw new Error(MESSAGE.USER.INVALID_ID)
            }
            return true
          }
        }
      },
      new_password: {
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
      },
      confirm_password: {
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

// Validator for user disable operation
export const userDisableValidator = validate(
  checkSchema(
    {
      target_user_id: {
        notEmpty: {
          errorMessage: 'Target user ID is required'
        },
        isString: {
          errorMessage: 'Target user ID must be a string'
        },
        custom: {
          options: (value: string) => {
            // Check if the string is a valid ObjectId
            if (!ObjectId.isValid(value)) {
              throw new Error(MESSAGE.USER.INVALID_ID)
            }
            return true
          }
        }
      },
      reason: {
        optional: true,
        isString: {
          errorMessage: 'Reason must be a string'
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 500 },
          errorMessage: 'Reason must be between 1 and 500 characters'
        }
      }
    },
    ['body']
  )
)

// Validator for teacher approval
export const teacherApprovalValidator = validate(
  checkSchema(
    {
      target_user_id: userIdSchema
    },
    ['body']
  )
)
