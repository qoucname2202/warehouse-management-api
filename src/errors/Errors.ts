import HttpStatusCode from '~/constants/httpStatus'
import { MESSAGE } from '~/constants/message'
import { ErrorsType } from '~/errors/errors.type'
import { getCurrentTimestamp } from '~/utils/date'

// 400: lỗi parse, sai định dạng JSON, thiếu Content-Type, request bị lỗi format
// 422: validate body đúng JSON, nhưng rule như min/max, type check bị sai
export class ErrorWithStatus {
  message: string
  status: number
  value?: unknown
  dateTime?: string
  constructor({ message, status, value }: { message: string; status: number; value?: unknown }) {
    this.message = message
    this.status = status
    this.value = value
    this.dateTime = getCurrentTimestamp()
  }
}

/**
 * Represents input validation errors (HTTP 422).
 * Example: Body is well-formed JSON but violates field rules like min/max/type.
 */
export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({ message = MESSAGE.VALIDATION.ERROR, errors }: { message?: string; errors: ErrorsType }) {
    super({ message, status: HttpStatusCode.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}

/**
 * Represents system-level internal server errors (HTTP 500).
 */
export class SystemError extends ErrorWithStatus {
  constructor(message = MESSAGE.VALIDATION.ERROR, value?: unknown) {
    super({ message, status: HttpStatusCode.INTERNAL_SERVER_ERROR, value })
  }
}
