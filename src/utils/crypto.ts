import { createHash } from 'crypto'
import { env } from '~/config/env.config'

export const initialHashPassword = (content: string) => {
  return createHash(env.HASH_ALGORITHMS as string)
    .update(content)
    .digest('hex')
}

export const hashPassword = (password: string) => {
  return initialHashPassword(password + env.PASSWORD_SECRET)
}

export const comparePassword = (plainPassword: string, hashedPassword: string): boolean => {
  const hashedPlainPassword = hashPassword(plainPassword)
  return hashedPlainPassword === hashedPassword
}
