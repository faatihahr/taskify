"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const attachment_1 = require("../controllers/attachment");
const validation_1 = require("../middlewares/validation");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
// Validation schemas
const uploadAttachmentSchema = joi_1.default.object({
    name: joi_1.default.string().optional(),
    type: joi_1.default.string().optional().valid('file', 'link')
});
const linkAttachmentSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    url: joi_1.default.string().uri().required()
});
// Routes
// Upload file attachment
router.post('/cards/:cardId/attachments', auth_1.authenticate, attachment_1.uploadMiddleware, (0, validation_1.validate)(uploadAttachmentSchema), attachment_1.uploadAttachment);
// Add link attachment
router.post('/cards/:cardId/attachments/link', auth_1.authenticate, (0, validation_1.validate)(linkAttachmentSchema), attachment_1.addLinkAttachment);
// Delete attachment
router.delete('/attachments/:id', auth_1.authenticate, attachment_1.deleteAttachment);
exports.default = router;
