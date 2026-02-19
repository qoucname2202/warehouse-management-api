import fs from 'fs'
import { Request } from 'express'
import formidable, { File } from 'formidable'
import { ErrorWithStatus } from '~/errors/Errors'
import HttpStatusCode from '~/constants/httpStatus'
import { UPLOAD_IMAGE_TEMP_DIR } from '~/constants/dir'

/**
 * Initialize upload directories for image storage
 */
export const initFolder = () => {
  const folders = [UPLOAD_IMAGE_TEMP_DIR]
  folders.forEach((item) => {
    if (!fs.existsSync(item)) {
      fs.mkdirSync(item, {
        recursive: true
      })
    }
  })
}

/**
 * Handle multipart image upload via formidable
 * @param req - Express request
 * @returns Array of uploaded image files
 */
export const handeUploadImage = async (req: Request) => {
  const MAX_FILE_SIZE = 300 * 1024 // 300KB max per file
  const MAX_TOTAL_FILE_SIZE = 300 * 1024 * 4
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif']

  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE,
    maxTotalFileSize: MAX_TOTAL_FILE_SIZE,
    filter: function ({ name, originalFilename, mimetype }) {
      const validImg = name === 'image' && Boolean(allowedImageTypes.includes(mimetype || ''))
      if (!validImg) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return validImg
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      files.image?.forEach((item) => {
        if (item.size > MAX_FILE_SIZE) {
          return reject(
            new ErrorWithStatus({
              message: 'File too large. Maximum size is 300KB per file.',
              status: HttpStatusCode.BAD_REQUEST
            })
          )
        }
      })
      if (!files.image) {
        return reject(new Error('File is empty'))
      }
      resolve(files.image as File[])
    })
  })
}

export const getNameFromFullname = (newFileName: string) => {
  return newFileName.split('.')[0]
}
