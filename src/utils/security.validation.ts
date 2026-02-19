import { ErrorWithStatus } from '~/errors/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { MESSAGE } from '~/constants/message'
import validator from 'validator'
import { containsNewline, hasWhitespace } from './helper'
import { REGEX_NUMBER, REGEX_VALID_CHARACTER_FULLNAME } from '~/constants/regex'

/**
 * Interface for validation result
 */
export interface ValidationResult {
  isValid: boolean
  error?: ErrorWithStatus
  sanitizedValue?: string
}

/**
 * Validates and sanitizes email address
 * @param email - Email to validate
 * @returns ValidationResult
 */
export const validateAndSanitizeEmail = (email: unknown): ValidationResult => {
  try {
    // Check if email is a string
    if (typeof email !== 'string') {
      return {
        isValid: false,
        error: new ErrorWithStatus({
          message: MESSAGE.VALIDATION.FORMAT.USER.EMAIL,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Check for whitespace
    if (hasWhitespace(email)) {
      return {
        isValid: false,
        error: new ErrorWithStatus({
          message: MESSAGE.AUTH.VALIDATION.EMAIL.CONTAINS_WHITESPACE,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Normalize email
    const normalized = email.trim().toLowerCase()

    // Validate email format
    if (!validator.isEmail(normalized)) {
      return {
        isValid: false,
        error: new ErrorWithStatus({
          message: MESSAGE.VALIDATION.FORMAT.USER.EMAIL,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Check for unicode characters in email
    if (!validator.isAscii(normalized)) {
      return {
        isValid: false,
        error: new ErrorWithStatus({
          message: MESSAGE.AUTH.VALIDATION.EMAIL.CONTAINS_UNICODE,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Check email length
    if (!validator.isLength(normalized, { min: 5, max: 255 })) {
      return {
        isValid: false,
        error: new ErrorWithStatus({
          message: MESSAGE.VALIDATION.LENGTH.EMAIL,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    return {
      isValid: true,
      sanitizedValue: normalized
    }
  } catch (error) {
    return {
      isValid: false,
      error: new ErrorWithStatus({
        message: MESSAGE.ERROR.INTERNAL_SERVER_ERROR,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }
  }
}

/**
 * Validates and sanitizes full name
 * @param fullName - Full name to validate
 * @returns ValidationResult
 */
export const validateAndSanitizeFullName = (fullName: unknown): ValidationResult => {
  try {
    // Check if fullName is a string
    if (typeof fullName !== 'string') {
      return {
        isValid: false,
        error: new ErrorWithStatus({
          message: MESSAGE.VALIDATION.FORMAT.USER.FULLNAME,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Check for newlines
    if (containsNewline(fullName)) {
      return {
        isValid: false,
        error: new ErrorWithStatus({
          message: MESSAGE.AUTH.VALIDATION.FULLNAME.CONTAINS_NEW_LINE,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Trim and normalize whitespace
    const normalized = fullName.trim().replace(/\s+/g, ' ')

    // Check length
    if (!validator.isLength(normalized, { min: 3, max: 30 })) {
      return {
        isValid: false,
        error: new ErrorWithStatus({
          message: MESSAGE.VALIDATION.LENGTH.FULLNAME,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Check for XSS attempts
    if (validator.contains(normalized, ['<', '>', 'script', 'javascript:', 'onerror', 'onload'])) {
      return {
        isValid: false,
        error: new ErrorWithStatus({
          message: MESSAGE.AUTH.VALIDATION.FULLNAME.CONTAINS_XSS,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Check for numbers
    if (REGEX_NUMBER.test(normalized)) {
      return {
        isValid: false,
        error: new ErrorWithStatus({
          message: MESSAGE.AUTH.VALIDATION.FULLNAME.CONTAINS_NUMBER,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Check for special characters (allow only letters, spaces, and basic punctuation)
    if (!REGEX_VALID_CHARACTER_FULLNAME.test(normalized)) {
      return {
        isValid: false,
        error: new ErrorWithStatus({
          message: MESSAGE.AUTH.VALIDATION.FULLNAME.VALID_CHARACTER,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    return {
      isValid: true,
      sanitizedValue: normalized
    }
  } catch (error) {
    return {
      isValid: false,
      error: new ErrorWithStatus({
        message: MESSAGE.ERROR.INTERNAL_SERVER_ERROR,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }
  }
}

/**
 * Validates required fields in registration payload
 * @param payload - Registration payload
 * @returns ValidationResult
 */
export const validateRegistrationPayload = (payload: unknown): ValidationResult => {
  try {
    // Check if payload is an object
    if (typeof payload !== 'object' || payload === null) {
      return {
        isValid: false,
        error: new ErrorWithStatus({
          message: MESSAGE.AUTH.VALIDATION.ACCOUNT.INVALID_PAYLOAD,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    const requiredFields = ['email', 'full_name', 'password', 'confirm_password', 'role']
    const missingFields = requiredFields.filter((field) => !(field in payload))

    if (missingFields.length > 0) {
      return {
        isValid: false,
        error: new ErrorWithStatus({
          message: `Missing required fields: ${missingFields.join(', ')}`,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    return {
      isValid: true
    }
  } catch (error) {
    return {
      isValid: false,
      error: new ErrorWithStatus({
        message: MESSAGE.ERROR.INTERNAL_SERVER_ERROR,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }
  }
}
