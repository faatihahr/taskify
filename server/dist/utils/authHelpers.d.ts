export declare function getUserBoardInfo(userId: string, boardId: string): Promise<{
    isBoardOwner: boolean;
    userRole: null;
    hasAccess: boolean;
} | null>;
export declare function checkBoardPermission(userRole: string | null, isBoardOwner: boolean, action: string): boolean;
