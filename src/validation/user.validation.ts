import { checkSchema, CustomValidator, ParamSchema } from 'express-validator'
import { validate } from './validation-schema'
import { MESSAGE } from '~/constants/message'
import { UserGenderType, UserVerifyStatus } from '~/constants/enums'

// Phone number validation schema
const phoneNumberSchema: ParamSchema = {
  optional: true,
  isString: true,
  trim: true,
  isLength: {
    options: { min: 10, max: 15 },
    errorMessage: MESSAGE.VALIDATION.LENGTH.PHONE_NUMBER
  },
  matches: {
    options: /^[+]?[\d\s-()]{10,15}$/,
    errorMessage: 'Invalid phone number format'
  }
}

// Bio validation schema
const bioSchema: ParamSchema = {
  optional: true,
  isString: true,
  trim: true,
  isLength: {
    options: { min: 0, max: 500 },
    errorMessage: MESSAGE.VALIDATION.LENGTH.BIO
  }
}

// URL validation schema (for avatar, cover photo, etc.)
const urlSchema: ParamSchema = {
  optional: true,
  isString: true,
  trim: true,
  isURL: {
    options: {
      protocols: ['http', 'https'],
      require_protocol: true
    },
    errorMessage: 'Must be a valid URL with http or https protocol'
  }
}

// Social media URL validation schema
const socialLinkSchema: ParamSchema = {
  optional: true,
  isString: true,
  trim: true,
  isURL: {
    options: {
      protocols: ['http', 'https'],
      require_protocol: true
    },
    errorMessage: 'Must be a valid URL with http or https protocol'
  }
}

// Country validation schema
const countrySchema: ParamSchema = {
  optional: true,
  isString: true,
  trim: true,
  isLength: {
    options: { min: 2, max: 100 },
    errorMessage: 'Country name must be between 2 and 100 characters'
  }
}

// Full name validation schema
const fullNameSchema: ParamSchema = {
  optional: true,
  isString: true,
  trim: true,
  isLength: {
    options: { min: 2, max: 100 },
    errorMessage: MESSAGE.VALIDATION.LENGTH.NAME
  }
}

// Language validation schema
const languageSchema: ParamSchema = {
  optional: true,
  isString: true,
  trim: true,
  isLength: {
    options: { min: 2, max: 10 },
    errorMessage: 'Language code must be between 2 and 10 characters'
  }
}

// Timezone validation schema
const timezoneSchema: ParamSchema = {
  optional: true,
  isString: true,
  trim: true,
  custom: {
    options: (value: string) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: value })
        return true
      } catch {
        throw new Error('Invalid timezone format')
      }
    }
  }
}

// Date validation schema
const dateSchema: ParamSchema = {
  optional: true,
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: MESSAGE.VALIDATION.FORMAT.USER.DATE_OF_BIRTH
  },
  custom: {
    options: (value: string) => {
      const date = new Date(value)
      const now = new Date()
      if (date > now) {
        throw new Error('Date cannot be in the future')
      }
      // Check if user is at least 13 years old
      const thirteenYearsAgo = new Date()
      thirteenYearsAgo.setFullYear(now.getFullYear() - 13)
      if (date > thirteenYearsAgo) {
        throw new Error('User must be at least 13 years old')
      }
      return true
    }
  }
}

// Gender validation schema
const genderSchema: ParamSchema = {
  optional: true,
  isString: true,
  isIn: {
    options: [Object.values(UserGenderType)],
    errorMessage: MESSAGE.VALIDATION.FORMAT.USER.GENDER
  }
}

// Interests array validation
const interestsSchema: ParamSchema = {
  optional: true,
  isArray: {
    errorMessage: 'Interests must be an array'
  },
  custom: {
    options: (value: string[]) => {
      if (!Array.isArray(value)) {
        throw new Error('Interests must be an array')
      }
      if (value.length > 20) {
        throw new Error('Maximum of 20 interests allowed')
      }
      value.forEach((interest) => {
        if (typeof interest !== 'string') {
          throw new Error('All interests must be strings')
        }
        if (interest.length < 1 || interest.length > 50) {
          throw new Error('Each interest must be between 1 and 50 characters')
        }
      })
      return true
    }
  }
}

