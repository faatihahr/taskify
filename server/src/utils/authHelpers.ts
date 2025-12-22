import { prisma } from '../prisma/client';

export async function getUserBoardInfo(userId: string, boardId: string) {
  // Check if user is the board owner
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { ownerId: true }
  });

  if (!board) {
    return null;
  }

  const isBoardOwner = board.ownerId === userId;

  // Get user's board member info
  const boardMember = await prisma.boardMember.findFirst({
    where: {
      userId,
      boardId,
    },
  });

  return {
    isBoardOwner,
    userRole: null,
    hasAccess: isBoardOwner || !!boardMember,
  };
}

export function checkBoardPermission(
  userRole: string | null,
  isBoardOwner: boolean,
  action: string
): boolean {
  // If user doesn't have access and is not owner, deny everything
  if (!isBoardOwner) {
    return false;
  }

  // Only board owners have access
  return true;
}
