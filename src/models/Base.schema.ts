import { ObjectId } from 'mongodb'
import { BaseType } from '~/interfaces/global.interface'

// Base Class for common fields
export class Base {
  _id?: ObjectId
  is_removed: boolean
  created_at: Date
  created_by_id?: ObjectId
  updated_at?: Date
  updated_by_id?: ObjectId
  removed_at?: Date

  constructor(item: BaseType) {
    this._id = item._id
    this.is_removed = item.is_removed ?? false
    this.created_at = item.created_at || new Date()
    this.created_by_id = item.created_by_id
    this.updated_at = item.updated_at
    this.updated_by_id = item.updated_by_id
    this.removed_at = item.removed_at
  }
}
