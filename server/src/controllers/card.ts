import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

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
    const { cardId, content } = req.body;
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

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Aliases for route compatibility
export const uploadCoverImage = async (req: AuthenticatedRequest, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
};
export const coverUploadMiddleware = (req: any, res: any, next: any) => next();
export const updateCardLabels = async (req: AuthenticatedRequest, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
};
export const getAllLabels = async (req: AuthenticatedRequest, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
};
export const createChecklist = async (req: AuthenticatedRequest, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
};
export const createChecklistItem = async (req: AuthenticatedRequest, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
};
export const updateChecklistItem = async (req: AuthenticatedRequest, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
};
export const deleteChecklistItem = async (req: AuthenticatedRequest, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
};
export const updateChecklist = updateChecklistItem;
export const deleteChecklist = deleteChecklistItem;
