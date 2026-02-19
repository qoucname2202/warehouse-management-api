import { OtpVerifyType } from '~/constants/enums'

export interface UserInfoGenerateTokenAndOtp {
  userId: string
  email: string
  type: OtpVerifyType
}

export interface UserInfoGenerateToken {
  userId: string
  email: string
}
