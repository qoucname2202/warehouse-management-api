import { ObjectId } from 'mongodb'
import { BaseType } from './global.interface'
import { OtpVerifyType } from '~/constants/enums'

export interface OtpType extends BaseType {
  user_id: ObjectId
  code: string
  expired_at: Date
  is_used?: boolean
  type: OtpVerifyType
}
