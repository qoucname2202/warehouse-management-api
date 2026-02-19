import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { ErrorWithStatus } from '~/errors/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { MESSAGE } from '~/constants/message'

// Set up in-memory storage
const storage = multer.memoryStorage()

// Configure upload limits and file filtering
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1 // Allow only one file per request
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error(MESSAGE.FILE.INVALID_TYPE))
    }
    cb(null, true)
  }
})

// Middleware for handling single file upload errors
const handleUploadError = (req: Request, res: Response, next: NextFunction) => {
  return (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new ErrorWithStatus({
            message: MESSAGE.FILE.SIZE_EXCEEDED,
            status: HTTP_STATUS.BAD_REQUEST
          })
        )
      }
    }
    next(
      new ErrorWithStatus({
        message: err.message || MESSAGE.FILE.UPLOAD_FAILED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    )
  }
}

// Middleware factory for single file upload
const createSingleUploadMiddleware = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadHandler = upload.single(fieldName)

    uploadHandler(req, res, (err) => {
      if (err) {
        return handleUploadError(req, res, next)(err)
      }

      // If no file was provided, continue anyway but with a warning
      if (!req.file) {
        return next(
          new ErrorWithStatus({
            message: MESSAGE.FILE.NOT_PROVIDED,
            status: HTTP_STATUS.BAD_REQUEST
          })
        )
      }

      next()
    })
  }
}

export const uploadMiddleware = {
  // Middleware for avatar image upload (JPEG, PNG, WebP)
  avatar: createSingleUploadMiddleware('avatar'),
  // Middleware for cover photo image upload
  coverPhoto: createSingleUploadMiddleware('cover_photo')
}
