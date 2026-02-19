import { differenceInYears, parseISO } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { TokenDuration } from './interface/Jwt.interface'
import dns from 'dns/promises'
import { User } from '~/models/User.schema'
import emojiRegex from 'emoji-regex'
import { MESSAGE } from '~/constants/message'

const emoji = emojiRegex()

// Caculating Age when user enter date-of-birth
export const calculateAge = (birthdate: string): number => {
  const birthDate = parseISO(birthdate)
  const today = new Date()
  return differenceInYears(today, birthDate)
}

// Generate username
export const generateUsername = (fullName: string): string => {
  const normalizedName = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')

  const randomString = uuidv4().split('-')[0]
  return `${normalizedName}_${randomString}`
}

// Generate a lecturer code based on name initials and birth date
export const generateLecturerCode = (fullName: string, dateOfBirth: Date): string => {
  if (!fullName || !dateOfBirth) {
    return ''
  }

  // Remove accents and normalize name
  const normalizedName = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()

  // Split name into components
  const nameComponents = normalizedName.split(' ').filter((part) => part.trim() !== '')

  // Take first letter of each name component
  const nameInitials = nameComponents.map((part) => part.charAt(0)).join('')

  // Format the date as DDMMYY
  const day = String(dateOfBirth.getDate()).padStart(2, '0')
  const month = String(dateOfBirth.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  const year = String(dateOfBirth.getFullYear()).slice(-2)
  const dateFormatted = `${day}${month}${year}`

  return `${nameInitials}${dateFormatted}`
}

// Validation url avatar and cover photo
export const isValidImageUrl = (url: string): boolean => {
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z]{2,6})([/\w .-]*)*\/?$/
  const imageRegex = /\.(jpeg|jpg|gif|png)$/

  return urlRegex.test(url) && imageRegex.test(url)
}

// Validation gender
export const isValidGender = (gender: string): boolean => {
  const validGenders = ['male', 'female', 'other']
  return validGenders.includes(gender.toLowerCase())
}

// Validatio token type
export const isValidTokenType = (type: string): boolean => {
  const tokenTypeLst = ['AccessToken', 'RefreshToken', 'ForgotPasswordToken', 'EmailVerifyToken'].map((item) =>
    item.trim().toLowerCase()
  )
  return tokenTypeLst.includes(type.trim().toLowerCase())
}

export const formatToVietnamTime = (timestamp: number) => {
  try {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp * 1000)
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch (error: any) {
    return `Lỗi: ${error.message}`
  }
}

// Generate Strong Password
export const generatePassword = () => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const password = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)]
  ]

  const allChars = lowercase + uppercase + numbers + special
  while (password.length < 12) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)])
  }
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[password[i], password[j]] = [password[j], password[i]]
  }

  return password.join('')
}

// Caculator token duration
export const calculateTokenDuration = (startTimestamp: number, endTimestamp: number): TokenDuration => {
  // Validate input
  if (!Number.isInteger(startTimestamp) || !Number.isInteger(endTimestamp)) {
    throw new Error('Timestamps phải là số nguyên')
  }

  if (endTimestamp < startTimestamp) {
    throw new Error('Timestamp kết thúc phải lớn hơn timestamp bắt đầu')
  }

  const startDate: Date = new Date(startTimestamp * 1000)
  const endDate: Date = new Date(endTimestamp * 1000)
  const durationMs: number = endDate.getTime() - startDate.getTime()

  const hours: number = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes: number = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds: number = Math.floor((durationMs % (1000 * 60)) / 1000)

  const padZero = (num: number): string => num.toString().padStart(2, '0')

  return {
    hours,
    minutes,
    seconds,
    formatted: `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`,
    humanReadable: `${hours} giờ ${minutes} phút ${seconds} giây`
  }
}

// Check if string contains newline or not
export const containsNewline = (value: string): boolean => /\r|\n/.test(value)

