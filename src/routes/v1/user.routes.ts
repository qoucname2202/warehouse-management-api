import express from 'express'
import userController from '~/controllers/user.controller'
import { wrapRequestHandler } from '~/utils/handeler'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { updateProfileValidator } from '~/validation/user.validation'
import { uploadMiddleware } from '~/middlewares/upload.middleware'

const userRouter = express.Router()

/**
 * @route GET /profile
 * @description Get current user's profile
 * @access Private - Requires authentication
 * @returns {Object} 200 - Success response with user profile
 * @returns {Object} 401 - Unauthorized (Not authenticated)
 * @returns {Object} 404 - Not found (User not found)
 * @returns {Object} 500 - Internal server error
 */
userRouter.get('/profile', authMiddleware, wrapRequestHandler(userController.getProfile))

/**
 * @route PUT /profile
 * @description Update current user's profile
 * @access Private - Requires authentication
 * @param {Object} req.body - User profile data to update
 * @returns {Object} 200 - Success response with updated user profile
 * @returns {Object} 400 - Bad request (Invalid input)
 * @returns {Object} 401 - Unauthorized (Not authenticated)
 * @returns {Object} 404 - Not found (User not found)
 * @returns {Object} 422 - Unprocessable entity (Validation failed)
 * @returns {Object} 500 - Internal server error
 */
userRouter.put('/profile', authMiddleware, updateProfileValidator, wrapRequestHandler(userController.updateProfile))

/**
 * @route POST /profile/avatar
 * @description Upload user's avatar image
 * @access Private - Requires authentication
 * @param {File} req.file - Avatar image file
 * @returns {Object} 200 - Success response with updated user profile including new avatar URL
 * @returns {Object} 400 - Bad request (Invalid file or no file provided)
 * @returns {Object} 401 - Unauthorized (Not authenticated)
 * @returns {Object} 404 - Not found (User not found)
 * @returns {Object} 500 - Internal server error
 */
userRouter.post(
  '/profile/avatar',
  authMiddleware,
  uploadMiddleware.avatar,
  wrapRequestHandler(userController.uploadAvatar)
)

/**
 * @route POST /profile/cover
 * @description Upload user's cover photo
 * @access Private - Requires authentication
 * @param {File} req.file - Cover photo file
 * @returns {Object} 200 - Success response with updated user profile including new cover photo URL
 * @returns {Object} 400 - Bad request (Invalid file or no file provided)
 * @returns {Object} 401 - Unauthorized (Not authenticated)
 * @returns {Object} 404 - Not found (User not found)
 * @returns {Object} 500 - Internal server error
 */
userRouter.post(
  '/profile/cover',
  authMiddleware,
  uploadMiddleware.coverPhoto,
  wrapRequestHandler(userController.uploadCoverPhoto)
)

export default userRouter
