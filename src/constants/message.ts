export const MESSAGE = {
  // VALIDATION ERRORS
  VALIDATION: {
    ERROR: 'Validation error',
    REQUIRED: {
      AUTH: {
        ROLE: 'Role is required'
      },
      BANNER: {
        ID: 'Banner_id is required',
        SLUG: 'Slug is required',
        URL: 'URL is required'
      },
      USER: {
        FULLNAME: 'Name is required',
        EMAIL: 'Email is required',
        PASSWORD: 'Password is required',
        CONFIRM_PASSWORD: 'Confirm password is required',
        DATE_OF_BIRTH: 'Date of birth is required'
      },
      TOKEN: {
        ACCESS_TOKEN: 'Access token is required',
        REFRESH_TOKEN: 'Refresh token is required',
        EMAIL_VERIFY_TOKEN: 'Email verification token is required',
        FORGOT_PASSWORD_TOKEN: 'Forgot password token is required'
      },
      FOLLOWED_ID: 'Followed ID is required',
      FEEDBACK: 'Content is Required'
    },
    FORMAT: {
      AUTH: {
        ROLE: 'Role must be either "student" or "instructor"'
      },
      USER: {
        FULLNAME: 'Invalid fullname format',
        DATE_OF_BIRTH: 'Date of birth must be in ISO8601 format',
        BIO: 'Invalid bio format',
        LOCATION: 'Invalid location format',
        WEBSITE: 'Invalid website format',
        USERNAME: 'Invalid username format',
        STATUS: 'Verify status must be one of: Unverified, Verified, Banned.',
        CONFIRM_PASSWORD: 'Invalid confirm_password format',
        GENDER: 'Invalid gender format',
        AVATAR_URL: 'Invalid avatar URL format',
        COVER_PHOTO_URL: 'Invalid cover photo URL format',
        DOB: 'Date of birth must be a valid ISO8601 date (e.g. 2004-09-08).',
        PHONE: 'Invalid mobile phone number',
        EMAIL: 'Email format is invalid. Please enter a valid email address.',
        PASSWORD: 'Invalid password format',
        COUNTRY: 'Country must be a valid string.',
        SEARCH: 'Search keyword must be a string',
        SEARCH_BY: 'search_by must be either "name" or "slug"',
        SORT_BY: 'sort_by must be a string',
        SORT_ORDER: 'sort_order must be "asc" or "desc"',
        PAGE: 'Page must be a positive integer',
        LIMIT: 'Limit must be between 1 and 100',
        ROLE: 'Role not found'
      },
      TOKEN: {
        REFRESH_TOKEN: 'Invalid refresh token'
      }
    },
    LENGTH: {
      NAME: 'Name must be between 3 and 100 characters',
      EMAIL: 'Email must be between 5 and 100 characters long.',
      USERNAME:
        'Username must be 4-15 characters long, contain only letters, numbers, and underscores, and cannot be only numbers',
      FULLNAME: 'Fullname must be 3-30 characters long',
      PASSWORD: 'Password must be between 8 and 16 characters.',
      CONFIRM_PASSWORD: 'Confirm_password must be between 8 and 16 characters.',
      BIO: 'Bio must be between 1 and 200 characters',
      PHONE_NUMBER: 'Phone number must be 10 digits',
      LOCATION: 'Location must be between 1 and 200 characters',
      WEBSITE: 'Website must be between 1 and 200 characters',
      AVATAR_URL: 'Avatar URL length must be between 1 and 200 characters',
      COVER_PHOTO_URL: 'Cover photo URL length must be between 1 and 200 characters',
      BANNER: {
        DESCRIPTION: 'Description must not exceed 500 characters'
      }
    },
    MISMATCH: {
      CONFIRM_PASSWORD: 'Confirm password must match the password',
      OLD_PASSWORD: 'Old password does not match',
      NEW_PASSWORD_SAME_AS_CURRENT: 'New password must be different from current password'
    }
  },

  // SUCCESS MESSAGES
  SUCCESS: {
    COURSE: {
      GET_ALL_SUCCESS: 'Get all courses successfully',
      SEARCH_SUCCESS: 'Search courses successfully',
      GET_DETAIL_SUCCESS: 'Get purchased course detail successfully'
    },
    TOPIC: {
      CREATE_SUCCESS: 'Topic created successfully',
      UPDATE_SUCCESS: 'Topic updated successfully',
      DELETE_SUCCESS: 'Topic deleted successfully',
      STATUS_UPDATED: 'Topic status updated successfully',

      INVALID_COURSE: 'Invalid course ID'
    },
    LESSON: {
      CREATE_SUCCESS: 'Lesson created successfully',
      UPDATE_SUCCESS: 'Lesson updated successfully',
      VIDEO_UPDATED: 'Lesson video updated successfully',
      DELETE_SUCCESS: 'Lesson deleted successfully',
      INVALID_COURSE: 'Invalid course ID',
      DOCUMENT_UPDATED: 'Document uploaded successfully'
    },
    QUIZ: {
      CREATE_SUCCESS: 'Quiz created successfully',
      UPDATE_SUCCESS: 'Quiz updated successfully',
      DELETE_SUCCESS: 'Quiz deleted successfully',
      FETCH_SUCCESS: 'Quiz fetched successfully',
      SUBMIT_SUCCESS: 'Quiz submitted successfully'
    },
    FOLLOW: {
      GET_FOLLOWERS: 'Get all followers successfully',
      FOLLOW_SUCCESS: 'Followed successfully',
      UNFOLLOW_SUCCESS: 'Unfollowed successfully'
    },
    CART: {
      ADDED_SUCCESS: 'Course added to cart successfully',
      ALREADY_EXISTS: 'Course already exists in cart',
      FETCH_SUCCESS: "Get all items in the user's cart successfully",
      REMOVED_SUCCESS: 'Course removed from cart successfully',
      CLEARED_SUCCESS: 'Cart cleared successfully'
    },
    PREVIEW: {
      CREATED: 'Preview created successfully'
    },
    WISHLIST: {
      ADDED_SUCCESS: 'Added to favorites',
      REMOVED_SUCCESS: 'Successfully removed course from  wishlist',
      GET_SUCCESS: "Get all item in user's wishlists successfully"
    },
    ORDER: {
      GET_SUCCESS: 'Get order history successfully'
    },
    COMMENT: {
      GET_ALL_SUCCESS: 'Get all comments successfully',
      DELETED_SUCCESS: 'Delete this comment successfully '
    },
    // ERROR MESSAGES
    ERROR: {
      TOPIC: {
        NOT_FOUND: 'Topic not found',
        INVALID_COURSE: 'Invalid course ID'
      },
      LESSON: {
        NOT_FOUND: 'Lesson not found',
        INVALID_COURSE: 'Invalid course ID'
      },
      COUPON: {
        UNIQUE_CODE_FAILED: 'Failed to generate unique coupon code after multiple attempts'
      }
    }
  },

  PARAMS: {
    INVALID_COURSE_OR_TOPIC_ID: 'Invalid course or topic ID',
    INVALID_LESSON_ID: 'Invalid lesson ID',
    UNAUTHORIZED: 'Unauthorized',
    INVALID_COURSE_ID: 'Invalid course ID',
    INVALID_TOPIC_ID: 'Invalid topic ID'
  },
  // AUTHENTICATION & SECURITY
  AUTH: {
    VALIDATION: {
      ACCOUNT: {
        IS_UNVERIFIED: 'Account is unverified.',
        EMAIL_AND_NAME_EXIST: 'Email and fullName exist in the same user',
        INVALID_PAYLOAD: 'Missing required fields'
      },
      EMAIL: {
        ALREADY_USING: 'Email already in use',
        PASSWORD_OR_EMAIL_INCORRECT: 'Incorrect email or password',
        ALREADY_VERIFIED: 'Email has already been verified',
        NOT_VERIFIED: 'Email not verified',
        EMAIL_VERIFY_BEFORE: 'Email already verified before',
        ALREADY_REGISTER_IN_SYSTEM: 'This email is already registered in our system',
        CONTAINS_WHITESPACE: 'Email must not contain spaces',
        DOMAIN_INVALID: 'Only email addresses from gmail.com or valid .edu domains are accepted',
        DOMAIN_HAS_MX: 'Email domain appears to be invalid or not configured to receive emails',
        ACCESSIBILITY: 'Email not found or has been removed. Please provide a valid email or register.',
        CONTAINS_UNICODE: 'Email contains unicode characters'
      },
      FULLNAME: {
        CONTAINS_NEW_LINE: 'Full name must not contain line breaks',
        VALID_CHARACTER:
          ' Full name contains invalid characters. Only letters, spaces, hyphens and apostrophes are allowed.',
        VALID_MUL_NAME: 'Full name must not contain multiple consecutive spaces',
        CONTAINS_NUMBER: 'Full name must not contain numbers',
        CONTAINS_XSS: 'Detection XSS attack via fullName'
      },
      USERNAME: {
        ALREADY_USING: 'Username already in use'
      },
      PASSWORD: {
        STRONG: 'Password must include uppercase, lowercase, number, and special character',
        CONTAINS_FULLNAME: "Password doesn't contain fullname",
        CONTAINS_WHITESPACE: 'Password must not contain spaces',
        CONTAINS_EMOJI: 'Password must not contain emojis or special symbols outside ASCII.',
        CONTAINS_CONTROL_CHARACTER: 'Password contains invalid control characters',
        MATCH_YOUR_EMAIL: 'Password must not contain or match your email address',
        MATCH_YOUR_FULLNAME: 'Password must not contain or match your fullname',
        INCORRECT: 'Incorrect password.',
        CHECK_SAME_COMMON_PASSWORDS: 'Password is too common and insecure. Please choose a stronger password'
      },
      CONFIRM_PASSWORD: {
        STRONG: 'Confirm-password must include uppercase, lowercase, number, and special character',
        CONTAINS_FULLNAME: "Confirm-password doesn't contain fullname",
        CONTAINS_WHITESPACE: 'Confirm-password must not contain spaces',
        CONTAINS_EMOJI: 'Confirm-password must not contain emojis or special symbols outside ASCII.',
        CONTAINS_CONTROL_CHARACTER: 'Confirm-password contains invalid control characters',
        MATCH_YOUR_EMAIL: 'Confirm-password must not contain or match your email address',
        MATCH_YOUR_FULLNAME: 'Confirm-password must not contain or match your fullname',
        CHECK_SAME_COMMON_PASSWORDS: 'Confirm-password is too common and insecure. Please choose a stronger password',
        MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm-password must match the password.'
      },
      TOKEN: {
        MISSING: 'Token is missing',
        INVALID: 'Invalid token',
        NOT_FOUND: 'Token not found in system',
        EXPIRED: 'Token has expired'
      },
      USER_ID: {
        MISSING: 'User ID is missing',
        INVALID: 'Invalid user ID'
      },
      DOB: {
        INVALID_FORMAT: 'Invalid date of birth format',
        FUTURE_DATE: 'Date of birth cannot be in the future',
        TOO_OLD: 'Date of birth cannot be more than 120 years ago',
        MIN_AGE: 'User must be at least 10 years old'
      }
    },
    LOGIN: {
      SUCCESS: 'Login successful',
      GOOGLE: 'Login with google successfully',
      INVALID_CREDENTIALS: 'Invalid email or password',
      ACCOUNT_DISABLED: 'Your account has been disabled. Please contact an administrator.',
      ACCOUNT_NOT_VERIFIED: 'Your account is not verified. Please check your email for verification instructions.',
      ACCOUNT_PENDING_APPROVAL: 'Your instructor account is pending approval by an administrator.'
    },
    REGISTER: {
      SUCCESS: 'Registration successful'
    },
    LOGOUT: {
      SUCCESS: 'Logout successful',
      ALL_DEVICES_SUCCESS: 'Logged out from all devices successfully'
    },
    VERIFY_EMAIL: {
      SUCCESS: 'Verification email successfully',
      RESEND_OTP: 'OTP has been resent to your email',
      USER_ALREADY_VERYFY_EMAIL: 'User is already verified'
    },
    PASSWORD: {
      RESET: {
        SUCCESS: 'Reset password successfully'
      },
      CHANGE: {
        SUCCESS: 'Password changed successfully'
      },
      FORGOT: {
        SUCCESS: 'Check your email to reset your password',
        VERIFY: 'Verify forgot password successfully',
        INVALID_TOKEN: 'Invalid or expired password reset token',
        INVALID_OTP: 'Invalid or expired OTP code'
      },
      ADMIN_RESET_SUCCESS: 'User password has been reset successfully by admin'
    },
    TOKEN: {
      DECODE: 'Decode token successfully',
      REFRESH_TOKEN: {
        SUCCESS: 'Refresh_token successfully',
        USED_OR_NONEXISTENT_REFRESH_TOKEN: 'Used refresh token or does not exist'
      }
    },
    // ROLES AND ADMIN
    UNAUTHORIZED_ROLE_ASSIGNMENT: 'You do not have permission to assign roles',
    USER_ALREADY_ADMIN: 'User already has admin role',
    USER_ALREADY_PRO: 'User is already a pro user',
    PRO_REQUIRED_FOR_ADMIN: 'User must be a pro user to become an admin',
    ADMIN_ROLE_ASSIGNED_SUCCESS: 'Admin role has been assigned successfully',
    PRO_STATUS_ASSIGNED_SUCCESS: 'Pro status has been activated for the user',
    TEACHER_APPROVED_SUCCESS:
      'Teacher account has been approved successfully and notification email with lecturer code has been sent'
  },

  // USER & PROFILE
  USER: {
    INVALID_ID: 'Invalid user ID',
    NOT_FOUND: 'User not found',
    NOT_VERIFIED: 'User is not verified',
    USERNAME_EXISTS: 'Username already exists',
    PAGINATION: 'Get all user using pagination',
    DISABLED_SUCCESS: 'User account has been disabled successfully',
    ENABLED_SUCCESS: 'User account has been enabled successfully',
    ALREADY_DISABLED: 'User account is already disabled',
    ALREADY_ENABLED: 'User account is already enabled',
    CANNOT_DISABLE_ADMIN: 'Cannot disable an admin account',
    CANNOT_DISABLE_SELF: 'Cannot disable your own account',
    PROFILE: {
      GET_SUCCESS: 'Profile retrieved successfully',
      UPDATE_SUCCESS: 'Profile updated successfully',
      AVATAR_UPLOAD_SUCCESS: 'Avatar uploaded successfully',
      COVER_PHOTO_UPLOAD_SUCCESS: 'Cover photo uploaded successfully'
    }
  },

  // FILE UPLOAD
  FILE: {
    UPLOAD_FAILED: 'File upload failed',
    INVALID_TYPE: 'Invalid file type. Only images are allowed',
    SIZE_EXCEEDED: 'File size exceeds the maximum limit of 5MB',
    NOT_PROVIDED: 'No file was provided',
    DELETE_FAILED: 'Failed to delete the file',
    DOCUMENT_INVALID_TYPE: 'Invalid file type. Only PDF and PowerPoint (.pptx) allowed'
  },

  // ROLE & PERMISSIONS
  ROLE: {
    CREATE_SUCCESS: 'Role created successfully',
    GET_SUCCESS: 'Role retrieved successfully',
    UPDATE_SUCCESS: 'Role updated successfully',
    DELETE_SUCCESS: 'Role deleted successfully',
    NOT_FOUND: 'Role not found',
    ALREADY_EXISTS: 'Role with this name already exists'
  },

  PERMISSION: {
    CREATE_SUCCESS: 'Permission created successfully',
    GET_SUCCESS: 'Permission retrieved successfully',
    UPDATE_SUCCESS: 'Permission updated successfully',
    DELETE_SUCCESS: 'Permission deleted successfully',
    NOT_FOUND: 'Permission not found',
    ALREADY_EXISTS: 'Permission with this name already exists'
  },

  // TOKEN & AUTHORIZATION
  TOKEN: {
    ACCESS_REQUIRED: 'Access token is required',
    REFRESH_REQUIRED: 'Refresh token is required',
    INVALID_ACCESS_TOKEN: 'Invalid or expired access token',
    USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
    INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid or expired forgot password token',
    REQUIRED: 'Token is required',
    MUST_BE_STRING: 'Token must be string'
  },

  // MEDIA & UPLOAD
  MEDIA: {
    UPLOAD_SUCCESS: 'Upload image successfully',
    UPLOAD_VIDEO_SUCCESS: 'Upload video successfully',
    GET_VIDEO_STATUS_SUCCESS: 'Video status retrieved successfully',
    RANGE_HEADER_REQUIRED: 'Required range headers',
    VIDEO_NOT_FOUND: 'Video not found'
  },

  //MESSAGE
  MESSAGE: {
    SEND_SUCCESS: 'Sended message successfully'
  },

  // GENERAL ERRORS
  ERROR: {
    INTERNAL_SERVER_ERROR: 'Internal server error',
    INSTRUCTOR: {
      ID_MISSING: 'Instructor ID is missing from token',
      ID_NOT_FOUND: 'Instructor ID not found in token'
    },
    AUTH: {
      REQUIRE_ADMIN: 'Required role admin',
      UNAUTHORIZED: 'User not authenticated'
    }
  },

  // ENVIRONMENT VARIABLES ERRORS
  ENV: {
    REQUIRED: {
      APP: {
        HOST: 'Hosting is required',
        PORT: 'Port must be a number',
        PRODUCTION_HOST: 'Hosting production is required',
        COOKIE: 'Cookie is required'
      },
      CLIENT: {
        REDIRECT_CALLBACK: 'Client redirect callback is required',
        PATH_UPLOAD_IMAGE: 'client path upload image is required'
      },
      DATABASE: {
        USERNAME: 'Mongodb username is required',
        PASSWORD: 'Mongodb password is required',
        NAME: 'Mongodb name is required',
        URL: 'Mongodb ConnnecString is required'
      },
      COLLECTION: {
        USER: 'User collection is required',
        ROLE: 'Role collection is required',
        PERMISSION: 'Permission collection is required',
        CATEGORY: 'Category collection is required',
        COURSE: 'Course collection is required',
        SESSION: 'Session collection is required',
        OTP: 'Otp collection is required',
        REFRESH_TOKEN: 'RefreshToken collection is required',
        FOLLOWS: 'Follows collection is required',
        HASHTAG: 'Hashtag collection is required',
        LESSON: 'Lesson collection is required',
        TOPIC: 'Topic collection is required',
        TOKEN: 'Token collection is required',
        QUIZ: 'Quiz collection is required',
        COUPON: 'Coupon collection is required',
        CART: 'Cart collection is required',
        BANNER: 'Banner collection is required',
        PREVIEW: 'Preview collection is required',
        QUIZ_RESULT: 'Quiz result collection is required',
        MESSAGE: 'Message collection is required',
        ENROLLMENT: 'Enrollment collection is required',
        ORDER: 'Order collection is required',
        WISHLIST: 'Wishlist collection is required',
        FEEDBACK: 'Feedback collection is required',
        COMMENT: 'Comment collection is required'
      },
      TOKEN: {
        HASH_ALGORITHMS: 'Hash algorithms is required',
        TOKEN_ALGORITHMS: 'Algorithms must be one of: HS256, RS256',
        MIN_JWT_LENGTH: 'JWT length must be at least 30 characters',
        ACCESS_TOKEN: {
          PUBLIC_KEY: 'Access token public key is required',
          PRIVATE_KEY: 'Access token private key is required',
          EXPIRED_TIME: 'ACCESS_TOKEN_EXPIRESIN must be like 15m, 1h, 7d'
        },
        REFRESH_TOKEN: {
          PUBLIC_KEY: 'Refresh token public key is required',
          PRIVATE_KEY: 'Refresh token private key is required',
          EXPIRED_TIME: 'Refresh token expired is required'
        },
        FORGOT_PASSWORD: {
          EXPIRED_TIME: 'Forgot password token expired is required',
          PRIVATE_KEY: 'Forgot password token private key is required',
          PUBLIC_KEY: 'Forgot password token public key is required'
        },
        EMAIL_VERIFY_TOKEN: {
          PRIVATE_KEY: 'Email verify token private key is required',
          EXPIRED_TIME: 'Email verify token expired is required'
        }
      },
      PASSWORD: {
        SECRET_KEY: 'Password sercet is required',
        SALTING: 'Salting must be a number'
      },
      OTP: {
        SECRET_KEY: 'Email key using send OTP is required',
        EMAIL_URL: 'Email url using send OTP is required',
        EMAIL_PASSWORD: 'Email password using send OTP is required',
        EMAIL_NAME: 'Email name using send OTP is required',
        EXPIRED_TIME: 'Otp expired is required'
      },
      GOOGLE: {
        CLIENT_ID: 'Google client id is required',
        CLIENT_SECRET: 'Google client secret key is required',
        AUTHORIZED_REDIRECT_URI: 'Google authnorized redirect url is required'
      },
      CLOUDINARY: {
        NAME: 'Cloudiary name is required',
        SECRET: 'Cloudiary secret key is required',
        KEY: 'Cloudiry key is required',
        AVATAR_FOLDER: 'Cloudiary avatar folder  is required',
        COVER_PHOTO_FOLDER: 'Cloudiray cover photo folder required',
        MATERIALS_FOLDER: 'Cloudiary materials folder is required'
      }
    }
  }
} as const