// Check string contains only letters, spaces, hyphens, apostrophes
export const isValidNameCharater = (value: string): boolean => {
  const nameRegex = /^[\p{L}\p{M}\s'.-]+$/u
  return nameRegex.test(value)
}

// Check that it does not contain multiple consecutive spaces
export const isValidMulName = (value: string): boolean => {
  return !/\s{2,}/.test(value.trim())
}

// Standardize names: remove extra spaces, capitalize the first letter of each word
export const normalizeFullName = (name: string): string => {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

// Check email must not contain spaces.
export const hasWhitespace = (value: string) => /\s/.test(value)

// Only gmail.com or .edu domains are accepted.
const allowedDomainPattern = /^(gmail\.com|[a-zA-Z0-9.-]+\.edu)$/i
export const isAllowedDomainFormat = (domain: string) => allowedDomainPattern.test(domain)

// Check email domain is not valid or cannot receive emails
export const verifyDomainHasMX = async (domain: string): Promise<boolean> => {
  try {
    const mxRecords = await dns.resolveMx(domain)
    return mxRecords && mxRecords.length > 0
  } catch {
    return false
  }
}

//
const COMMON_PASSWORDS = new Set([
  '1234567890',
  '012345678',
  'password',
  '12345678',
  '123456789',
  'iloveyou',
  '11111111',
  '123123123',
  'abc123',
  'password1'
])

const normalizeUnicode = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

// Checks password and returns specific error message if invalid
export const isValidPassword = (
  value: string,
  context?: { email?: string; full_name?: string },
  status?: boolean
): string | undefined => {
  if (/\s/.test(value)) {
    return status === true
      ? MESSAGE.AUTH.VALIDATION.CONFIRM_PASSWORD.CONTAINS_FULLNAME
      : MESSAGE.AUTH.VALIDATION.PASSWORD.CONTAINS_FULLNAME
  }
  if (emoji.test(value)) {
    return status === true
      ? MESSAGE.AUTH.VALIDATION.CONFIRM_PASSWORD.CONTAINS_EMOJI
      : MESSAGE.AUTH.VALIDATION.PASSWORD.CONTAINS_EMOJI
  }
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001F\u007F]/.test(value)) {
    return status === true
      ? MESSAGE.AUTH.VALIDATION.CONFIRM_PASSWORD.CONTAINS_CONTROL_CHARACTER
      : MESSAGE.AUTH.VALIDATION.PASSWORD.CONTAINS_CONTROL_CHARACTER
  }

  const normalized = value.toLowerCase()
  const plain = normalizeUnicode(value)

  if (context?.email && normalized.includes(context.email.toLowerCase())) {
    return MESSAGE.AUTH.VALIDATION.PASSWORD.MATCH_YOUR_EMAIL
  }
  if (context?.full_name) {
    const plainFullName = normalizeUnicode(context.full_name)
    if (plain.includes(plainFullName)) {
      return MESSAGE.AUTH.VALIDATION.PASSWORD.MATCH_YOUR_FULLNAME
    }
  }
  if (COMMON_PASSWORDS.has(normalized)) {
    return MESSAGE.AUTH.VALIDATION.PASSWORD.CHECK_SAME_COMMON_PASSWORDS
  }

  return undefined
}

/**
 * Normalize user emails for consistent comparison and storage
 * @param email - input email string
 * @returns normalized email (lowercase, spaces removed)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function generateInstructorId(fullName: string, dateOfBirth?: Date): string {
  if (!dateOfBirth) return ''

  const nameParts = fullName.trim().split(' ')
  const initials = nameParts.map((part) => part[0].toUpperCase()).join('')

  const day = String(dateOfBirth.getDate()).padStart(2, '0')
  const month = String(dateOfBirth.getMonth() + 1).padStart(2, '0')
  const year = String(dateOfBirth.getFullYear()).slice(-2)

  return `${initials}${day}${month}${year}`
}
