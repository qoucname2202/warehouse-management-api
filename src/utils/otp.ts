import crypto from 'crypto'
import { env } from '~/config/env.config'

/**
 * Generate a 6-digit OTP
 * @returns A 6-digit OTP string
 */
export const generateOTP = (): string => {
  // Generate a random 6-digit number
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Encrypt an OTP code
 * @param otp The plain text OTP
 * @returns Encrypted OTP
 */
export const encryptOTP = (otp: string): string => {
  return crypto.createHmac('sha256', env.PASSWORD_SECRET).update(otp).digest('hex')
}

/**
 * Verify an OTP against its encrypted version
 * @param plainOtp The plain text OTP provided by the user
 * @param encryptedOtp The encrypted OTP stored in the database
 * @returns Boolean indicating if the OTP is valid
 */
export const verifyOTP = (plainOtp: string, encryptedOtp: string): boolean => {
  const encryptedPlainOtp = encryptOTP(plainOtp)
  return encryptedPlainOtp === encryptedOtp
}

/**
 * Create an OTP expiration date (15 minutes from now)
 * @returns Date object 15 minutes from current time
 */
export const createOTPExpiration = (): Date => {
  const expirationDate = new Date()
  expirationDate.setMinutes(expirationDate.getMinutes() + 15)
  return expirationDate
}
