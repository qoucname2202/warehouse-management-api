import { Response, NextFunction } from 'express'
import { ResponseMessage } from '~/config/reponse.config'
import { MESSAGE } from '~/constants/message'
import { AuthenticatedRequest } from '~/middlewares/auth.middleware'
import userService from '~/services/user.service'
import { ErrorWithStatus } from '~/errors/Errors'
import HTTP_STATUS from '~/constants/httpStatus'

const userController = {
  /**
   * Get current user's profile
   * @route GET /profile
   * @access Private - Requires authentication
   */
  getProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id

    if (!userId) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UN_AUTHORIZED,
        message: MESSAGE.AUTH.VALIDATION.USER_ID.MISSING
      })
    }

    const profile = await userService.getProfile(userId)
    return ResponseMessage.success(res, profile, MESSAGE.USER.PROFILE.GET_SUCCESS)
  },

  /**
   * Update current user's profile
   * @route PUT /profile
   * @access Private - Requires authentication
   */
  updateProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id

    if (!userId) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UN_AUTHORIZED,
        message: MESSAGE.AUTH.VALIDATION.USER_ID.MISSING
      })
    }

    const updatedProfile = await userService.updateProfile(userId, req.body)
    return ResponseMessage.success(res, updatedProfile, MESSAGE.USER.PROFILE.UPDATE_SUCCESS)
  },

  /**
   * Upload user's avatar
   * @route POST /profile/avatar
   * @access Private - Requires authentication
   */
  uploadAvatar: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id

    if (!userId) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UN_AUTHORIZED,
        message: MESSAGE.AUTH.VALIDATION.USER_ID.MISSING
      })
    }

    // req.file is added by multer
    if (!req.file) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: MESSAGE.FILE.NOT_PROVIDED
      })
    }

    const updatedProfile = await userService.uploadAvatar(userId, req.file.buffer)
    return ResponseMessage.success(res, updatedProfile, MESSAGE.USER.PROFILE.AVATAR_UPLOAD_SUCCESS)
  },

  /**
   * Upload user's cover photo
   * @route POST /profile/cover
   * @access Private - Requires authentication
   */
  uploadCoverPhoto: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id

    if (!userId) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UN_AUTHORIZED,
        message: MESSAGE.AUTH.VALIDATION.USER_ID.MISSING
      })
    }

    // req.file is added by multer
    if (!req.file) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: MESSAGE.FILE.NOT_PROVIDED
      })
    }

    const updatedProfile = await userService.uploadCoverPhoto(userId, req.file.buffer)
    return ResponseMessage.success(res, updatedProfile, MESSAGE.USER.PROFILE.COVER_PHOTO_UPLOAD_SUCCESS)
  }
}

export default userController
