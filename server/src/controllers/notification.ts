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

// Get all notifications for a user
export const getUserNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notifications = await (prisma as any).notification.findMany({
      where: {
        userId: userId
      },
      include: {
        board: {
          select: {
            id: true,
            title: true
          }
        },
        card: {
          select: {
            id: true,
            title: true,
            list: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notification = await (prisma as any).notification.updateMany({
      where: {
        id: notificationId,
        userId: userId // Ensure user can only mark their own notifications
      },
      data: {
        isRead: true
      }
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found or unauthorized' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await (prisma as any).notification.updateMany({
      where: {
        userId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Delete notification
export const deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notification = await (prisma as any).notification.deleteMany({
      where: {
        id: notificationId,
        userId: userId // Ensure user can only delete their own notifications
      }
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found or unauthorized' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Create notification (helper function for other controllers)
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string,
  boardId?: string,
  cardId?: string
) => {
  try {
    const notification = await (prisma as any).notification.create({
      data: {
        userId,
        title,
        message,
        type,
        boardId,
        cardId
      },
      include: {
        board: {
          select: {
            id: true,
            title: true
          }
        },
        card: {
          select: {
            id: true,
            title: true,
            list: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const count = await (prisma as any).notification.count({
      where: {
        userId: userId,
        isRead: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    res.status(500).json({ error: 'Failed to fetch unread notification count' });
  }
};
