import dotenv from 'dotenv'
import path from 'path'
import { z } from 'zod'
import { MESSAGE } from '~/constants/message'

// Determine the appropriate .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
const envPath = path.resolve(process.cwd(), envFile)

// Load environment variables from the selected .env file
dotenv.config({ path: envPath })

const allowedPorts = ['3000', '5000', '5500', '8080', '443']

const envSchema = z.object({
  APP_PORT: z.string().refine((port) => allowedPorts.includes(port), {
    message: `APP_PORT must be one of ${allowedPorts.join(', ')}`
  }),
  APP_HOST: z.string().min(1, MESSAGE.ENV.REQUIRED.APP.HOST),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ALLOWED_PORTS: z.string().optional(),
  SALT_OR_ROUNDS: z.string().min(1, MESSAGE.ENV.REQUIRED.PASSWORD.SALTING),

  // DATABASE CONFIGURATION
  DB_NAME: z.string().min(1, MESSAGE.ENV.REQUIRED.DATABASE.NAME),
  DB_URL: z.string().min(1, MESSAGE.ENV.REQUIRED.DATABASE.URL),
  DB_USER_COLLECTION: z.string().min(1, MESSAGE.ENV.REQUIRED.COLLECTION.USER),
  DB_ROLE_COLLECTION: z.string().min(1, MESSAGE.ENV.REQUIRED.COLLECTION.ROLE),
  DB_PERMISSION_COLLECTION: z.string().min(1, MESSAGE.ENV.REQUIRED.COLLECTION.PERMISSION),
  DB_OTP_COLLECTION: z.string().min(1, MESSAGE.ENV.REQUIRED.COLLECTION.OTP),
  DB_TOKEN_COLLECTION: z.string().min(1, MESSAGE.ENV.REQUIRED.COLLECTION.TOKEN),

  // SECURITY & JWT
  PASSWORD_SECRET: z.string().min(1, MESSAGE.ENV.REQUIRED.PASSWORD.SECRET_KEY),
  ACCESS_TOKEN_PRIVATE_KEY: z.string().min(1, MESSAGE.ENV.REQUIRED.TOKEN.ACCESS_TOKEN.PRIVATE_KEY),
  ACCESS_TOKEN_PUBLIC_KEY: z.string().min(1, MESSAGE.ENV.REQUIRED.TOKEN.ACCESS_TOKEN.PUBLIC_KEY),
  REFRESH_TOKEN_PRIVATE_KEY: z.string().min(1, MESSAGE.ENV.REQUIRED.TOKEN.REFRESH_TOKEN.PRIVATE_KEY),
  REFRESH_TOKEN_PUBLIC_KEY: z.string().min(1, MESSAGE.ENV.REQUIRED.TOKEN.REFRESH_TOKEN.PUBLIC_KEY),
  EMAIL_VERIFY_TOKEN_PRIVATE_KEY: z.string().min(1, MESSAGE.ENV.REQUIRED.TOKEN.EMAIL_VERIFY_TOKEN.PRIVATE_KEY),
  HASH_ALGORITHMS: z.string().min(1, MESSAGE.ENV.REQUIRED.TOKEN.HASH_ALGORITHMS),
  TOKEN_ALGORITHMS: z
    .enum(['HS256', 'RS256'], {
      errorMap: () => ({
        message: MESSAGE.ENV.REQUIRED.TOKEN.TOKEN_ALGORITHMS
      })
    })
    .default('HS256'),
  COOKIE_NAME: z.string().min(1, MESSAGE.ENV.REQUIRED.APP.COOKIE),
  ACCESS_TOKEN_EXPIRESIN: z.string().min(1, MESSAGE.ENV.REQUIRED.TOKEN.ACCESS_TOKEN.EXPIRED_TIME),
  REFRESH_TOKEN_EXPIRESIN: z.string().min(1, MESSAGE.ENV.REQUIRED.TOKEN.REFRESH_TOKEN.EXPIRED_TIME),
  EMAIL_VERIFY_TOKEN_EXPIRESIN: z.string().min(1, MESSAGE.ENV.REQUIRED.TOKEN.EMAIL_VERIFY_TOKEN.EXPIRED_TIME),
  FORGOT_PASSWORD_TOKEN_EXPIRESIN: z.string().min(1, MESSAGE.ENV.REQUIRED.TOKEN.FORGOT_PASSWORD.EXPIRED_TIME),
  FORGOT_PASSWORD_TOKEN_PRIVATE_KEY: z.string().min(1, MESSAGE.ENV.REQUIRED.TOKEN.FORGOT_PASSWORD.PRIVATE_KEY),
  MIN_JWT_LENGTH: z.string().min(1, MESSAGE.ENV.REQUIRED.TOKEN.MIN_JWT_LENGTH),

  CLIENT_REDIRECT_CALLBACK: z.string().optional().default(''),
  CLIENT_PATH_UPLOAD_IMAGE: z.string().optional().default(''),
  PRODUCTION_HOST: z.string().optional().default(''),

  // GOOGLE (optional - for OAuth if needed later)
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_AUTHORIZED_REDIRECT_URI: z.string().optional().default(''),

  // OTP
  OTP_SECRET: z.string().min(1, MESSAGE.ENV.REQUIRED.OTP.SECRET_KEY),
  OTP_EMAIL: z.string().min(1, MESSAGE.ENV.REQUIRED.OTP.EMAIL_URL),
  OTP_EMAIL_PASSWORD: z.string().min(1, MESSAGE.ENV.REQUIRED.OTP.EMAIL_PASSWORD),
  OTP_EMAIL_NAME: z.string().min(1, MESSAGE.ENV.REQUIRED.OTP.EMAIL_NAME),
  OTP_EXPIRESIN: z.string().min(1, MESSAGE.ENV.REQUIRED.OTP.EXPIRED_TIME),

  // CLOUDIARY
  CLOUDINARY_NAME: z.string().min(1, MESSAGE.ENV.REQUIRED.CLOUDINARY.NAME),
  CLOUDINARY_SECRET: z.string().min(1, MESSAGE.ENV.REQUIRED.CLOUDINARY.SECRET),
  CLOUDINARY_KEY: z.string().min(1, MESSAGE.ENV.REQUIRED.CLOUDINARY.KEY),
  CLOUDINARY_AVATAR_FOLDER: z.string().min(1, MESSAGE.ENV.REQUIRED.CLOUDINARY.AVATAR_FOLDER),
  CLOUDINARY_COVER_PHOTO_FOLDER: z.string().min(1, MESSAGE.ENV.REQUIRED.CLOUDINARY.COVER_PHOTO_FOLDER)
})

export const validateEnv = () => {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('Invalid environment variables:')
    result.error.issues.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`)
    })
    process.exit(1)
  }

  return result.data
}

export const env = validateEnv()
