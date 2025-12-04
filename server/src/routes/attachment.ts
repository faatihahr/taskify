import express from 'express';
import { authenticate } from '../middlewares/auth';
import { 
  uploadAttachment, 
  addLinkAttachment, 
  deleteAttachment,
  uploadMiddleware
} from '../controllers/attachment';
import { validate } from '../middlewares/validation';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const uploadAttachmentSchema = Joi.object({
  name: Joi.string().optional(),
  type: Joi.string().optional().valid('file', 'link')
});

const linkAttachmentSchema = Joi.object({
  name: Joi.string().required(),
  url: Joi.string().uri().required()
});

// Routes
// Upload file attachment
router.post(
  '/cards/:cardId/attachments',
  authenticate,
  uploadMiddleware,
  validate(uploadAttachmentSchema),
  uploadAttachment
);

// Add link attachment
router.post(
  '/cards/:cardId/attachments/link',
  authenticate,
  validate(linkAttachmentSchema),
  addLinkAttachment
);

// Delete attachment
router.delete(
  '/attachments/:id',
  authenticate,
  deleteAttachment
);

export default router;
