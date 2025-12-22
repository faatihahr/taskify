import { prisma } from '../prisma/client';
import { createBoardSharedNotification, createBoardSharedNotificationsForMembers } from '../services/notificationService';

// Create notifications when a board is shared with new members
export const handleBoardSharing = async (
  boardId: string,
  sharedByUserId: string,
  targetUserIds?: string[]
) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          include: {
            user: true
          }
        },
        owner: true
      }
    });

    if (!board) return null;

    const sharer = await prisma.user.findUnique({
      where: { id: sharedByUserId },
      select: { name: true }
    });

    if (!sharer) return null;

    // If specific target users are provided, notify only them
    if (targetUserIds && targetUserIds.length > 0) {
      const notifications = await Promise.all(
        targetUserIds.map(userId => 
          createBoardSharedNotification(userId, boardId, sharer.name || 'Unknown')
        )
      );
      return notifications;
    }

    // Otherwise, notify all existing members (except the owner and sharer)
    const membersToNotify = board.members.filter(
      member => member.userId !== board.ownerId && member.userId !== sharedByUserId
    );

    const notifications = await Promise.all(
      membersToNotify.map(member =>
        createBoardSharedNotification(member.userId, boardId, sharer.name || 'Unknown')
      )
    );

    return notifications;
  } catch (error) {
    console.error('Error handling board sharing notifications:', error);
    return null;
  }
};

// Create notifications for task assignment (user-specific)
export const handleTaskAssignment = async (
  cardId: string,
  assigneeId: string,
  assignerId: string
) => {
  try {
    // Only create notification if assignee is different from assigner
    if (assigneeId === assignerId) return null;

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

    if (!card) return null;

    // Check if assignee has access to this board
    const hasAccess = await prisma.boardMember.findFirst({
      where: {
        boardId: card.list.board.id,
        userId: assigneeId
      }
    }) || await prisma.board.findFirst({
      where: {
        id: card.list.board.id,
        ownerId: assigneeId
      }
    });

    if (!hasAccess) {
      console.log('Assignee does not have access to the board, skipping notification');
      return null;
    }

    // Create notification for the assignee
    const { createTaskAssignedNotification } = await import('../services/notificationService');
    return await createTaskAssignedNotification(assigneeId, cardId, card.list.board.id);
  } catch (error) {
    console.error('Error handling task assignment notification:', error);
    return null;
  }
};

// Create notifications for due date reminders (user-specific)
export const handleDueDateReminders = async () => {
  try {
    const cardsWithDueDates = await prisma.card.findMany({
      where: {
        dueDate: {
          not: null
        },
        completed: false
      },
      include: {
        creator: true,
        list: {
          include: {
            board: {
              include: {
                members: true
              }
            }
          }
        }
      }
    });

    const notifications: any[] = [];

    for (const card of cardsWithDueDates) {
      if (!card.dueDate) continue;

      const now = new Date();
      const dueDate = new Date(card.dueDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Create notifications for tasks due today, overdue, or due soon (within 3 days)
      if (diffDays <= 3 && diffDays >= -7) {
        // Notify card creator
        const { createTaskDueNotification } = await import('../services/notificationService');
        await createTaskDueNotification(
          card.creatorId,
          card.id,
          card.list.board.id
        );

        // Also notify board members if this is a shared board
        if (card.list.board.members.length > 0) {
          for (const member of card.list.board.members) {
            // Don't notify the creator again
            if (member.userId !== card.creatorId) {
              await createTaskDueNotification(
                member.userId,
                card.id,
                card.list.board.id
              );
            }
          }
        }
      }
    }

    return notifications;
  } catch (error) {
    console.error('Error handling due date reminders:', error);
    return [];
  }
};

// Clean up old notifications (older than 30 days and already read)
export const cleanupOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await (prisma as any).notification.deleteMany({
      where: {
        isRead: true,
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    console.log(`Cleaned up ${result.count} old notifications`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    return 0;
  }
};
