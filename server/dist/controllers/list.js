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
exports.deleteList = exports.moveList = exports.updateList = exports.getBoardLists = exports.createList = void 0;
const client_1 = require("../prisma/client");
const authHelpers_1 = require("../utils/authHelpers");
const permissions_1 = require("../utils/permissions");
// Create a new list
const createList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, position } = req.body;
        const { boardId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!title || !boardId) {
            return res.status(400).json({ error: 'Title and boardId are required' });
        }
        // Verify board exists and user has access
        const board = yield client_1.prisma.board.findUnique({
            where: { id: boardId }
        });
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        // Get user board info and permissions
        const boardInfo = yield (0, authHelpers_1.getUserBoardInfo)(userId, boardId);
        if (!boardInfo || !boardInfo.hasAccess) {
            return res.status(403).json({ error: 'Not authorized to create list in this board' });
        }
        // Check if user can create list
        if (!boardInfo.userRole && !boardInfo.isBoardOwner) {
            return res.status(403).json({ error: 'No valid role found for this board' });
        }
        if (!(0, permissions_1.canPerformAction)(boardInfo.userRole, 'create_list', boardInfo.isBoardOwner)) {
            return res.status(403).json({ error: 'Insufficient permissions to create list' });
        }
        // If position not provided, put it at the end
        let finalPosition = position;
        if (position === undefined) {
            const maxPosition = yield client_1.prisma.list.findFirst({
                where: { boardId },
                orderBy: { position: 'desc' }
            });
            finalPosition = maxPosition ? maxPosition.position + 1 : 0;
        }
        // Generate unique color for the list (not used in this board)
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
        // Get colors already used in this board
        const existingLists = yield client_1.prisma.list.findMany({
            where: { boardId },
            select: { color: true }
        });
        const usedColors = existingLists
            .filter(list => list.color)
            .map(list => list.color);
        // Get available colors (not used in this board)
        const availableColors = listColors.filter(color => !usedColors.includes(color));
        let assignedColor;
        if (availableColors.length > 0) {
            // Pick random from available colors
            assignedColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        }
        else {
            // Fallback: use any color if all are used (shouldn't happen with 8 colors)
            assignedColor = listColors[Math.floor(Math.random() * listColors.length)];
        }
        const list = yield client_1.prisma.list.create({
            data: {
                title,
                color: assignedColor,
                boardId,
                position: finalPosition
            },
            include: {
                cards: {
                    orderBy: { position: 'asc' }
                }
            }
        });
        // Create activity
        yield client_1.prisma.activity.create({
            data: {
                action: 'created',
                details: JSON.stringify({ listTitle: title }),
                boardId,
                userId
            }
        });
        res.status(201).json({ list });
    }
    catch (error) {
        console.error('Create list error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createList = createList;
// Get lists for a board
const getBoardLists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { boardId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        // Verify board exists and user has access
        const board = yield client_1.prisma.board.findUnique({
            where: { id: boardId }
        });
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        // Check if user is board member
        const isMember = yield client_1.prisma.boardMember.findUnique({
            where: {
                boardId_userId: {
                    boardId,
                    userId
                }
            }
        });
        if (!isMember && board.ownerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to view lists in this board' });
        }
        // Get lists with their current data
        const lists = yield client_1.prisma.list.findMany({
            where: { boardId },
            orderBy: { position: 'asc' },
            select: {
                id: true,
                title: true,
                color: true,
                position: true,
                createdAt: true,
                updatedAt: true,
                boardId: true,
                cards: {
                    orderBy: { position: 'asc' },
                    include: {
                        creator: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });
        // Auto-assign unique colors to lists that don't have them
        const listColors = [
            'bg-blue-100 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700',
            'bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-700',
            'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/50 dark:border-yellow-700',
            'bg-purple-100 border-purple-300 dark:bg-purple-900/50 dark:border-purple-700',
            'bg-pink-100 border-pink-300 dark:bg-pink-900/50 dark:border-pink-700',
            // 'bg-indigo-100 border-indigo-300 dark:bg-indigo-900/50 dark:border-indigo-700',
            'bg-red-100 border-red-300 dark:bg-red-900/50 dark:border-red-700',
            'bg-orange-100 border-orange-300 dark:bg-orange-900/50 dark:border-orange-700',
        ];
        // Check and update lists without colors
        const listsToUpdate = lists.filter(list => !list.color);
        if (listsToUpdate.length > 0) {
            console.log(`Auto-assigning unique colors to ${listsToUpdate.length} lists without colors in board ${boardId}`);
            // Get colors already used in this board
            const usedColors = lists
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
                }
                else {
                    // Fallback: use any color if all are used (shouldn't happen with 8 colors)
                    assignedColor = listColors[Math.floor(Math.random() * listColors.length)];
                }
                yield client_1.prisma.list.update({
                    where: { id: list.id },
                    data: { color: assignedColor }
                });
                // Update the in-memory list object
                list.color = assignedColor;
            }
        }
        res.json(lists);
    }
    catch (error) {
        console.error('Get board lists error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getBoardLists = getBoardLists;
// Update list
const updateList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { title, position } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!title && position === undefined) {
            return res.status(400).json({ error: 'Title or position is required' });
        }
        const list = yield client_1.prisma.list.findUnique({
            where: { id },
            include: {
                board: true
            }
        });
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        // Check if user is board member
        const isMember = yield client_1.prisma.boardMember.findUnique({
            where: {
                boardId_userId: {
                    boardId: list.boardId,
                    userId
                }
            }
        });
        if (!isMember && list.board.ownerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this list' });
        }
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (position !== undefined)
            updateData.position = position;
        // If updating position, handle reordering
        if (position !== undefined && position !== list.position) {
            // Get all lists in the board
            const allLists = yield client_1.prisma.list.findMany({
                where: {
                    boardId: list.boardId,
                    id: { not: id } // Exclude current list
                },
                orderBy: { position: 'asc' }
            });
            // Update positions of other lists
            yield client_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                // Shift lists to make space
                for (const otherList of allLists) {
                    if (otherList.position >= position) {
                        yield tx.list.update({
                            where: { id: otherList.id },
                            data: { position: otherList.position + 1 }
                        });
                    }
                }
                // Update the current list
                yield tx.list.update({
                    where: { id },
                    data: updateData
                });
            }));
        }
        else {
            // Simple title update
            yield client_1.prisma.list.update({
                where: { id },
                data: updateData
            });
        }
        // Fetch updated list
        const updatedList = yield client_1.prisma.list.findUnique({
            where: { id },
            include: {
                cards: {
                    orderBy: { position: 'asc' }
                }
            }
        });
        res.json({ list: updatedList });
    }
    catch (error) {
        console.error('Update list error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.updateList = updateList;
// Move list to different position
const moveList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { position } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        console.log('Move list request:', { id, position, userId });
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (position === undefined || position < 0) {
            return res.status(400).json({ error: 'Valid position is required' });
        }
        const list = yield client_1.prisma.list.findUnique({
            where: { id },
            include: {
                board: true
            }
        });
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        console.log('Current list position:', list.position);
        // Check if user is board member
        const isMember = yield client_1.prisma.boardMember.findUnique({
            where: {
                boardId_userId: {
                    boardId: list.boardId,
                    userId
                }
            }
        });
        if (!isMember && list.board.ownerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to move this list' });
        }
        // Get current position
        const currentPosition = list.position;
        // Update positions of other lists
        if (position < currentPosition) {
            // Moving list to earlier position - shift other lists right
            console.log('Moving list to earlier position, shifting others right');
            yield client_1.prisma.list.updateMany({
                where: {
                    boardId: list.boardId,
                    position: { gte: position, lt: currentPosition }
                },
                data: {
                    position: { increment: 1 }
                }
            });
        }
        else if (position > currentPosition) {
            // Moving list to later position - shift other lists left
            console.log('Moving list to later position, shifting others left');
            yield client_1.prisma.list.updateMany({
                where: {
                    boardId: list.boardId,
                    position: { gt: currentPosition, lte: position }
                },
                data: {
                    position: { decrement: 1 }
                }
            });
        }
        // Update the list position
        const updatedList = yield client_1.prisma.list.update({
            where: { id },
            data: { position },
            select: {
                id: true,
                title: true,
                color: true,
                position: true,
                createdAt: true,
                updatedAt: true,
                boardId: true,
                cards: {
                    orderBy: { position: 'asc' }
                }
            }
        });
        console.log('Updated list position:', updatedList.position);
        // Create activity
        yield client_1.prisma.activity.create({
            data: {
                action: 'moved',
                details: JSON.stringify({ listTitle: list.title, fromPosition: currentPosition, toPosition: position }),
                boardId: list.boardId,
                userId
            }
        });
        res.json({ list: updatedList });
    }
    catch (error) {
        console.error('Move list error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.moveList = moveList;
// Delete list
const deleteList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const list = yield client_1.prisma.list.findUnique({
            where: { id },
            include: {
                board: true,
                cards: true
            }
        });
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        // Check if user is board member
        const isMember = yield client_1.prisma.boardMember.findUnique({
            where: {
                boardId_userId: {
                    boardId: list.boardId,
                    userId
                }
            }
        });
        if (!isMember && list.board.ownerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this list' });
        }
        // Check if list has cards
        if (list.cards.length > 0) {
            return res.status(400).json({ error: 'Cannot delete list that contains cards. Move or delete cards first.' });
        }
        // Update positions of other lists
        yield client_1.prisma.list.updateMany({
            where: {
                boardId: list.boardId,
                position: { gt: list.position }
            },
            data: {
                position: { decrement: 1 }
            }
        });
        // Delete the list
        yield client_1.prisma.list.delete({
            where: { id }
        });
        // Create activity
        yield client_1.prisma.activity.create({
            data: {
                action: 'deleted',
                details: JSON.stringify({ listTitle: list.title }),
                boardId: list.boardId,
                userId
            }
        });
        res.json({ message: 'List deleted successfully' });
    }
    catch (error) {
        console.error('Delete list error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteList = deleteList;