// Social links validation
const socialLinksSchema: ParamSchema = {
  optional: true,
  isObject: {
    errorMessage: 'Social links must be an object'
  },
  custom: {
    options: (value: any) => {
      if (typeof value !== 'object' || value === null) {
        throw new Error('Social links must be an object')
      }

      const allowedKeys = ['website', 'facebook', 'instagram', 'linkedin', 'tiktok', 'x', 'youtube']

      Object.keys(value).forEach((key) => {
        if (!allowedKeys.includes(key)) {
          throw new Error(`Invalid social media type: ${key}`)
        }

        const link = value[key]
        if (typeof link !== 'string') {
          throw new Error(`Social media link for ${key} must be a string`)
        }

        if (link && !link.match(/^https?:\/\/.+/)) {
          throw new Error(`Social media link for ${key} must be a valid URL with http or https protocol`)
        }
      })

      return true
    }
  }
}

// Update profile validation
export const updateProfileValidator = validate(
  checkSchema(
    {
      full_name: fullNameSchema,
      bio: bioSchema,
      avatar: urlSchema,
      cover_photo: urlSchema,
      gender: genderSchema,
      date_of_birth: dateSchema,
      phone_number: phoneNumberSchema,
      experience: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: { min: 0, max: 200 },
          errorMessage: 'Experience must be between 0 and 200 characters'
        }
      },
      language: languageSchema,
      country: countrySchema,
      timezone: timezoneSchema,
      social_links: socialLinksSchema,
      interests: interestsSchema
    },
    ['body']
  )
)

/**
 * Validator for GET /admin/users endpoint
 * Validates query parameters for pagination, filtering, and sorting
 */
export const listUsersValidator = validate(
  checkSchema(
    {
      page: {
        in: ['query'],
        optional: true,
        isInt: {
          options: { min: 1 },
          errorMessage: 'Page must be a positive integer'
        },
        toInt: true
      },
      limit: {
        in: ['query'],
        optional: true,
        isInt: {
          options: { min: 1, max: 100 },
          errorMessage: 'Limit must be between 1 and 100'
        },
        toInt: true
      },
      search: {
        in: ['query'],
        optional: true,
        isString: {
          errorMessage: 'Search must be a string'
        },
        trim: true
      },
      search_by: {
        in: ['query'],
        optional: true,
        isIn: {
          options: [['full_name', 'email']],
          errorMessage: 'Search by must be either "full_name" or "email"'
        }
      },
      role: {
        in: ['query'],
        optional: true,
        isString: {
          errorMessage: 'Role must be a string'
        },
        trim: true
      },
      verify_status: {
        in: ['query'],
        optional: true,
        isIn: {
          options: [[UserVerifyStatus.Unverified, UserVerifyStatus.Verified, UserVerifyStatus.Banned]],
          errorMessage: 'Invalid verification status'
        },
        toInt: true
      },
      is_pro: {
        in: ['query'],
        optional: true,
        isBoolean: {
          errorMessage: 'is_pro must be true or false'
        },
        customSanitizer: {
          options: (value) => {
            if (value === 'true') return true
            if (value === 'false') return false
            return value
          }
        }
      },
      sort_by: {
        in: ['query'],
        optional: true,
        isIn: {
          options: [['full_name', 'email', 'created_at', 'username']],
          errorMessage: 'Sort by must be one of: full_name, email, created_at, username'
        }
      },
      sort_order: {
        in: ['query'],
        optional: true,
        isIn: {
          options: [['asc', 'desc']],
          errorMessage: 'Sort order must be either "asc" or "desc"'
        }
      }
    },
    ['query']
  )
)
