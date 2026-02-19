import { RoleType } from '~/interfaces/role.interface'
import { Base } from './Base.schema'
import { ObjectId } from 'mongodb'

export class Role extends Base {
  name: string
  description?: string
  is_active: boolean
  permissions?: ObjectId[]

  constructor(item: RoleType) {
    super(item)
    this.name = item.name
    this.description = item.description
    this.is_active = item.is_active ?? true
    this.permissions = item.permissions
  }
}
