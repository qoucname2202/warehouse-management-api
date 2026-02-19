import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/errors/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { MESSAGE } from '~/constants/message'
import { UpdateUserProfileDto, UserProfileDto } from '~/dtos/User.dto'
import cloudinaryService from './cloudinary.service'
import { databaseServices } from './database.service'

interface CloudinaryMetadata {
  public_id: string
  secure_url: string
}

const userService = {
  /**
   * Get user profile by user ID
   * @param {string} userId - User ID
   * @returns {Promise<UserProfileDto>} User profile information
   * @throws {ErrorWithStatus} If user not found
   */
  getProfile: async (userId: string): Promise<UserProfileDto> => {
    // Check if userId is valid
    if (!ObjectId.isValid(userId)) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.INVALID_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Find user by ID with projection to exclude sensitive fields
    const user = await databaseServices.users.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )

    if (!user) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Transform the data to match the UserProfileDto
    const userProfile: UserProfileDto = {
      _id: user._id.toString(),
      username: user.username,
      full_name: user.full_name || '',
      email: user.email,
      bio: user.bio || '',
      avatar: user.avatar || '',
      avatar_public_id: user.avatar_public_id,
      cover_photo: user.cover_photo || '',
      cover_photo_public_id: user.cover_photo_public_id,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      phone_number: user.phone_number,
      verify: user.verify,
      experience: user.experience,
      language: user.language || 'vn',
      country: user.country,
      timezone: user.timezone,
      social_links: user.social_links,
      interests: user.interests || [],
      created_at: user.created_at,
      updated_at: user.updated_at
    }

    return userProfile
  },

  /**
   * Update user profile information
   * @param {string} userId - User ID
   * @param {UpdateUserProfileDto} updateData - User profile data to update
   * @returns {Promise<UserProfileDto>} Updated user profile
   * @throws {ErrorWithStatus} If user not found or validation fails
   */
  updateProfile: async (userId: string, updateData: UpdateUserProfileDto): Promise<UserProfileDto> => {
    // Check if userId is valid
    if (!ObjectId.isValid(userId)) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.INVALID_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Check if user exists
    const existingUser = await databaseServices.users.findOne({ _id: new ObjectId(userId) }, { projection: { _id: 1 } })

    if (!existingUser) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Prepare data for update
    const updateFields: Record<string, any> = {
      ...updateData,
      updated_at: new Date()
    }

    // Convert date_of_birth from string to Date if provided
    if (updateData.date_of_birth) {
      try {
        updateFields.date_of_birth = new Date(updateData.date_of_birth)
      } catch (error) {
        throw new ErrorWithStatus({
          message: 'Invalid date format for date_of_birth',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Update user in database
    await databaseServices.users.updateOne({ _id: new ObjectId(userId) }, { $set: updateFields })

    // Get and return updated profile
    return userService.getProfile(userId)
  },

  /**
   * Upload and update user's avatar
   * @param {string} userId - User ID
   * @param {Buffer} fileBuffer - Avatar image buffer
   * @returns {Promise<UserProfileDto>} Updated user profile
   * @throws {ErrorWithStatus} If user not found or upload fails
   */
  uploadAvatar: async (userId: string, fileBuffer: Buffer): Promise<UserProfileDto> => {
    // Check if userId is valid
    if (!ObjectId.isValid(userId)) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.INVALID_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Check if user exists and retrieve the current avatar public_id if exists
    const existingUser = await databaseServices.users.findOne({ _id: new ObjectId(userId) })

    if (!existingUser) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Upload new avatar to Cloudinary
    const uploadResult = await cloudinaryService.uploadAvatar(fileBuffer)

    // Delete previous avatar if it exists
    if (existingUser.avatar_public_id) {
      await cloudinaryService.deleteFile(existingUser.avatar_public_id)
    }

    // Update user with new avatar URL and metadata
    await databaseServices.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          avatar: uploadResult.secure_url,
          avatar_public_id: uploadResult.public_id,
          updated_at: new Date()
        }
      }
    )

    // Return updated user profile
    return userService.getProfile(userId)
  },

  /**
   * Upload and update user's cover photo
   * @param {string} userId - User ID
   * @param {Buffer} fileBuffer - Cover photo buffer
   * @returns {Promise<UserProfileDto>} Updated user profile
   * @throws {ErrorWithStatus} If user not found or upload fails
   */
  uploadCoverPhoto: async (userId: string, fileBuffer: Buffer): Promise<UserProfileDto> => {
    // Check if userId is valid
    if (!ObjectId.isValid(userId)) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.INVALID_ID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Check if user exists and retrieve the current cover photo public_id if exists
    const existingUser = await databaseServices.users.findOne({ _id: new ObjectId(userId) })

    if (!existingUser) {
      throw new ErrorWithStatus({
        message: MESSAGE.USER.NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Upload new cover photo to Cloudinary
    const uploadResult = await cloudinaryService.uploadCoverPhoto(fileBuffer)

    // Delete previous cover photo if it exists
    if (existingUser.cover_photo_public_id) {
      await cloudinaryService.deleteFile(existingUser.cover_photo_public_id)
    }

    // Update user with new cover photo URL and metadata
    await databaseServices.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          cover_photo: uploadResult.secure_url,
          cover_photo_public_id: uploadResult.public_id,
          updated_at: new Date()
        }
      }
    )

    // Return updated user profile
    return userService.getProfile(userId)
  }
}

export default userService
