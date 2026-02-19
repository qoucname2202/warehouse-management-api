import express, { Request, Response, NextFunction } from 'express'
import compression from 'compression'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import path from 'path'
import { env, validateEnv } from './config/env.config'
import rootRouter from './routes'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import { setupSwagger } from './config/swagger.config'
import { initFolder } from './utils/file'
import Logging from './library/logging'
import logger from './utils/logger'
import { databaseServices } from './services/database.service'
import { checkPortMiddleware } from './middlewares/port.middlewares'

const app = express()
const httpServer = createServer(app)

// Validate environment variables before startup
validateEnv()

// Initialize upload directories
initFolder()

// Setup Swagger API documentation
setupSwagger(app)

// Port safety middleware (optional - block disallowed ports)
app.use(checkPortMiddleware)

// Request logging
app.use(Logging.logger)

// Security headers
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))

// Basic rate limiting to protect API from abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
})

// Apply limiters
app.use('/api', apiLimiter)
app.use('/api/v1/auth', authLimiter)

// Response compression
app.use(compression())

// CORS configuration
app.use(
  cors({
    origin: '*', // consider restricting this to specific client origins in production
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: false
  })
)

if (process.env.NODE_ENV === 'test') {
  app.use(cors({ origin: '*' }))
}

if (env) app.use(morgan('dev'))
app.disable('x-powered-by')
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(cookieParser())

app.use('/api', rootRouter)
app.use('/data', express.static(path.join(__dirname, '../data')))

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    return res.status(200).json({})
  }
  next()
})

app.use(defaultErrorHandler)

const gracefulShutdown = async () => {
  logger.info('Graceful shutdown initiated...')

  import('./utils/scheduler').then(({ stopTokenCleanup }) => {
    stopTokenCleanup()
  })

  try {
    await databaseServices.closeDB()
    logger.info('Database connection closed')
  } catch (error) {
    logger.error('Error closing database connection:', error)
  }
  process.exit(0)
}

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // await databaseServices.connectDB()
    // await seedDatabase()

    httpServer.listen(env.APP_PORT, () => {
      logger.info(`Server running at http://localhost:${env.APP_PORT}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
startServer()

export default app
