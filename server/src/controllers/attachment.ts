import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `attachment-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
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
    } else {
      cb(new Error('Invalid file type. Only images, PDF, and Word documents are allowed.'));
    }
  }
});

// Upload attachment
export const uploadAttachment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { cardId } = req.params;
    const { name, type } = req.body;
    const userId = req.user?.id;
    const uploadedFile = req.file;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify card exists and user has access
    const card = await prisma.card.findUnique({
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
    const isMember = await prisma.boardMember.findUnique({
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
    const attachment = await prisma.attachment.create({
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
    await prisma.activity.create({
      data: {
        action: 'attachment_added',
        details: JSON.stringify({ fileName: attachment.name }),
        boardId: card.list.board.id,
        cardId,
        userId
      }
    });

    res.status(201).json({ attachment });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add link attachment
export const addLinkAttachment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { cardId } = req.params;
    const { name, url } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    // Verify card exists and user has access
    const card = await prisma.card.findUnique({
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
    const isMember = await prisma.boardMember.findUnique({
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
    const attachment = await prisma.attachment.create({
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
    await prisma.activity.create({
      data: {
        action: 'attachment_added',
        details: JSON.stringify({ fileName: attachment.name }),
        boardId: card.list.board.id,
        cardId,
        userId
      }
    });

    res.status(201).json({ attachment });
  } catch (error) {
    console.error('Add link attachment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete attachment
export const deleteAttachment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const attachment = await prisma.attachment.findUnique({
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
    const isMember = await prisma.boardMember.findUnique({
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
    if (attachment.filePath && fs.existsSync(attachment.filePath)) {
      fs.unlinkSync(attachment.filePath);
    }

    // Delete attachment record
    await prisma.attachment.delete({
      where: { id }
    });

    // Create activity
    await prisma.activity.create({
      data: {
        action: 'attachment_removed',
        details: JSON.stringify({ fileName: attachment.name }),
        boardId: attachment.card.list.board.id,
        cardId: attachment.card.id,
        userId
      }
    });

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export the upload middleware
export const uploadMiddleware = upload.single('file');
