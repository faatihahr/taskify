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
exports.deleteChecklist = exports.updateChecklist = exports.deleteChecklistItem = exports.updateChecklistItem = exports.createChecklistItem = exports.createChecklist = exports.getAllLabels = exports.updateCardLabels = exports.coverUploadMiddleware = exports.uploadCoverImage = exports.createComment = exports.getCard = exports.getCardById = exports.deleteCard = exports.moveCard = exports.updateCard = exports.createCard = void 0;
const client_1 = require("../prisma/client");
// Create a new card
const createCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, listId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!title || !listId) {
            return res.status(400).json({ error: 'Title and listId are required' });
        }
        // Get list and verify board access
        const list = yield client_1.prisma.list.findUnique({
            where: { id: listId },
            include: { board: true }
        });
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        // Check if user has access to this board
        const boardMember = yield client_1.prisma.boardMember.findFirst({
            where: {
                boardId: list.board.id,
                userId
            }
        });
        if (!boardMember && list.board.ownerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to create card in this board' });
        }
        // Get the next position for this card
        const maxPosition = yield client_1.prisma.card.findFirst({
            where: { listId },
            orderBy: { position: 'desc' }
        });
        const position = maxPosition ? maxPosition.position + 1 : 0;
        const card = yield client_1.prisma.card.create({
            data: {
                title: title.trim(),
                description: (description === null || description === void 0 ? void 0 : description.trim()) || '',
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
        yield client_1.prisma.activity.create({
            data: {
                action: 'created',
                details: JSON.stringify({ cardTitle: card.title }),
                boardId: list.board.id,
                cardId: card.id,
                userId
            }
        });
        res.status(201).json(card);
    }
    catch (error) {
        console.error('Create card error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createCard = createCard;
// Update a card
const updateCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { title, description, dueDate, coverImage, completed } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const card = yield client_1.prisma.card.findUnique({
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
        const boardMember = yield client_1.prisma.boardMember.findFirst({
            where: {
                boardId: card.list.board.id,
                userId
            }
        });
        if (!boardMember && card.list.board.ownerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this card' });
        }
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (dueDate !== undefined)
            updateData.dueDate = dueDate ? new Date(dueDate) : null;
        if (coverImage !== undefined)
            updateData.coverImage = coverImage;
        if (completed !== undefined)
            updateData.completed = completed;
        const updatedCard = yield client_1.prisma.card.update({
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
            yield client_1.prisma.activity.create({
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
            yield client_1.prisma.activity.create({
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
    }
    catch (error) {
        console.error('Update card error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.updateCard = updateCard;
// Move card to different list or position
const moveCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { listId, position } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const card = yield client_1.prisma.card.findUnique({
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
        const targetList = yield client_1.prisma.list.findUnique({
            where: { id: listId },
            include: { board: true }
        });
        if (!targetList) {
            return res.status(404).json({ error: 'Target list not found' });
        }
        // Check if user is member of both boards (if moving between boards)
        if (card.list.board.id !== targetList.board.id) {
            const [sourceMember, targetMember] = yield Promise.all([
                client_1.prisma.boardMember.findUnique({
                    where: {
                        boardId_userId: {
                            boardId: card.list.board.id,
                            userId
                        }
                    }
                }),
                client_1.prisma.boardMember.findUnique({
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
        }
        else {
            // Same board, check access
            const boardMember = yield client_1.prisma.boardMember.findFirst({
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
            yield client_1.prisma.card.updateMany({
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
        yield client_1.prisma.card.updateMany({
            where: {
                listId,
                position: { gte: position }
            },
            data: {
                position: { increment: 1 }
            }
        });
        // Move the card
        const updatedCard = yield client_1.prisma.card.update({
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
        yield client_1.prisma.activity.create({
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
    }
    catch (error) {
        console.error('Move card error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.moveCard = moveCard;
// Delete card
const deleteCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const card = yield client_1.prisma.card.findUnique({
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
        const boardMember = yield client_1.prisma.boardMember.findFirst({
            where: {
                boardId: card.list.board.id,
                userId
            }
        });
        if (!boardMember && card.list.board.ownerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this card' });
        }
        // Update positions of cards in the same list
        yield client_1.prisma.card.updateMany({
            where: {
                listId: card.listId,
                position: { gt: card.position }
            },
            data: {
                position: { decrement: 1 }
            }
        });
        // Delete the card (cascade will handle related records)
        yield client_1.prisma.card.delete({
            where: { id }
        });
        // Create activity
        yield client_1.prisma.activity.create({
            data: {
                action: 'deleted',
                details: JSON.stringify({ cardTitle: card.title }),
                boardId: card.list.board.id,
                userId
            }
        });
        res.json({ message: 'Card deleted successfully' });
    }
    catch (error) {
        console.error('Delete card error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteCard = deleteCard;
// Get card by ID
const getCardById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const card = yield client_1.prisma.card.findUnique({
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
        const boardMember = yield client_1.prisma.boardMember.findFirst({
            where: {
                boardId: card.list.board.id,
                userId
            }
        });
        if (!boardMember && card.list.board.ownerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to view this card' });
        }
        res.json(card);
    }
    catch (error) {
        console.error('Get card error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getCardById = getCardById;
// Get card by ID (alias)
exports.getCard = exports.getCardById;
// Create comment
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { cardId, content } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!content || !cardId) {
            return res.status(400).json({ error: 'Content and cardId are required' });
        }
        // Check if card exists and user has access
        const card = yield client_1.prisma.card.findUnique({
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
        const boardMember = yield client_1.prisma.boardMember.findFirst({
            where: {
                boardId: card.list.board.id,
                userId
            }
        });
        if (!boardMember && card.list.board.ownerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to comment on this card' });
        }
        const comment = yield client_1.prisma.comment.create({
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
    }
    catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createComment = createComment;
// Aliases for route compatibility
const uploadCoverImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(501).json({ error: 'Not implemented' });
});
exports.uploadCoverImage = uploadCoverImage;
const coverUploadMiddleware = (req, res, next) => next();
exports.coverUploadMiddleware = coverUploadMiddleware;
const updateCardLabels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(501).json({ error: 'Not implemented' });
});
exports.updateCardLabels = updateCardLabels;
const getAllLabels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(501).json({ error: 'Not implemented' });
});
exports.getAllLabels = getAllLabels;
const createChecklist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(501).json({ error: 'Not implemented' });
});
exports.createChecklist = createChecklist;
const createChecklistItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(501).json({ error: 'Not implemented' });
});
exports.createChecklistItem = createChecklistItem;
const updateChecklistItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(501).json({ error: 'Not implemented' });
});
exports.updateChecklistItem = updateChecklistItem;
const deleteChecklistItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(501).json({ error: 'Not implemented' });
});
exports.deleteChecklistItem = deleteChecklistItem;
exports.updateChecklist = exports.updateChecklistItem;
exports.deleteChecklist = exports.deleteChecklistItem;
