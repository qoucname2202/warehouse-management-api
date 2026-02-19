import { BaseType } from './global.interface'
import { ObjectId } from 'mongodb'

// Role Model
export interface RoleType extends BaseType {
  name: string
  description?: string
  is_active?: boolean
  permissions?: ObjectId[]
}
