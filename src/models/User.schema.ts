import { UserGenderType, UserVerifyStatus } from '~/constants/enums'
import { SocialMediaLinks, UserType } from '~/interfaces/user.interface'
import { Base } from './Base.schema'
import { ObjectId } from 'mongodb'

// User Model
export class User extends Base {
  username: string
  full_name: string
  password: string
  email: string
  bio: string
  experience?: string
  language: string
  gender?: UserGenderType
  roles?: ObjectId[]
  email_verify_token: string
  forgot_password_token: string
  social_links?: SocialMediaLinks
  verify: UserVerifyStatus
  date_of_birth?: Date
  phone_number?: string
  avatar: string
  avatar_public_id?: string
  cover_photo: string
  cover_photo_public_id?: string
  is_block: boolean
  is_pro: boolean
  is_approved: boolean
  instructor_id?: string
  password_change_at?: Date
  interests?: string[]
  country?: string
  timezone?: string
  last_login?: Date

  constructor(item: UserType) {
    super(item)
    this.username = item.username
    this.password = item.password
    this.email = item.email
    this.full_name = item.full_name || ''
    this.date_of_birth = item.date_of_birth
    this.phone_number = item.phone_number
    this.bio = item.bio || ''
    this.experience = item.experience || ''
    this.gender = item.gender
    this.language = item.language || 'vn'
    this.avatar = item.avatar || ''
    this.avatar_public_id = item.avatar_public_id
    this.cover_photo = item.cover_photo || ''
    this.cover_photo_public_id = item.cover_photo_public_id
    this.email_verify_token = item.email_verify_token || ''
    this.forgot_password_token = item.forgot_password_token || ''
    this.verify = item.verify || UserVerifyStatus.Unverified
    this.social_links = item.social_links
    this.is_block = item.is_block ?? false
    this.is_pro = item.is_pro ?? false
    this.is_approved = item.is_approved ?? false
    this.instructor_id = item.instructor_id
    this.password_change_at = item.password_change_at
    this.roles = item.roles || []
    this.interests = item.interests || []
    this.country = item.country
    this.timezone = item.timezone
    this.last_login = item.last_login
  }
}
