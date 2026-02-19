import { SignOptions } from 'jsonwebtoken'
import { TokenType, UserRole } from '~/constants/enums'

export interface IJwtInterface {
  payload: string | Buffer | object
  privateKey: string
  options: SignOptions
}

export interface TokenDuration {
  hours: number
  minutes: number
  seconds: number
  formatted: string
  humanReadable: string
}

export interface TokenTimestamps {
  startTimestamp: number
  endTimestamp: number
}

// Base interface for token payload
export interface TokenPayload {
  sub: string
  type: TokenType
  iat: number
  exp: number
}

// Interface for access token payload
export interface AccessTokenPayload extends TokenPayload {
  roles: string[]
  email: string
}

// Interface for refresh token payload
export interface RefreshTokenPayload extends TokenPayload {
  tokenId: string
}

// Interface for token validation result
export interface TokenValidationResult {
  valid: boolean
  expired: boolean
  payload?: any
  error?: string
}
