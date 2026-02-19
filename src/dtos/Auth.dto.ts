import { id } from 'date-fns/locale'
import { ObjectId } from 'mongodb'
import { OtpVerifyType, UserGenderType, UserRole } from '~/constants/enums'

export interface RegisterDto {
  full_name: string
  email: string
  password: string
  confirm_password: string
  role: UserRole.Student | UserRole.Instructor
  date_of_birth?: string | Date
}

export interface LoginDto {
  email: string
  password: string
}

export interface ForgotPasswordDto {
  email: string
}

/**
 * Data transfer object for password reset
 * @property {string} otp - One-time password from email
 * @property {string} email - User's email address
 * @property {string} password - New password (must be different from old password)
 * @property {string} confirm_password - Password confirmation (must match password)
 */
export interface ResetPasswordDto {
  email: string
  password: string
  confirm_password: string
}

export interface ResendOtpDto {
  email: string
  type: OtpVerifyType
}

export interface ChangePasswordDto {
  current_password: string
  new_password: string
  confirm_password: string
}

export interface RoleAssignmentDto {
  target_user_id: string
}

export interface ProStatusAssignmentDto {
  target_user_id: string
}

/**
 * DTO for admin password reset
 */
export interface AdminPasswordResetDto {
  target_user_id: string
  new_password: string
  confirm_password: string
}

/**
 * DTO for admin to disable a user account
 */
export interface UserDisableDto {
  target_user_id: string
  reason?: string
}

/**
 * DTO for admin to approve a teacher account
 */
export interface TeacherApprovalDto {
  target_user_id: string
}

/**
 * DTO for creating a new course category
 * @property {string} name - The name of the category (required)
 * @property {string} slug - A URL-friendly identifier for the category (required)
 * @property {string} [description] - Optional description of the category
 * @property {string} [icon_url] - Optional URL to an icon representing the category
 * @property {string} [thumbnail] - Optional URL to a thumbnail image for the category
 * @property {string} [parent_id] - Optional parent category ID if this is a subcategory
 */
export interface CreateCategoryDto {
  name: string
  slug: string
  description?: string
  icon_url?: string
  thumbnail?: string
  parent_id?: string
}

/**
 * Data Transfer Object for updating a course category
 *
 * @property {string} [name] - Updated name of the category (optional)
 * @property {string} [description] - Updated description for the category (optional)
 * @property {string} [slug] - Updated URL-friendly identifier for the category (optional)
 * @property {string} [icon_url] - Updated URL to the icon representing the category (optional)
 * @property {string} [thumbnail] - Updated URL to the thumbnail image of the category (optional)
 * @property {string} [parent_id] - Optional parent category ID if this is a subcategory (must be a valid MongoDB ObjectId string)
 */
export interface UpdateCategoryDto {
  name?: string
  description?: string
  slug?: string
  icon_url?: string
  thumbnail?: string
  parent_id?: string | ObjectId
}

export interface CategoryListQueryDto {
  page?: number
  limit?: number
  search?: string
  search_by?: 'name' | 'slug'
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface CreateHashtagDto {
  name: string
}

export interface HashtagListQueryDto {
  page?: number
  limit?: number
  search?: string
  search_by?: 'name' | 'slug'
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface CouponListQueryDto {
  page?: number
  limit?: number
  search?: string
  search_by?: 'code' | 'discount_amount'
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface CategoryParams {
  id: string
}

export interface HashtagParams {
  id: string
}

export interface CourseParams {
  courseId: string
}

export interface CouponParams {
  couponId: string
}

export interface StudentParams {
  id: string
}
export interface InstructorParams {
  id: string
}

export interface StudentListQueryDto {
  page?: number
  limit?: number
  search?: string
  search_by?: 'full_name' | 'username' | 'email'
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
export interface CreateStudent {
  full_name: string
  email: string
  password: string
  confirm_password: string
  role: UserRole.Student
  bio?: string
  phone_number?: string
  gender?: UserGenderType
  date_of_birth?: Date
  language?: string
  avatar?: string
  interests?: string[]
  country?: string
  timezone?: string
}

export interface CreateInstructor {
  full_name: string
  email: string
  password: string
  confirm_password: string
  role: UserRole.Instructor
  bio?: string
  phone_number?: string
  gender?: UserGenderType
  date_of_birth?: Date
  language?: string
  avatar?: string
  interests?: string[]
  country?: string
  timezone?: string
}

export interface InstructorListQueryDto {
  page?: number
  limit?: number
  search?: string
  search_by?: 'full_name' | 'username' | 'email'
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
