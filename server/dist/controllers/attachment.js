"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = exports.deleteAttachment = exports.addLinkAttachment = exports.uploadAttachment = void 0;
const client_1 = require("../prisma/client");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `attachment-${uniqueSuffix}${ext}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only images, PDF, and Word documents are allowed.'));
        }
    }
});
// Upload attachment
const uploadAttachment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { cardId } = req.params;
        const { name, type } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const uploadedFile = req.file;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!uploadedFile) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Verify card exists and user has access
        const card = yield client_1.prisma.card.findUnique({
            where: { id: cardId },
            include: {
                list: {
                    include: {
                        board: true
                    }
                }
            }
        });
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        // Check if user is board member
        const isMember = yield client_1.prisma.boardMember.findUnique({
            where: {
                boardId_userId: {
                    boardId: card.list.board.id,
                    userId
                }
            }
        });
        if (!isMember && card.list.board.ownerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to add attachments to this card' });
        }
        // Create attachment record
        const attachment = yield client_1.prisma.attachment.create({
            data: {
                name: name || uploadedFile.originalname,
                fileName: uploadedFile.filename,
                filePath: uploadedFile.path,
                fileSize: uploadedFile.size,
                mimeType: uploadedFile.mimetype,
                type: 'file',
                cardId,
                uploadedById: userId
            },
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        // Create activity
        yield client_1.prisma.activity.create({
            data: {
                action: 'attachment_added',
                details: JSON.stringify({ fileName: attachment.name }),
                boardId: card.list.board.id,
                cardId,
                userId
            }
        });
        res.status(201).json({ attachment });
    }
    catch (error) {
        console.error('Upload attachment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.uploadAttachment = uploadAttachment;
// Add link attachment
const addLinkAttachment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { cardId } = req.params;
        const { name, url } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!name || !url) {
            return res.status(400).json({ error: 'Name and URL are required' });
        }
        // Verify card exists and user has access
        const card = yield client_1.prisma.card.findUnique({
            where: { id: cardId },
            include: {
                list: {
                    include: {
                        board: true
                    }
                }
            }
        });
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        // Check if user is board member
        const isMember = yield client_1.prisma.boardMember.findUnique({
            where: {
                boardId_userId: {
                    boardId: card.list.board.id,
                    userId
                }
            }
        });
        if (!isMember && card.list.board.ownerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to add attachments to this card' });
        }
        // Create link attachment record
        const attachment = yield client_1.prisma.attachment.create({
            data: {
                name,
                url,
                type: 'link',
                cardId,
                uploadedById: userId
            },
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        // Create activity
        yield client_1.prisma.activity.create({
            data: {
                action: 'attachment_added',
                details: JSON.stringify({ fileName: attachment.name }),
                boardId: card.list.board.id,
                cardId,
                userId
            }
        });
        res.status(201).json({ attachment });
    }
    catch (error) {
        console.error('Add link attachment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.addLinkAttachment = addLinkAttachment;
// Delete attachment
const deleteAttachment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const attachment = yield client_1.prisma.attachment.findUnique({
            where: { id },
            include: {
                card: {
                    include: {
                        list: {
                            include: {
                                board: true
                            }
                        }
                    }
                }
            }
        });
        if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
        }
        // Check if user is board member
        const isMember = yield client_1.prisma.boardMember.findUnique({
            where: {
                boardId_userId: {
                    boardId: attachment.card.list.board.id,
                    userId
                }
            }
        });
        if (!isMember && attachment.card.list.board.ownerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this attachment' });
        }
        // Delete file from filesystem if it's a file attachment
        if (attachment.filePath && fs_1.default.existsSync(attachment.filePath)) {
            fs_1.default.unlinkSync(attachment.filePath);
        }
        // Delete attachment record
        yield client_1.prisma.attachment.delete({
            where: { id }
        });
        // Create activity
        yield client_1.prisma.activity.create({
            data: {
                action: 'attachment_removed',
                details: JSON.stringify({ fileName: attachment.name }),
                boardId: attachment.card.list.board.id,
                cardId: attachment.card.id,
                userId
            }
        });
        res.json({ message: 'Attachment deleted successfully' });
    }
    catch (error) {
        console.error('Delete attachment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteAttachment = deleteAttachment;
// Export the upload middleware
exports.uploadMiddleware = upload.single('file');
