"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBoardInfo = getUserBoardInfo;
exports.checkBoardPermission = checkBoardPermission;
const client_1 = require("../prisma/client");
function getUserBoardInfo(userId, boardId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if user is the board owner
        const board = yield client_1.prisma.board.findUnique({
            where: { id: boardId },
            select: { ownerId: true }
        });
        if (!board) {
            return null;
        }
        const isBoardOwner = board.ownerId === userId;
        // Get user's board member info
        const boardMember = yield client_1.prisma.boardMember.findFirst({
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
    });
}
function checkBoardPermission(userRole, isBoardOwner, action) {
    // If user doesn't have access and is not owner, deny everything
    if (!isBoardOwner) {
        return false;
    }
    // Only board owners have access
    return true;
}
