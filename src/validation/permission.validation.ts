import { check, param } from 'express-validator'
import { validate } from './validation-schema'

export const createPermissionValidator = validate([
  check('name')
    .notEmpty()
    .withMessage('Permission name is required')
    .isString()
    .withMessage('Permission name must be a string')
    .trim(),

  check('action').notEmpty().withMessage('Action is required').isString().withMessage('Action must be a string').trim(),

  check('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isString()
    .withMessage('Subject must be a string')
    .trim(),

  check('conditions').optional().isObject().withMessage('Conditions must be an object')
])

export const updatePermissionValidator = validate([
  check('name').optional().isString().withMessage('Permission name must be a string').trim(),

  check('action').optional().isString().withMessage('Action must be a string').trim(),

  check('subject').optional().isString().withMessage('Subject must be a string').trim(),

  check('conditions').optional().isObject().withMessage('Conditions must be an object')
])

export const idValidator = validate([
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isString()
    .withMessage('ID must be a string')
    .isMongoId()
    .withMessage('ID must be a valid MongoDB ID')
])
