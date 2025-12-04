import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { 
  createCardSchema, 
  updateCardSchema, 
  moveCardSchema 
} from '../validation/card_joi';

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
    const { title, description, listId, position, dueDate, coverImage } = req.body;
    const creatorId = req.user?.id;
    if (!creatorId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify list exists
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: { board: true }
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Check if user is board member
    const isMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: list.board.id,
          userId: creatorId
        }
      }
    });

    if (!isMember && list.board.ownerId !== creatorId) {
      return res.status(403).json({ error: 'Not authorized to create card in this board' });
    }

    // If position not provided, put it at the end
    let finalPosition = position;
    if (position === undefined) {
      const maxPosition = await prisma.card.findFirst({
        where: { listId },
        orderBy: { position: 'desc' }
      });
      finalPosition = maxPosition ? maxPosition.position + 1 : 0;
    }

    const card = await prisma.card.create({
      data: {
        title,
        description,
        listId,
        creatorId,
        position: finalPosition,
        dueDate: dueDate ? new Date(dueDate) : null,
        coverImage
      },
      include: {
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
        action: 'created',
        details: JSON.stringify({ cardTitle: title }),
        boardId: list.board.id,
        cardId: card.id,
        userId: creatorId
      }
    });

    res.status(201).json(card);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get card by ID
export const getCard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        list: {
          include: {
            board: {
              include: {
                members: {
                  where: { userId },
                  select: { role: true }
                }
              }
            }
          }
        },
        labels: true,
        attachments: true,
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        checklists: {
          include: {
            items: {
              orderBy: { position: 'asc' }
            }
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check if user has access to this board
    const hasAccess = card.list.board.members.length > 0 || card.list.board.ownerId === userId;
    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to view this card' });
    }

    res.json(card);
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update card
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
          }
        },
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
      const isMember = await prisma.boardMember.findUnique({
        where: {
          boardId_userId: {
            boardId: card.list.board.id,
            userId
          }
        }
      });

      if (!isMember && card.list.board.ownerId !== userId) {
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
