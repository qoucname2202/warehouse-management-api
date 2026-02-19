import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { TokenType } from '~/constants/enums'
import { env } from '~/config/env.config'
import { Token } from '~/models/Token.schema'
import { TokenPayload } from '~/utils/interface/Jwt.interface'
import { AccessTokenPayload, RefreshTokenPayload, TokenValidationResult } from '~/utils/interface/Jwt.interface'
import { databaseServices } from './database.service'

// Cached blacklist of invalidated tokens
const tokenBlacklist = new Set<string>()

// Helper to return invalid result
const invalidToken = (error: string): TokenValidationResult => ({
  valid: false,
  expired: false,
  error
})

const TOKEN_SECRET_MAP: Record<TokenType, string> = {
  [TokenType.AccessToken]: env.ACCESS_TOKEN_PRIVATE_KEY,
  [TokenType.RefreshToken]: env.REFRESH_TOKEN_PRIVATE_KEY,
  [TokenType.ForgotPasswordToken]: env.FORGOT_PASSWORD_TOKEN_PRIVATE_KEY,
  [TokenType.OTPVerify]: env.OTP_SECRET
}

const tokenService = {
  /**
   * Generate an access token for a user
   * @param userId User ID
   * @param email User email
   * @param roles User role IDs
   * @returns Access token
   */
  generateAccessToken: async (userId: string, email: string, roles: ObjectId[]): Promise<string> => {
    const roleIds = roles.map((role) => role.toString())

    const payload: AccessTokenPayload = {
      sub: userId,
      type: TokenType.AccessToken,
      email,
      roles: roleIds,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + parseInt(env.ACCESS_TOKEN_EXPIRESIN)
    }

    return jwt.sign(payload, env.ACCESS_TOKEN_PRIVATE_KEY)
  },

  /**
   * Generate a refresh token for a user
   * @param userId User ID
   * @returns Refresh token and its ID
   */
  generateRefreshToken: async (userId: string): Promise<{ token: string; tokenId: string }> => {
    const tokenId = new ObjectId().toString()

    const payload: RefreshTokenPayload = {
      sub: userId,
      type: TokenType.RefreshToken,
      tokenId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + parseInt(env.REFRESH_TOKEN_EXPIRESIN)
    }

    const token = jwt.sign(payload, env.REFRESH_TOKEN_PRIVATE_KEY)

    // Store refresh token in database for invalidation
    const newToken = new Token({
      token_id: tokenId,
      user_id: new ObjectId(userId),
      token,
      type: TokenType.RefreshToken,
      expires_at: new Date(payload.exp * 1000)
    })

    await databaseServices.tokens.insertOne(newToken)

    return { token, tokenId }
  },

  /**
   * Generate a forgot password token
   * @param userId User ID
   * @returns Token
   */
  generateForgotPasswordToken: async (userId: string): Promise<string> => {
    const payload = {
      sub: userId,
      type: TokenType.ForgotPasswordToken,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + parseInt(env.FORGOT_PASSWORD_TOKEN_EXPIRESIN)
    }

    return jwt.sign(payload, env.FORGOT_PASSWORD_TOKEN_PRIVATE_KEY)
  },

  /**
   * Validate a token
   * @param token The token to validate
   * @param expectedType Expected token type
   * @returns Token validation result
   */
  validateToken: async (token: string, expectedType: TokenType): Promise<TokenValidationResult> => {
    try {
      // Check if token is blacklisted
      if (tokenBlacklist.has(token)) {
        return invalidToken('Token has been invalidated')
      }

      // Choose the appropriate key based on token type
      const secret = TOKEN_SECRET_MAP[expectedType]
      if (!secret) return invalidToken('Unsupported token type')

      // Verify token
      const payload = jwt.verify(token, secret) as TokenPayload

      // Check token type
      if (payload.type !== expectedType) {
        return invalidToken(`Invalid token type. Expected '${expectedType}', got '${payload.type}'`)
      }

      // If it's a refresh token, verify it exists in database and hasn't been revoked
      if (expectedType === TokenType.RefreshToken) {
        const refreshPayload = payload as RefreshTokenPayload

        if (!refreshPayload.tokenId || !payload.sub) {
          return invalidToken('Malformed refresh token payload')
        }

        const tokenDoc = await databaseServices.tokens.findOne(
          {
            token_id: refreshPayload.tokenId,
            user_id: new ObjectId(payload.sub),
            type: TokenType.RefreshToken,
            is_removed: { $ne: true }
          },
          { projection: { _id: 1 } }
        )

        if (!tokenDoc) {
          return invalidToken('Token has been revoked or does not exist')
        }
      }

      return {
        valid: true,
        expired: false,
        payload
      }
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return invalidToken('Token has expired')
      }
      return invalidToken(error.message || 'Invalid token')
    }
  },

  /**
   * Invalidate a token by adding it to blacklist
   * @param token The token to invalidate
   */
  invalidateToken: async (token: string): Promise<void> => {
    // Add to in-memory blacklist for immediate effect
    tokenBlacklist.add(token)

    try {
      // Parse the token to get token ID for database update
      const payload = jwt.decode(token) as RefreshTokenPayload

      if (payload?.tokenId && payload?.sub && payload?.type === TokenType.RefreshToken) {
        // Mark the token as removed in the database for persistence
        await databaseServices.tokens.updateOne(
          {
            token_id: payload.tokenId,
            user_id: new ObjectId(payload.sub),
            type: TokenType.RefreshToken
          },
          {
            $set: { is_removed: true }
          }
        )
      }
    } catch (error) {
      // If token parsing fails, we still have it in the in-memory blacklist
      console.error('Failed to invalidate token in database:', error)
    }
  },

  /**
   * Invalidate all refresh tokens for a user
   * @param userId User ID
   */
  invalidateAllUserRefreshTokens: async (userId: string): Promise<void> => {
    await databaseServices.tokens.updateMany(
      {
        user_id: new ObjectId(userId),
        type: TokenType.RefreshToken
      },
      {
        $set: { is_removed: true }
      }
    )
  },

  /**
   * Clean up expired tokens from database
   */
  cleanupExpiredTokens: async (): Promise<{ deletedCount: number }> => {
    const result = await databaseServices.tokens.deleteMany({
      expires_at: { $lt: new Date() }
    })

    return { deletedCount: result.deletedCount || 0 }
  },

  /**
   * Get token statistics
   * @returns Token statistics including counts by status
   */
  getTokenStats: async (): Promise<{
    totalActive: number
    totalRemoved: number
    totalExpired: number
    activeByType: Record<string, number>
  }> => {
    const now = new Date()

    // Get active tokens count by type
    const activeByType = await databaseServices.tokens
      .aggregate([
        {
          $match: {
            is_removed: { $ne: true },
            expires_at: { $gt: now }
          }
        },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()

    // Get total active tokens count
    const totalActive = await databaseServices.tokens.countDocuments({
      is_removed: { $ne: true },
      expires_at: { $gt: now }
    })

    // Get total removed tokens count
    const totalRemoved = await databaseServices.tokens.countDocuments({
      is_removed: true
    })

    // Get total expired tokens count
    const totalExpired = await databaseServices.tokens.countDocuments({
      expires_at: { $lte: now }
    })

    // Convert array of type counts to object
    const activeByTypeObject = activeByType.reduce((acc, curr) => {
      acc[curr._id] = curr.count
      return acc
    }, {} as Record<string, number>)

    return {
      totalActive,
      totalRemoved,
      totalExpired,
      activeByType: activeByTypeObject
    }
  }
}

export default tokenService
