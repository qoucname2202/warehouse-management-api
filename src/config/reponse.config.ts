import { Response } from 'express'
import HttpStatusCode from '~/constants/httpStatus'
import { getCurrentTimestamp } from '~/utils/date'

export interface ResponseStatus {
  responseCode: string
  responseMessage: string
  tracingMessage: string
}

export interface ApiResponse<T> {
  responseDateTime: string
  responseStatus: ResponseStatus
  responseData: T | null
}

export const ResponseCodes = {
  SUCCESS: '00000000',
  UNAUTHORIZED: '01010001',
  BAD_REQUEST: '01010002',
  FORBIDDEN: '01010003',
  NOT_FOUND: '01010004',
  VALIDATION_ERROR: '01010022',
  CONFLICT: '01010009',
  INTERNAL_ERROR: '01019999'
} as const

type ResponseCode = (typeof ResponseCodes)[keyof typeof ResponseCodes]

const buildBaseResponse = <T>(code: ResponseCode, message: string, data: T | null): ApiResponse<T> => {
  return {
    responseDateTime: getCurrentTimestamp(),
    responseStatus: {
      responseCode: code,
      responseMessage: message,
      tracingMessage: ''
    },
    responseData: data
  }
}

export const ResponseMessage = {
  /**
   * HTTP 200 OK
   */
  success: <T>(res: Response, data: T, message: string) => {
    const body = buildBaseResponse(ResponseCodes.SUCCESS, message, data)
    return res.status(HttpStatusCode.OK).json(body)
  },

  /**
   * HTTP 201 Created
   */
  created: <T>(res: Response, data: T, message: string) => {
    const body = buildBaseResponse(ResponseCodes.SUCCESS, message, data)
    return res.status(HttpStatusCode.CREATED).json(body)
  },

  /**
   * HTTP 204 No Content
   * Note: responseData is always null by definition.
   */
  noContent: (res: Response, message: string) => {
    const body = buildBaseResponse<null>(ResponseCodes.SUCCESS, message, null)
    return res.status(HttpStatusCode.NO_CONTENT).json(body)
  },

  /**
   * HTTP 400 Bad Request
   */
  badRequest: <T>(res: Response, data: T | null, message: string) => {
    const body = buildBaseResponse(ResponseCodes.BAD_REQUEST, message, data)
    return res.status(HttpStatusCode.BAD_REQUEST).json(body)
  },

  /**
   * HTTP 401 Unauthorized
   */
  unauthorized: <T>(res: Response, data: T | null, message: string) => {
    const body = buildBaseResponse(ResponseCodes.UNAUTHORIZED, message, data)
    return res.status(HttpStatusCode.UN_AUTHORIZED).json(body)
  },

  /**
   * HTTP 403 Forbidden
   */
  forbidden: <T>(res: Response, data: T | null, message: string) => {
    const body = buildBaseResponse(ResponseCodes.FORBIDDEN, message, data)
    return res.status(HttpStatusCode.FORBIDDEN).json(body)
  },

  /**
   * HTTP 404 Not Found
   */
  notFound: <T>(res: Response, data: T | null, message: string) => {
    const body = buildBaseResponse(ResponseCodes.NOT_FOUND, message, data)
    return res.status(HttpStatusCode.NOT_FOUND).json(body)
  },

  /**
   * HTTP 409 Conflict
   */
  conflict: <T>(res: Response, data: T | null, message: string) => {
    const body = buildBaseResponse(ResponseCodes.CONFLICT, message, data)
    return res.status(HttpStatusCode.CONFLICT).json(body)
  },

  /**
   * HTTP 422 Unprocessable Entity (validation errors).
   */
  unprocessableEntity: <T>(res: Response, data: T, message: string) => {
    const body = buildBaseResponse(ResponseCodes.VALIDATION_ERROR, message, data)
    return res.status(HttpStatusCode.UNPROCESSABLE_ENTITY).json(body)
  },

  /**
   * HTTP 500 Internal Server Error
   */
  error: <T>(res: Response, data: T | null, message: string) => {
    const body = buildBaseResponse(ResponseCodes.INTERNAL_ERROR, message, data)
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(body)
  }
}
