import { ObjectId } from 'mongodb'
import { Base } from './Base.schema'
import { OtpType } from '~/interfaces/otp.interface'
import { OtpVerifyType } from '~/constants/enums'

export class Otp extends Base {
  user_id: ObjectId
  code: string
  expired_at: Date
  type: OtpVerifyType
  is_used: boolean

  constructor(item: OtpType) {
    super(item)
    this.user_id = item.user_id
    this.code = item.code
    this.expired_at = item.expired_at
    this.type = item.type || OtpVerifyType.EmailVerification
    this.is_used = item.is_used ?? false
  }
}
