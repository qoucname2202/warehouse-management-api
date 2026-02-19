import tokenService from '~/services/token.service'
import logger from './logger'

let tokenCleanupInterval: NodeJS.Timeout | null = null

/**
 * Start token cleanup scheduler
 * @param intervalMs Cleanup interval in milliseconds (default: 1 hour)
 */
export const startTokenCleanup = (intervalMs: number = 60 * 60 * 1000): void => {
  // Clear any existing interval
  if (tokenCleanupInterval) {
    clearInterval(tokenCleanupInterval)
    tokenCleanupInterval = null
  }

  // Schedule token cleanup
  tokenCleanupInterval = setInterval(async () => {
    try {
      logger.info('Running scheduled token cleanup')
      await tokenService.cleanupExpiredTokens()
      logger.info('Token cleanup completed')
    } catch (error) {
      logger.error('Token cleanup failed:', error)
    }
  }, intervalMs)

  logger.info(`Token cleanup scheduled to run every ${intervalMs / 1000 / 60} minutes`)
}

/**
 * Stop token cleanup scheduler
 */
export const stopTokenCleanup = (): void => {
  if (tokenCleanupInterval) {
    clearInterval(tokenCleanupInterval)
    tokenCleanupInterval = null
    logger.info('Token cleanup scheduler stopped')
  }
}

/**
 * Run token cleanup once
 */
export const runTokenCleanup = async (): Promise<void> => {
  try {
    logger.info('Running manual token cleanup')
    await tokenService.cleanupExpiredTokens()
    logger.info('Token cleanup completed')
  } catch (error) {
    logger.error('Token cleanup failed:', error)
    throw error
  }
}
