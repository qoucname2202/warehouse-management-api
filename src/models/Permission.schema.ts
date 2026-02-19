import { Base } from './Base.schema'
import { PermissionType } from '~/interfaces/permission.interface'

export class Permission extends Base {
  name: string
  action: string
  subject: string
  conditions?: Record<string, any>
  description?: string
  method?: string
  path?: string

  constructor(item: PermissionType) {
    super(item)
    this.name = item.name
    this.action = item.action
    this.subject = item.subject
    this.conditions = item.conditions
    this.description = item.description
    this.method = item.method
    this.path = item.path
  }
}
