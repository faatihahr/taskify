import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import fs from 'fs';
import path from 'path';

export async function createBoard(req: Request, res: Response) {
  try {
    console.log('Creating board with req.body:', req.body);
    console.log('User:', (req as any).user);
    console.log('File:', (req as any).file);
    const { title, description, background } = req.body;
    const userId = (req as any).user.id; // From auth middleware

    // Handle uploaded background image
    let backgroundPath = background;
    if ((req as any).file) {
      backgroundPath = `/uploads/${(req as any).file.filename}`;
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const board = await prisma.board.create({
      data: {
        title,
        description,
        background: backgroundPath,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'owner'
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'created',
        details: JSON.stringify({ title }),
        boardId: board.id,
        userId
      }
    });

    res.status(201).json({
      message: 'Board created successfully',
      board
    });
  } catch (error) {
    // Clean up uploaded file if board creation fails
    if ((req as any).file) {
      const filePath = path.join(__dirname, "..", "uploads", (req as any).file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    throw error;
  }
}

export async function getUserBoards(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId
              }
            }
          }
        ]
      },
      include: {
        owner: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            lists: true,
            members: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json({
      message: 'Boards retrieved successfully',
      boards
    });
  } catch (error) {
    throw error;
  }
}

export async function getBoardById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Check if user has access
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: id,
        userId
      }
    });

    if (!boardMember) {
      const board = await prisma.board.findUnique({
        where: { id }
      });
      if (!board || board.ownerId !== userId) {
        const error = new Error('Board not found or access denied');
        (error as any).status = 404;
        throw error;
      }
    }

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        owner: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        lists: {
          orderBy: {
            position: 'asc'
          },
          select: {
            id: true,
            title: true,
            color: true,
            position: true,
            createdAt: true,
            updatedAt: true,
            boardId: true,
            cards: {
              orderBy: {
                position: 'asc'
              },
              select: {
                id: true,
                title: true,
                description: true,
                position: true,
                coverImage: true,
                dueDate: true,
                completed: true,
                createdAt: true,
                updatedAt: true,
                listId: true,
                creatorId: true,
                creator: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                labels: true,
                comments: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  },
                  orderBy: {
                    createdAt: 'desc'
                  }
                },
                checklists: {
                  include: {
                    items: {
                      orderBy: { position: 'asc' }
                    }
                  },
                  orderBy: { position: 'asc' }
                },
                _count: {
                  select: {
                    comments: true,
                    attachments: true,
                    checklists: true
                  }
                }
              }
            }
          }
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Recent activities
        }
      }
    });

    if (!board) {
      const error = new Error('Board not found');
      (error as any).status = 404;
      throw error;
    }

    // Auto-assign unique colors to lists that don't have them
    const listColors = [
      'bg-blue-100 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700',
      'bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-700',
      'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/50 dark:border-yellow-700',
      'bg-purple-100 border-purple-300 dark:bg-purple-900/50 dark:border-purple-700',
      'bg-pink-100 border-pink-300 dark:bg-pink-900/50 dark:border-pink-700',
      'bg-indigo-100 border-indigo-300 dark:bg-indigo-900/50 dark:border-indigo-700',
      'bg-red-100 border-red-300 dark:bg-red-900/50 dark:border-red-700',
      'bg-orange-100 border-orange-300 dark:bg-orange-900/50 dark:border-orange-700',
    ];

    // Check and update lists without colors
    const listsToUpdate = board.lists.filter(list => !list.color);
    if (listsToUpdate.length > 0) {
      console.log(`Auto-assigning unique colors to ${listsToUpdate.length} lists without colors in board ${id}`);

      // Get colors already used in this board
      const usedColors = board.lists
        .filter(list => list.color)
        .map(list => list.color);

      // Get available colors (not used in this board)
      const availableColors = listColors.filter(color => !usedColors.includes(color));

      for (const list of listsToUpdate) {
        let assignedColor;

        if (availableColors.length > 0) {
          // Assign from available colors
          const randomIndex = Math.floor(Math.random() * availableColors.length);
          assignedColor = availableColors.splice(randomIndex, 1)[0];
        } else {
          // Fallback: use any color if all are used (shouldn't happen with 8 colors)
          assignedColor = listColors[Math.floor(Math.random() * listColors.length)];
        }

        await prisma.list.update({
          where: { id: list.id },
          data: { color: assignedColor }
        });

        // Update the in-memory list object
        list.color = assignedColor;
      }
    }

    res.json({
      message: 'Board retrieved successfully',
      board
    });
  } catch (error) {
    throw error;
  }
}

export async function updateBoard(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, background } = req.body;
    const userId = (req as any).user.id;
    console.log('Updating board:', id, 'User:', userId);

    // Check if user has access (is owner or member)
    const member = await prisma.boardMember.findFirst({
      where: {
        boardId: id,
        userId
      }
    });

    const board = await prisma.board.findUnique({
      where: { id }
    });

    console.log('Member found:', member);
    console.log('Board owner:', board?.ownerId);

    if (!board) {
      const error = new Error('Board not found');
      (error as any).status = 404;
      throw error;
    }

    // Allow if user is a member of the board OR is the owner
    const hasAccess = member || board.ownerId === userId;
    if (!hasAccess) {
      console.log('Authorization failed - no access');
      const error = new Error('Not authorized to update board');
      (error as any).status = 403;
      throw error;
    }

    // Handle uploaded background image
    let backgroundPath = background;
    let oldBackgroundImage; // For cleanup
    if ((req as any).file) {
      backgroundPath = `/uploads/${(req as any).file.filename}`;
    }

    // Get current board background for cleanup
    const currentBoard = await prisma.board.findUnique({
      where: { id },
      select: { background: true }
    });

    if (currentBoard?.background && currentBoard.background.startsWith('/uploads/')) {
      oldBackgroundImage = path.join(__dirname, "..", currentBoard.background);
    }

    // Filter out empty strings from update data
    const updateData: any = {};
    if (title !== '' && title !== undefined) updateData.title = title;
    if (description !== '' && description !== undefined) updateData.description = description;
    if (backgroundPath !== '' && backgroundPath !== undefined) updateData.background = backgroundPath;

    if (Object.keys(updateData).length === 0) {
      const error = new Error('At least one field must be provided for update');
      (error as any).status = 400;
      throw error;
    }

    const updatedBoard = await prisma.board.update({
      where: { id },
      data: updateData
    });

    // Remove old image file if new image uploaded and old was uploaded
    if ((req as any).file && oldBackgroundImage && fs.existsSync(oldBackgroundImage)) {
      fs.unlinkSync(oldBackgroundImage);
    }

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'updated',
        details: JSON.stringify({
          title: title !== undefined,
          description: description !== undefined,
          background: background !== undefined
        }),
        boardId: id,
        userId
      }
    });

    res.json({
      message: 'Board updated successfully',
      board: updatedBoard
    });
  } catch (error) {
    // Clean up uploaded file if update fails
    if ((req as any).file) {
      const filePath = path.join(__dirname, "..", "uploads", (req as any).file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    throw error;
  }
}

export async function deleteBoard(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const board = await prisma.board.findUnique({
      where: { id }
    });

    if (!board) {
      const error = new Error('Board not found');
      (error as any).status = 404;
      throw error;
    }

    if (board.ownerId !== userId) {
      const error = new Error('Only board owner can delete the board');
      (error as any).status = 403;
      throw error;
    }

    await prisma.board.delete({
      where: { id }
    });

    res.json({
      message: 'Board deleted successfully'
    });
  } catch (error) {
    throw error;
  }
}
