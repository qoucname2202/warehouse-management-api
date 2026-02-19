import { Request, Response, NextFunction, RequestHandler } from 'express'

/**
 * Wraps an async request handler to catch and forward errors to the global error handler.
 * This prevents unhandled promise rejections and ensures consistent error handling.
 *
 * @param {RequestHandler} fn - The async request handler function.
 * @returns {RequestHandler} A new function that wraps `fn` with a try/catch block.
 */
export const wrapRequestHandler =
  <P>(fn: RequestHandler<P>) =>
  async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error) // Forward error to global error middleware
    }
  }
