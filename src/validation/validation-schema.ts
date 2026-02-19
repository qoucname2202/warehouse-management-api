import express from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/errors/Errors'

/**
 * Middleware validate request body using express-validator.
 * @param {ValidationChain[]} validation - Express-validator validation chains
 * @returns {Function} Express middleware function
 */
export const validate = (validation: ValidationChain[]) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await Promise.all(validation.map((v) => v.run(req)))

    const errors = validationResult(req)

    if (errors.isEmpty()) {
      return next()
    }

    const errorsObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })

    for (const key in errorsObject) {
      const { msg } = errorsObject[key]

      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }

      entityError.errors[key] = errorsObject[key]
    }

    next(entityError)
  }
}
