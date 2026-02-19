// src/middlewares/checkPort.middleware.ts

import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env.config'

export const checkPortMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const DEFAULT_ALLOWED_PORTS = ['4000', '5000', '8080', '443', '57600']
  const allowedPorts = env.ALLOWED_PORTS?.split(',').map((p) => p.trim()) || DEFAULT_ALLOWED_PORTS

  const hostHeader = req.headers.host
  const requestPort = hostHeader?.includes(':') ? hostHeader.split(':')[1] : ''

  const isAllowed = !requestPort || allowedPorts.includes(requestPort)

  if (!isAllowed) {
    return res.status(403).json({ message: 'Access denied: Port is not allowed.' })
  }

  next()
}
