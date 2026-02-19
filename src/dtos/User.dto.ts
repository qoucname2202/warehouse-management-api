import { UserGenderType, UserVerifyStatus } from '~/constants/enums'
import { SocialMediaLinks } from '~/interfaces/user.interface'

export interface UserProfileDto {
  _id: string
  username: string
  full_name: string
  email: string
  bio: string
  avatar: string
  avatar_public_id?: string
  cover_photo: string
  cover_photo_public_id?: string
  gender?: UserGenderType
  date_of_birth?: Date
  phone_number?: string
  verify: UserVerifyStatus
  experience?: string
  language: string
  country?: string
  timezone?: string
  social_links?: SocialMediaLinks
  interests?: string[]
  created_at: Date
  updated_at?: Date
}

export interface UpdateUserProfileDto {
  full_name?: string
  bio?: string
  avatar?: string
  avatar_public_id?: string
  cover_photo?: string
  cover_photo_public_id?: string
  gender?: UserGenderType
  date_of_birth?: string // Date as ISO string
  phone_number?: string
  experience?: string
  language?: string
  country?: string
  timezone?: string
  social_links?: SocialMediaLinks
  interests?: string[]
}

// New DTO for paginated user listing
export interface UserListQueryDto {
  page?: number
  limit?: number
  search?: string
  search_by?: 'full_name' | 'email' // Field to search in
  role?: string // Filter by role name
  verify_status?: UserVerifyStatus // Filter by verification status
  is_pro?: boolean // Filter by pro status
  sort_by?: string // Field to sort by
  sort_order?: 'asc' | 'desc' // Sort order
}

// Response DTO for paginated results
export interface PaginatedResponseDto<T> {
  users: T[]
  metadata: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// DTO for user list items (simplified version of user profile)
export interface UserListItemDto {
  _id: string
  username: string
  full_name: string
  email: string
  avatar: string
  verify: UserVerifyStatus
  is_pro: boolean
  roles: string[] // Role names instead of IDs
  created_at: Date
  last_login?: Date
}
