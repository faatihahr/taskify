import { prisma } from '../prisma/client';
import { createNotification } from '../controllers/notification';

// Notification types
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_DUE: 'task_due',
  TASK_OVERDUE: 'task_overdue',
  BOARD_SHARED: 'board_shared',
  COMMENT_ADDED: 'comment_added',
  CARD_MOVED: 'card_moved',
  MEMBER_JOINED: 'member_joined'
} as const;

// Create notification for task assignment
export const createTaskAssignedNotification = async (
  assigneeId: string,
  cardId: string,
  boardId: string
) => {
  try {
    // Get card and board details
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

    await createNotification(
      assigneeId,
      'Task Assigned',
      `You have been assigned to "${card.title}" in ${card.list.board.title}`,
      NOTIFICATION_TYPES.TASK_ASSIGNED,
      boardId,
      cardId
    );

    return true;
  } catch (error) {
    console.error('Error creating task assigned notification:', error);
    return false;
  }
};

// Create notification for task due date
export const createTaskDueNotification = async (
  userId: string,
  cardId: string,
  boardId: string
) => {
  try {
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

    if (!card || !card.dueDate) return null;

    const now = new Date();
    const dueDate = new Date(card.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let message = `Task "${card.title}" is due`;

    if (diffDays < 0) {
      message = `Task "${card.title}" is overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      message = `Task "${card.title}" is due today`;
    } else if (diffDays === 1) {
      message = `Task "${card.title}" is due tomorrow`;
    } else if (diffDays <= 3) {
      message = `Task "${card.title}" is due in ${diffDays} days`;
    } else {
      return null; // Don't create notification for tasks due far in the future
    }

    await createNotification(
      userId,
      'Task Due Date',
      message,
      NOTIFICATION_TYPES.TASK_DUE,
      boardId,
      cardId
    );

    return true;
  } catch (error) {
    console.error('Error creating task due notification:', error);
    return false;
  }
};

// Create notification for board sharing
export const createBoardSharedNotification = async (
  userId: string,
  boardId: string,
  sharedBy: string
) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId }
    });

    if (!board) return null;

    await createNotification(
      userId,
      'Board Shared',
      `${sharedBy} shared the board "${board.title}" with you`,
      NOTIFICATION_TYPES.BOARD_SHARED,
      boardId
    );

    return true;
  } catch (error) {
    console.error('Error creating board shared notification:', error);
    return false;
  }
};

// Create notification for new comment
export const createCommentAddedNotification = async (
  cardOwnerId: string,
  commenterId: string,
  cardId: string,
  boardId: string,
  commentContent: string
) => {
  try {
    // Don't notify if user commented on their own card
    if (cardOwnerId === commenterId) return null;

    const [card, commenter] = await Promise.all([
      prisma.card.findUnique({
        where: { id: cardId },
        include: { 
          list: {
            include: {
              board: true
            }
          }
        }
      }),
      prisma.user.findUnique({
        where: { id: commenterId },
        select: { name: true }
      })
    ]);

    if (!card || !commenter) return null;

    const truncatedComment = commentContent.length > 50 
      ? commentContent.substring(0, 50) + '...' 
      : commentContent;

    await createNotification(
      cardOwnerId,
      'New Comment',
      `${commenter.name} commented on "${card.title}": "${truncatedComment}"`,
      NOTIFICATION_TYPES.COMMENT_ADDED,
      boardId,
      cardId
    );

    return true;
  } catch (error) {
    console.error('Error creating comment added notification:', error);
    return false;
  }
};

// Create notification for card movement
export const createCardMovedNotification = async (
  cardOwnerId: string,
  moverId: string,
  cardId: string,
  boardId: string,
  fromListTitle: string,
  toListTitle: string
) => {
  try {
    // Don't notify if user moved their own card
    if (cardOwnerId === moverId) return null;

    const [card, mover] = await Promise.all([
      prisma.card.findUnique({
        where: { id: cardId },
        include: { 
          list: {
            include: {
              board: true
            }
          }
        }
      }),
      prisma.user.findUnique({
        where: { id: moverId },
        select: { name: true }
      })
    ]);

    if (!card || !mover) return null;

    await createNotification(
      cardOwnerId,
      'Card Moved',
      `${mover.name} moved "${card.title}" from "${fromListTitle}" to "${toListTitle}"`,
      NOTIFICATION_TYPES.CARD_MOVED,
      boardId,
      cardId
    );

    return true;
  } catch (error) {
    console.error('Error creating card moved notification:', error);
    return false;
  }
};

// Create notification for new board member
export const createMemberJoinedNotification = async (
  boardOwnerId: string,
  newMemberId: string,
  boardId: string
) => {
  try {
    const [board, newMember] = await Promise.all([
      prisma.board.findUnique({
        where: { id: boardId }
      }),
      prisma.user.findUnique({
        where: { id: newMemberId },
        select: { name: true }
      })
    ]);

    if (!board || !newMember) return null;

    await createNotification(
      boardOwnerId,
      'New Member',
      `${newMember.name} joined the board "${board.title}"`,
      NOTIFICATION_TYPES.MEMBER_JOINED,
      boardId
    );

    return true;
  } catch (error) {
    console.error('Error creating member joined notification:', error);
    return false;
  }
};

// Check for due tasks and create notifications (to be run by a cron job)
export const checkDueTasks = async () => {
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
            board: true
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
      if (diffDays <= 3 && diffDays >= -7) { // Don't notify for very old overdue tasks
        await createTaskDueNotification(
          card.creatorId,
          card.id,
          card.list.board.id
        );
      }
    }

    return notifications;
  } catch (error) {
    console.error('Error checking due tasks:', error);
    return [];
  }
};

// Create notifications for all board members when a board is shared
export const createBoardSharedNotificationsForMembers = async (
  boardId: string,
  sharedBy: string
) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!board) return null;

    // Create notifications for all board members except the owner
    const notifications = await Promise.all(
      board.members
        .filter(member => member.userId !== board.ownerId)
        .map(member =>
          createBoardSharedNotification(
            member.userId,
            boardId,
            sharedBy
          )
        )
    );

    return notifications;
  } catch (error) {
    console.error('Error creating board shared notifications:', error);
    return null;
  }
};
