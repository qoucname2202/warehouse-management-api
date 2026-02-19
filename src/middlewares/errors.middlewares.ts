import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
import HttpStatusCode from '~/constants/httpStatus'
import { MESSAGE } from '~/constants/message'
import { EntityError, ErrorWithStatus } from '~/errors/Errors'
import logger from '~/utils/logger'
import { ResponseMessage } from '~/config/reponse.config'

/**
 * Global error handler middleware for catching and formatting all unhandled exceptions.
 * Ensures consistent error response structure and safe error logging.
 */
export const defaultErrorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): Response => {
  try {
    // Log the error for observability
    logger.error('Error handler caught:', err)

    // Handle our custom error hierarchy first
    if (err instanceof ErrorWithStatus) {
      // Validation error (HTTP 422) – include field errors in responseData
      if (err instanceof EntityError) {
        return ResponseMessage.unprocessableEntity(res, err.errors, err.message)
      }

      // Map other known HTTP status codes to the unified response format
      switch (err.status) {
        case HttpStatusCode.BAD_REQUEST:
          return ResponseMessage.badRequest(res, err.value ?? null, err.message)
        case HttpStatusCode.UN_AUTHORIZED:
          return ResponseMessage.unauthorized(res, err.value ?? null, err.message)
        case HttpStatusCode.FORBIDDEN:
          return ResponseMessage.forbidden(res, err.value ?? null, err.message)
        case HttpStatusCode.NOT_FOUND:
          return ResponseMessage.notFound(res, err.value ?? null, err.message)
        case HttpStatusCode.CONFLICT:
          return ResponseMessage.conflict(res, err.value ?? null, err.message)
        default:
          // Fallback for custom status codes – still mark as internal error in our response contract
          return ResponseMessage.error(res, err.value ?? null, err.message)
      }
    }

    // Handle generic errors with unknown structure
    const safeError: Record<string, unknown> = {}

    Object.getOwnPropertyNames(err as object).forEach((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(err, key)
      if (descriptor?.writable && descriptor?.configurable) {
        safeError[key] = (err as any)[key]
      }
    })

    // Internal server error for unhandled exceptions
    return ResponseMessage.error(res, omit(safeError, ['stack']), MESSAGE.ERROR.INTERNAL_SERVER_ERROR)
  } catch (internalHandlerError) {
    // Fallback if even the error handler fails (very rare)
    logger.error('Error handler itself failed:', internalHandlerError)
    return ResponseMessage.error(
      res,
      omit(internalHandlerError as object, ['stack']),
      MESSAGE.ERROR.INTERNAL_SERVER_ERROR
    )
  }
}
