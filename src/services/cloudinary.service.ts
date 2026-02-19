import { v2 as cloudinary } from 'cloudinary'
import { env } from '~/config/env.config'
import { ErrorWithStatus } from '~/errors/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { MESSAGE } from '~/constants/message'

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_KEY,
  api_secret: env.CLOUDINARY_SECRET
})

interface UploadResponse {
  url: string
  public_id: string
  secure_url: string
}

interface FileUploadOptions {
  folder: string
  transformation?: any[]
}

const cloudinaryService = {
  /**
   * Upload a file to Cloudinary
   * @param {Buffer} fileBuffer - File buffer to upload
   * @param {FileUploadOptions} options - Upload options
   * @returns {Promise<UploadResponse>} Upload response
   */
  uploadFile: async (fileBuffer: Buffer, options: FileUploadOptions): Promise<UploadResponse> => {
    try {
      // Create a promise to handle the upload
      const uploadPromise = new Promise<UploadResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: options.folder,
            transformation: options.transformation || []
          },
          (error, result) => {
            if (error || !result) {
              return reject(
                new ErrorWithStatus({
                  message: error?.message || MESSAGE.FILE.UPLOAD_FAILED,
                  status: HTTP_STATUS.BAD_REQUEST
                })
              )
            }

            resolve({
              url: result.url,
              secure_url: result.secure_url,
              public_id: result.public_id
            })
          }
        )

        // Pass the buffer to the upload stream
        uploadStream.end(fileBuffer)
      })

      return await uploadPromise
    } catch (error) {
      if (error instanceof ErrorWithStatus) {
        throw error
      }
      throw new ErrorWithStatus({
        message: MESSAGE.FILE.UPLOAD_FAILED,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }
  },

  /**
   * Upload avatar image to Cloudinary
   * @param {Buffer} fileBuffer - Avatar image buffer
   * @returns {Promise<UploadResponse>} Upload response
   */
  uploadAvatar: async (fileBuffer: Buffer): Promise<UploadResponse> => {
    return cloudinaryService.uploadFile(fileBuffer, {
      folder: env.CLOUDINARY_AVATAR_FOLDER,
      transformation: [{ width: 400, height: 400, crop: 'fill' }, { quality: 'auto' }]
    })
  },

  /**
   * Upload cover photo to Cloudinary
   * @param {Buffer} fileBuffer - Cover photo buffer
   * @returns {Promise<UploadResponse>} Upload response
   */
  uploadCoverPhoto: async (fileBuffer: Buffer): Promise<UploadResponse> => {
    return cloudinaryService.uploadFile(fileBuffer, {
      folder: env.CLOUDINARY_COVER_PHOTO_FOLDER,
      transformation: [{ width: 1200, height: 400, crop: 'fill' }, { quality: 'auto' }]
    })
  },

  /**
   * Delete a file from Cloudinary
   * @param {string} publicId - Public ID of the file to delete
   * @returns {Promise<boolean>} Success status
   */
  deleteFile: async (publicId: string): Promise<boolean> => {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      return result.result === 'ok'
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error)
      return false
    }
  }
}

export default cloudinaryService
