import { ObjectId } from 'mongodb'

// Base Interface for common fields
export interface BaseType {
  _id?: ObjectId
  is_removed?: boolean
  created_at?: Date
  created_by_id?: ObjectId
  updated_at?: Date
  updated_by_id?: ObjectId
  removed_at?: Date
}
