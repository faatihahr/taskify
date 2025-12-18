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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coverUploadMiddleware = exports.createComment = exports.uploadCoverImage = exports.deleteCard = exports.moveCard = exports.updateCard = exports.getCard = exports.createCard = void 0;
const client_1 = require("../prisma/client");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure multer for cover image uploads
const coverStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path_1.default.join(process.cwd(), 'uploads', 'covers');
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `cover-${uniqueSuffix}${ext}`);
    }
});
const coverUpload = (0, multer_1.default)({
    storage: coverStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit for cover images
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed for cover images.'));
        }
    }
});
// Create a new card
const createCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, listId, position, dueDate, coverImage } = req.body;
        const creatorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!creatorId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        // Verify list exists
        const list = yield client_1.prisma.list.findUnique({
            where: { id: listId },
            include: { board: true }
        });
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        // Check if user is board member
        const isMember = yield client_1.prisma.boardMember.findUnique({
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
            const maxPosition = yield client_1.prisma.card.findFirst({
                where: { listId },
                orderBy: { position: 'desc' }
            });
            finalPosition = maxPosition ? maxPosition.position + 1 : 0;
        }
        const card = yield client_1.prisma.card.create({
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
                list: {
                    include: {
                        board: true
                    }
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
        yield client_1.prisma.activity.create({
            data: {
                action: 'created',
                details: JSON.stringify({ cardTitle: title }),
                boardId: list.board.id,
                cardId: card.id,
                userId: creatorId
            }
        });
        res.status(201).json({ card });
    }
    catch (error) {
        console.error('Create card error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createCard = createCard;
// Get card by ID
const getCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (error) {
        console.error('Get card error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getCard = getCard;
// Update card
const updateCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { title, description, dueDate, coverImage, completed, listId, position } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        console.log('=== UPDATE CARD DEBUG ===');
        console.log('Card ID:', id);
        console.log('Request body:', { title, description, dueDate, coverImage, completed, listId, position });
        console.log('User ID:', userId);
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
        // Check if user is board member
        const isMember = yield client_1.prisma.boardMember.findUnique({
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
        // Handle listId and position updates (for drag and drop)
        if (listId !== undefined && listId !== card.listId) {
            // Verify user has access to the target list
            const targetList = yield client_1.prisma.list.findUnique({
                where: { id: listId },
                include: { board: true }
            });
            if (!targetList) {
                return res.status(404).json({ error: 'Target list not found' });
            }
            // Check if user is member of target board
            const isTargetBoardMember = yield client_1.prisma.boardMember.findUnique({
                where: {
                    boardId_userId: {
                        boardId: targetList.board.id,
                        userId
                    }
                }
            });
            if (!isTargetBoardMember && targetList.board.ownerId !== userId) {
                return res.status(403).json({ error: 'Not authorized to move card to this list' });
            }
            updateData.listId = listId;
        }
        if (position !== undefined) {
            updateData.position = position;
        }
        // If moving card to different position or list, handle reordering
        if ((listId !== undefined && listId !== card.listId) ||
            (position !== undefined && position !== card.position)) {
            const targetListId = listId || card.listId;
            const targetPosition = position !== undefined ? position : card.position;
            const isMovingToSameList = targetListId === card.listId;
            const currentPosition = card.position;
            console.log('REORDERING DEBUG:');
            console.log('Current position:', currentPosition);
            console.log('Target position:', targetPosition);
            console.log('Target list ID:', targetListId);
            console.log('Is same list:', isMovingToSameList);
            // Get all cards in the target list (including current card if same list)
            const allCardsInTargetList = yield client_1.prisma.card.findMany({
                where: {
                    listId: targetListId
                },
                orderBy: { position: 'asc' }
            });
            console.log('Cards in target list before update:', allCardsInTargetList.map(c => ({ id: c.id, position: c.position })));
            // Update positions of other cards
            yield client_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                if (isMovingToSameList) {
                    // Moving within same list - need to handle UI index vs database position
                    console.log('Moving within same list - handling UI index conversion');
                    // Sort cards by position to ensure correct order
                    const sortedCards = allCardsInTargetList.sort((a, b) => a.position - b.position);
                    // Find the actual database positions
                    let actualCurrentPosition = currentPosition;
                    let actualTargetPosition = targetPosition;
                    // Find current card's position in sorted array
                    const currentCardIndex = sortedCards.findIndex(card => card.id === id);
                    if (currentCardIndex !== -1) {
                        actualCurrentPosition = sortedCards[currentCardIndex].position;
                    }
                    // Calculate target position based on UI index
                    if (targetPosition === 0) {
                        actualTargetPosition = 0;
                    }
                    else if (targetPosition >= sortedCards.length) {
                        const lastCard = sortedCards[sortedCards.length - 1];
                        actualTargetPosition = lastCard ? lastCard.position + 1 : 0;
                    }
                    else {
                        const cardAtTargetIndex = sortedCards[targetPosition];
                        if (cardAtTargetIndex) {
                            actualTargetPosition = cardAtTargetIndex.position;
                        }
                    }
                    console.log('Same list movement - Current:', actualCurrentPosition, '-> Target:', actualTargetPosition);
                    if (actualTargetPosition < actualCurrentPosition) {
                        // Moving up: shift cards down between target and current position
                        for (const card of sortedCards) {
                            if (card.position >= actualTargetPosition && card.position < actualCurrentPosition && card.id !== id) {
                                console.log('Shifting card down:', card.id, 'from', card.position, 'to', card.position + 1);
                                yield tx.card.update({
                                    where: { id: card.id },
                                    data: { position: card.position + 1 }
                                });
                            }
                        }
                    }
                    else if (actualTargetPosition > actualCurrentPosition) {
                        // Moving down: shift cards up between current and target position
                        for (const card of sortedCards) {
                            if (card.position > actualCurrentPosition && card.position <= actualTargetPosition && card.id !== id) {
                                console.log('Shifting card up:', card.id, 'from', card.position, 'to', card.position - 1);
                                yield tx.card.update({
                                    where: { id: card.id },
                                    data: { position: card.position - 1 }
                                });
                            }
                        }
                    }
                    // Update the current card with the actual position
                    console.log('Updating current card within same list:', id, 'to position:', actualTargetPosition);
                    yield tx.card.update({
                        where: { id },
                        data: Object.assign(Object.assign({}, updateData), { position: actualTargetPosition })
                    });
                    return; // Skip the final update since we already updated in transaction
                }
                else {
                    // Moving to different list
                    console.log('Moving to different list - calculating correct position');
                    // For moving to different list, we need to calculate the actual database position
                    // The targetPosition from frontend is the UI index, not database position
                    // We need to find the correct database position based on existing cards
                    let actualTargetPosition = targetPosition;
                    // Sort cards by position to ensure correct order
                    const sortedTargetList = allCardsInTargetList.sort((a, b) => a.position - b.position);
                    console.log('Sorted target list by position:', sortedTargetList.map(c => ({ id: c.id, position: c.position })));
                    // Find the correct database position based on UI index
                    if (targetPosition === 0) {
                        // Inserting at the beginning, position should be 0
                        actualTargetPosition = 0;
                    }
                    else if (targetPosition >= sortedTargetList.length) {
                        // Inserting at the end, position should be last card's position + 1
                        const lastCard = sortedTargetList[sortedTargetList.length - 1];
                        actualTargetPosition = lastCard ? lastCard.position + 1 : 0;
                    }
                    else {
                        // Inserting in the middle, find the card at this position
                        const cardAtTargetPosition = sortedTargetList[targetPosition];
                        if (cardAtTargetPosition) {
                            actualTargetPosition = cardAtTargetPosition.position;
                        }
                    }
                    console.log('UI target position:', targetPosition, '-> Actual database position:', actualTargetPosition);
                    // Shift cards in target list to make space at the actual position
                    for (const card of allCardsInTargetList) {
                        if (card.position >= actualTargetPosition) {
                            console.log('Shifting target list card:', card.id, 'from', card.position, 'to', card.position + 1);
                            yield tx.card.update({
                                where: { id: card.id },
                                data: { position: card.position + 1 }
                            });
                        }
                    }
                    // Shift cards in source list to fill the gap
                    const sourceListCards = yield client_1.prisma.card.findMany({
                        where: {
                            listId: card.listId,
                            id: { not: id }
                        },
                        orderBy: { position: 'asc' }
                    });
                    console.log('Filling gap in source list, current position:', currentPosition);
                    for (const sourceCard of sourceListCards) {
                        if (sourceCard.position > currentPosition) {
                            console.log('Shifting source list card:', sourceCard.id, 'from', sourceCard.position, 'to', sourceCard.position - 1);
                            yield tx.card.update({
                                where: { id: sourceCard.id },
                                data: { position: sourceCard.position - 1 }
                            });
                        }
                    }
                    // Update the current card with the actual position
                    console.log('Updating current card:', id, 'to actual position:', actualTargetPosition);
                    yield tx.card.update({
                        where: { id },
                        data: Object.assign(Object.assign({}, updateData), { position: actualTargetPosition })
                    });
                    return; // Skip the final update since we already updated in transaction
                }
                // Update the current card
                console.log('Updating current card:', id, 'to position:', targetPosition);
                yield tx.card.update({
                    where: { id },
                    data: Object.assign(Object.assign({}, updateData), { position: targetPosition })
                });
            }));
            // Fetch updated card with relationships
            const updatedCard = yield client_1.prisma.card.findUnique({
                where: { id },
                include: {
                    list: true,
                    creator: {
                        select: { id: true, name: true, email: true }
                    }
                }
            });
            return res.json(updatedCard);
        }
        // For non-position updates, use the regular update logic
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
            const isMember = yield client_1.prisma.boardMember.findUnique({
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
        // Check if user is board member
        const isMember = yield client_1.prisma.boardMember.findUnique({
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
// Upload cover image for card
const uploadCoverImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const uploadedFile = req.file;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!uploadedFile) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Verify card exists and user has access
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
        // Check if user is board member
        const isMember = yield client_1.prisma.boardMember.findUnique({
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
        // Delete old cover image if exists
        if (card.coverImage) {
            const oldCoverPath = path_1.default.join(process.cwd(), 'uploads', 'covers', path_1.default.basename(card.coverImage));
            if (fs_1.default.existsSync(oldCoverPath)) {
                fs_1.default.unlinkSync(oldCoverPath);
            }
        }
        // Update card with new cover image URL
        const coverImageUrl = `/uploads/covers/${uploadedFile.filename}`;
        const updatedCard = yield client_1.prisma.card.update({
            where: { id },
            data: { coverImage: coverImageUrl },
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
                action: 'cover_image_updated',
                details: JSON.stringify({ fileName: uploadedFile.originalname }),
                boardId: card.list.board.id,
                cardId: card.id,
                userId
            }
        });
        res.json({ card: updatedCard });
    }
    catch (error) {
        console.error('Upload cover image error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.uploadCoverImage = uploadCoverImage;
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id: cardId } = req.params;
        const { content } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        console.log('Create comment request:', { cardId, content: content === null || content === void 0 ? void 0 : content.substring(0, 50), userId });
        if (!userId) {
            console.log('No user ID found');
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!content || content.trim().length === 0) {
            console.log('No content provided');
            return res.status(400).json({ error: 'Comment content is required' });
        }
        console.log('Looking for card:', cardId);
        // Check if card exists and user has access
        const card = yield client_1.prisma.card.findUnique({
            where: { id: cardId },
            include: {
                list: {
                    include: {
                        board: {
                            include: {
                                members: {
                                    where: { userId }
                                }
                            }
                        }
                    }
                }
            }
        });
        console.log('Card found:', card ? 'Yes' : 'No');
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        // Check if user is board owner or member
        const isOwner = card.list.board.ownerId === userId;
        const isMember = card.list.board.members.length > 0;
        console.log('User access check:', { isOwner, isMember, userId, ownerId: card.list.board.ownerId });
        if (!isOwner && !isMember) {
            return res.status(403).json({ error: 'Not authorized to comment on this card' });
        }
        console.log('Creating comment...');
        // Create comment
        const comment = yield client_1.prisma.comment.create({
            data: {
                content: content.trim(),
                cardId,
                userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        console.log('Comment created successfully:', comment);
        // Create activity (optional - wrap in try-catch to avoid blocking comment creation)
        try {
            yield client_1.prisma.activity.create({
                data: {
                    action: 'commented',
                    details: JSON.stringify({ commentId: comment.id }),
                    boardId: card.list.board.id,
                    cardId: card.id,
                    userId
                }
            });
            console.log('Activity created successfully');
        }
        catch (activityError) {
            console.error('Failed to create activity (but comment was saved):', activityError);
            // Don't fail the entire request if activity creation fails
        }
        res.status(201).json({ comment });
    }
    catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createComment = createComment;
// Export the upload middleware
exports.coverUploadMiddleware = coverUpload.single('file');
