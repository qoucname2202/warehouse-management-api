import { UserGenderType, UserVerifyStatus } from '~/constants/enums'
import { BaseType } from './global.interface'
import { ObjectId } from 'mongodb'

export interface SocialMediaLinks {
  website?: string
  facebook?: string
  instagram?: string
  linkedin?: string
  tiktok?: string
  x?: string
  youtube?: string
}

export interface UserType extends BaseType {
  username: string
  full_name?: string
  password: string
  email: string
  bio?: string
  experience?: string
  language?: string
  gender?: UserGenderType
  email_verify_token?: string
  forgot_password_token?: string
  social_links?: SocialMediaLinks
  verify?: UserVerifyStatus
  date_of_birth?: Date
  phone_number?: string
  avatar?: string
  avatar_public_id?: string
  cover_photo?: string
  cover_photo_public_id?: string
  is_block?: boolean
  is_pro?: boolean
  is_approved?: boolean
  is_removed?: boolean
  instructor_id?: string
  roles?: ObjectId[]
  password_change_at?: Date
  last_login?: Date
  interests?: string[]
  country?: string
  timezone?: string
}
