import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createCardMovedNotification, createCommentAddedNotification } from '../services/notificationService';

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  file?: Express.Multer.File;
}

// Configure multer for cover image uploads
const coverUploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'card-covers');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `cover-${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const coverUploadFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

// Multer middleware for cover uploads
export const coverUploadMiddleware = multer({
  storage: coverUploadStorage,
  fileFilter: coverUploadFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
}).single('file');

// Create a new card
export const createCard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, listId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!title || !listId) {
      return res.status(400).json({ error: 'Title and listId are required' });
    }

    // Get list and verify board access
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: { board: true }
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Check if user has access to this board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: list.board.id,
        userId
      }
    });

    if (!boardMember && list.board.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to create card in this board' });
    }

    // Get the next position for this card
    const maxPosition = await prisma.card.findFirst({
      where: { listId },
      orderBy: { position: 'desc' }
    });
    const position = maxPosition ? maxPosition.position + 1 : 0;

    const card = await prisma.card.create({
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        listId,
        position,
        creatorId: userId
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        list: true
      }
    });

    // Create activity
    await prisma.activity.create({
      data: {
        action: 'created',
        details: JSON.stringify({ cardTitle: card.title }),
        boardId: list.board.id,
        cardId: card.id,
        userId
      }
    });

    res.status(201).json(card);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a card
export const updateCard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, coverImage, completed } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const card = await prisma.card.findUnique({
      where: { id },
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

    // Check if user has access to this board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: card.list.board.id,
        userId
      }
    });

    if (!boardMember && card.list.board.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this card' });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (completed !== undefined) updateData.completed = completed;

    const updatedCard = await prisma.card.update({
      where: { id },
      data: updateData,
      include: {
        list: {
          include: {
            board: true
          }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        labels: true,
        checklists: {
          include: {
            items: true
          }
        }
      }
    });

    // Create activity for significant changes
    if (title !== undefined && title !== card.title) {
      await prisma.activity.create({
        data: {
          action: 'updated',
          details: JSON.stringify({ field: 'title', oldValue: card.title, newValue: title }),
          boardId: card.list.board.id,
          cardId: card.id,
          userId
        }
      });
    }

    if (completed !== undefined && completed !== card.completed) {
      await prisma.activity.create({
        data: {
          action: completed ? 'completed' : 'uncompleted',
          details: JSON.stringify({ cardTitle: card.title }),
          boardId: card.list.board.id,
          cardId: card.id,
          userId
        }
      });
    }

    res.json(updatedCard);
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Move card to different list or position
export const moveCard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { listId, position } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const card = await prisma.card.findUnique({
      where: { id },
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

    // Get target list
    const targetList = await prisma.list.findUnique({
      where: { id: listId },
      include: { board: true }
    });

    if (!targetList) {
      return res.status(404).json({ error: 'Target list not found' });
    }

    // Check if user is member of both boards (if moving between boards)
    if (card.list.board.id !== targetList.board.id) {
      const [sourceMember, targetMember] = await Promise.all([
        prisma.boardMember.findUnique({
          where: {
            boardId_userId: {
              boardId: card.list.board.id,
              userId
            }
          }
        }),
        prisma.boardMember.findUnique({
          where: {
            boardId_userId: {
              boardId: targetList.board.id,
              userId
            }
          }
        })
      ]);

      const sourceAccess = sourceMember || card.list.board.ownerId === userId;
      const targetAccess = targetMember || targetList.board.ownerId === userId;

      if (!sourceAccess || !targetAccess) {
        return res.status(403).json({ error: 'Not authorized to move card between boards' });
      }
    } else {
      // Same board, check access
      const boardMember = await prisma.boardMember.findFirst({
        where: {
          boardId: card.list.board.id,
          userId
        }
      });

      if (!boardMember && card.list.board.ownerId !== userId) {
        return res.status(403).json({ error: 'Not authorized to move this card' });
      }
    }

    // Update positions in source list if moving to different list
    if (card.listId !== listId) {
      await prisma.card.updateMany({
        where: {
          listId: card.listId,
          position: { gt: card.position }
        },
        data: {
          position: { decrement: 1 }
        }
      });
    }

    // Update positions in target list
    await prisma.card.updateMany({
      where: {
        listId,
        position: { gte: position }
      },
      data: {
        position: { increment: 1 }
      }
    });

    // Move the card
    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        listId,
        position
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        list: true,
        labels: true,
        attachments: true,
        comments: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        checklists: {
          include: {
            items: true
          }
        }
      }
    });

    // Create activity
    await prisma.activity.create({
      data: {
        action: 'moved',
        details: JSON.stringify({ 
          fromList: card.list.title, 
          toList: targetList.title,
          cardTitle: card.title 
        }),
        boardId: targetList.board.id,
        cardId: card.id,
        userId
      }
    });

    // Create notification for card owner if someone else moved their card
    if (card.creatorId !== userId) {
      await createCardMovedNotification(
        card.creatorId,
        userId,
        card.id,
        targetList.board.id,
        card.list.title,
        targetList.title
      );
    }

    res.json(updatedCard);
  } catch (error) {
    console.error('Move card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete card
export const deleteCard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const card = await prisma.card.findUnique({
      where: { id },
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

    // Check if user has access to this board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: card.list.board.id,
        userId
      }
    });

    if (!boardMember && card.list.board.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this card' });
    }

    // Update positions of cards in the same list
    await prisma.card.updateMany({
      where: {
        listId: card.listId,
        position: { gt: card.position }
      },
      data: {
        position: { decrement: 1 }
      }
    });

    // Delete the card (cascade will handle related records)
    await prisma.card.delete({
      where: { id }
    });

    // Create activity
    await prisma.activity.create({
      data: {
        action: 'deleted',
        details: JSON.stringify({ cardTitle: card.title }),
        boardId: card.list.board.id,
        userId
      }
    });

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get card by ID
export const getCardById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        list: {
          include: {
            board: true
          }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        labels: true,
        attachments: true,
        comments: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        checklists: {
          include: {
            items: {
              orderBy: { position: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check if user has access to this card's board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: card.list.board.id,
        userId
      }
    });

    if (!boardMember && card.list.board.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this card' });
    }

    res.json(card);
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get card by ID (alias)
export const getCard = getCardById;

// Create comment
export const createComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: cardId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!content || !cardId) {
      return res.status(400).json({ error: 'Content and cardId are required' });
    }

    // Check if card exists and user has access
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

    // Check if user has access to this card's board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: card.list.board.id,
        userId
      }
    });

    if (!boardMember && card.list.board.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to comment on this card' });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        cardId,
        userId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Create notification for card owner if someone else commented on their card
    if (card.creatorId !== userId) {
      await createCommentAddedNotification(
        card.creatorId,
        userId,
        cardId,
        card.list.board.id,
        content
      );
    }

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload cover image for card
export const uploadCoverImage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if card exists and user has access
    const card = await prisma.card.findUnique({
      where: { id },
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

    // Check if user has access to this card's board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: card.list.board.id,
        userId
      }
    });

    if (!boardMember && card.list.board.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this card' });
    }

    // Generate file path
    const coverImagePath = `/uploads/card-covers/${req.file.filename}`;

    // Update card with cover image path
    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        coverImage: coverImagePath
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        list: true,
        labels: true,
        checklists: {
          include: {
            items: true
          }
        }
      }
    });

    res.json({
      message: 'Cover image uploaded successfully',
      card: updatedCard
    });
  } catch (error) {
    console.error('Upload cover image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const updateCardLabels = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { labels } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if card exists and user has access
    const card = await prisma.card.findUnique({
      where: { id },
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

    // Check if user has access to this card's board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: card.list.board.id,
        userId
      }
    });

    if (!boardMember && card.list.board.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this card' });
    }

    // Update card with new labels using proper relation update
    // Create labels if they don't exist, then connect them
    const labelIds = labels.map((label: any) => label.id);
    
    // Upsert labels (create if not exists)
    for (const label of labels) {
      await prisma.label.upsert({
        where: { id: label.id },
        create: {
          id: label.id,
          name: label.name,
          color: label.color
        },
        update: {
          name: label.name,
          color: label.color
        }
      });
    }

    // Now connect the labels to the card
    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        labels: {
          set: labelIds.map((labelId: string) => ({ id: labelId }))
        }
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        list: true,
        labels: true,
        checklists: {
          include: {
            items: true
          }
        }
      }
    });

    res.json({
      message: 'Card labels updated successfully',
      card: updatedCard
    });
  } catch (error) {
    console.error('Update card labels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const getAllLabels = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Return a set of predefined labels that users can choose from
    // In a real application, these might be stored in the database
    const predefinedLabels = [
      { id: '1', name: 'Urgent', color: '#ef4444' },
      { id: '2', name: 'High Priority', color: '#f97316' },
      { id: '3', name: 'Medium Priority', color: '#eab308' },
      { id: '4', name: 'Low Priority', color: '#22c55e' },
      { id: '5', name: 'Bug', color: '#dc2626' },
      { id: '6', name: 'Feature', color: '#3b82f6' },
      { id: '7', name: 'Enhancement', color: '#8b5cf6' },
      { id: '8', name: 'Documentation', color: '#06b6d4' },
      { id: '9', name: 'Testing', color: '#10b981' },
      { id: '10', name: 'Review', color: '#f59e0b' },
      { id: '11', name: 'In Progress', color: '#6366f1' },
      { id: '12', name: 'Blocked', color: '#64748b' }
    ];

    res.json({
      labels: predefinedLabels
    });
  } catch (error) {
    console.error('Get all labels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const createChecklist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Checklist title is required' });
    }

    // Check if card exists and user has access
    const card = await prisma.card.findUnique({
      where: { id },
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

    // Check if user has access to this card's board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: card.list.board.id,
        userId
      }
    });

    if (!boardMember && card.list.board.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to add checklist to this card' });
    }

    // Get the next position for this checklist
    const maxPosition = await (prisma as any).checklist.findFirst({
      where: { cardId: id },
      orderBy: { position: 'desc' }
    });
    const position = maxPosition ? maxPosition.position + 1 : 0;

    // Create checklist
    const checklist = await (prisma as any).checklist.create({
      data: {
        title: title.trim(),
        cardId: id,
        position
      },
      include: {
        items: true
      }
    });

    res.status(201).json({
      message: 'Checklist created successfully',
      checklist
    });
  } catch (error) {
    console.error('Create checklist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const createChecklistItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { checklistId } = req.params;
    const { title, description } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Checklist item title is required' });
    }

    // Check if checklist exists and user has access
    const checklist = await (prisma as any).checklist.findUnique({
      where: { id: checklistId },
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

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    // Check if user has access to this card's board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: checklist.card.list.board.id,
        userId
      }
    });

    if (!boardMember && checklist.card.list.board.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to add item to this checklist' });
    }

    // Get the next position for this item
    const maxPosition = await (prisma as any).checklistItem.findFirst({
      where: { checklistId },
      orderBy: { position: 'desc' }
    });

    const position = maxPosition ? maxPosition.position + 1 : 0;

    // Create checklist item
    const item = await (prisma as any).checklistItem.create({
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        position,
        checklistId
      }
    });

    res.status(201).json({
      message: 'Checklist item created successfully',
      item
    });
  } catch (error) {
    console.error('Create checklist item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const updateChecklistItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;
    const { completed } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if checklist item exists and user has access
    const item = await (prisma as any).checklistItem.findUnique({
      where: { id: itemId },
      include: {
        checklist: {
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
        }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    // Check if user has access to this card's board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: item.checklist.card.list.board.id,
        userId
      }
    });

    if (!boardMember && item.checklist.card.list.board.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this checklist item' });
    }

    // Update checklist item
    const updatedItem = await (prisma as any).checklistItem.update({
      where: { id: itemId },
      data: {
        completed: completed !== undefined ? completed : item.completed
      }
    });

    res.json({
      message: 'Checklist item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Update checklist item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const deleteChecklistItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if checklist item exists and user has access
    const item = await (prisma as any).checklistItem.findUnique({
      where: { id: itemId },
      include: {
        checklist: {
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
        }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    // Check if user has access to this card's board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: item.checklist.card.list.board.id,
        userId
      }
    });

    if (!boardMember && item.checklist.card.list.board.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this checklist item' });
    }

    // Delete checklist item
    await (prisma as any).checklistItem.delete({
      where: { id: itemId }
    });

    res.json({
      message: 'Checklist item deleted successfully'
    });
  } catch (error) {
    console.error('Delete checklist item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const updateChecklist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { checklistId } = req.params;
    const { title, description } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if checklist exists and user has access
    const checklist = await (prisma as any).checklist.findUnique({
      where: { id: checklistId },
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

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    // Check if user has access to this card's board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: checklist.card.list.board.id,
        userId
      }
    });

    if (!boardMember && checklist.card.list.board.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this checklist' });
    }

    // Update checklist
    const updatedChecklist = await (prisma as any).checklist.update({
      where: { id: checklistId },
      data: {
        title: title !== undefined ? title : checklist.title,
        description: description !== undefined ? description : checklist.description
      },
      include: {
        items: true
      }
    });

    res.json({
      message: 'Checklist updated successfully',
      checklist: updatedChecklist
    });
  } catch (error) {
    console.error('Update checklist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteChecklist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { checklistId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if checklist exists and user has access
    const checklist = await (prisma as any).checklist.findUnique({
      where: { id: checklistId },
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

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    // Check if user has access to this card's board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: checklist.card.list.board.id,
        userId
      }
    });

    if (!boardMember && checklist.card.list.board.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this checklist' });
    }

    // Delete checklist (cascade will delete all items)
    await (prisma as any).checklist.delete({
      where: { id: checklistId }
    });

    res.json({
      message: 'Checklist deleted successfully'
    });
  } catch (error) {
    console.error('Delete checklist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
