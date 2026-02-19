import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb'
import logger from '~/utils/logger'
import { env } from '~/config/env.config'
import { User } from '~/models/User.schema'
import { Role } from '~/models/Role.schema'
import { Otp } from '~/models/Otp.schema'
import { Permission } from '~/models/Permission.schema'
import { Token } from '~/models/Token.schema'

/**
 * Database service - MongoDB connection and collection accessors
 * Provides access to: users, roles, permissions, otps, tokens
 */
class DatabaseServices {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(env.DB_URL, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })
    this.db = this.client.db(env.DB_NAME)
  }

  async connectDB(): Promise<void> {
    try {
      await this.db.command({ ping: 1 })
      logger.info('Connected to MongoDB successfully!')
    } catch (error) {
      logger.error('Unable to Connect MongoDB: ')
      logger.error(error)
    }
  }

  async disConnectDB(): Promise<void> {
    try {
      await this.client.close()
    } catch (error) {
      logger.error(`Unable to disconnect MongoDB: ${error}`)
    }
  }

  get users(): Collection<User> {
    return this.db.collection(env.DB_USER_COLLECTION as string)
  }

  get roles(): Collection<Role> {
    return this.db.collection(env.DB_ROLE_COLLECTION as string)
  }

  get permissions(): Collection<Permission> {
    return this.db.collection(env.DB_PERMISSION_COLLECTION as string)
  }

  get otps(): Collection<Otp> {
    return this.db.collection(env.DB_OTP_COLLECTION as string)
  }

  get tokens(): Collection<Token> {
    return this.db.collection(env.DB_TOKEN_COLLECTION as string)
  }

  async closeDB(): Promise<void> {
    await this.client.close()
  }
}

export const databaseServices = new DatabaseServices()
