import jwt from 'jsonwebtoken'
import { IJwtInterface } from './interface/Jwt.interface'
import { env } from '~/config/env.config'
import { ErrorWithStatus } from '~/errors/Errors'
import HttpStatusCode from '~/constants/httpStatus'
import { REGEX_JWT_TOKEN } from '~/constants/regex'

export const signToken = ({
  payload,
  privateKey = env.ACCESS_TOKEN_PUBLIC_KEY as string,
  options
}: IJwtInterface): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        throw reject(error)
      }
      resolve(token as string)
    })
  })
}

export const verifyToken = ({
  token,
  secretOrPublicKey = env.ACCESS_TOKEN_PUBLIC_KEY as string
}: {
  token: string
  secretOrPublicKey?: string
}) => {
  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if (error) {
        throw reject(
          new ErrorWithStatus({
            message: 'Unauthorization',
            status: HttpStatusCode.UN_AUTHORIZED,
            value: error
          })
        )
      }
      resolve(decoded as jwt.JwtPayload)
    })
  })
}

/**
 * Validate JWT format using base64url regex and minimum length
 */
export function isValidJwtFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false
  if (token.length < Number(env.MIN_JWT_LENGTH)) return false
  return REGEX_JWT_TOKEN.test(token)
}
