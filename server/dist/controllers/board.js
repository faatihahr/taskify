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
exports.createBoard = createBoard;
exports.getUserBoards = getUserBoards;
exports.getBoardById = getBoardById;
exports.updateBoard = updateBoard;
exports.deleteBoard = deleteBoard;
const client_1 = require("../prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function createBoard(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Creating board with req.body:', req.body);
            console.log('User:', req.user);
            console.log('File:', req.file);
            const { title, description, background } = req.body;
            const userId = req.user.id; // From auth middleware
            // Handle uploaded background image
            let backgroundPath = background;
            if (req.file) {
                backgroundPath = `/uploads/${req.file.filename}`;
            }
            // Ensure uploads directory exists
            const uploadsDir = path_1.default.join(__dirname, "..", "uploads");
            if (!fs_1.default.existsSync(uploadsDir)) {
                fs_1.default.mkdirSync(uploadsDir, { recursive: true });
            }
            const board = yield client_1.prisma.board.create({
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
            yield client_1.prisma.activity.create({
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
        }
        catch (error) {
            // Clean up uploaded file if board creation fails
            if (req.file) {
                const filePath = path_1.default.join(__dirname, "..", "uploads", req.file.filename);
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            throw error;
        }
    });
}
function getUserBoards(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.user.id;
            const boards = yield client_1.prisma.board.findMany({
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
        }
        catch (error) {
            throw error;
        }
    });
}
function getBoardById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            // Check if user has access
            const boardMember = yield client_1.prisma.boardMember.findFirst({
                where: {
                    boardId: id,
                    userId
                }
            });
            if (!boardMember) {
                const board = yield client_1.prisma.board.findUnique({
                    where: { id }
                });
                if (!board || board.ownerId !== userId) {
                    const error = new Error('Board not found or access denied');
                    error.status = 404;
                    throw error;
                }
            }
            const board = yield client_1.prisma.board.findUnique({
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
                        include: {
                            cards: {
                                orderBy: {
                                    position: 'asc'
                                },
                                include: {
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
                error.status = 404;
                throw error;
            }
            res.json({
                message: 'Board retrieved successfully',
                board
            });
        }
        catch (error) {
            throw error;
        }
    });
}
function updateBoard(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { title, description, background } = req.body;
            const userId = req.user.id;
            console.log('Updating board:', id, 'User:', userId);
            // Check if user has access (is owner or member)
            const member = yield client_1.prisma.boardMember.findFirst({
                where: {
                    boardId: id,
                    userId
                }
            });
            const board = yield client_1.prisma.board.findUnique({
                where: { id }
            });
            console.log('Member found:', member);
            console.log('Board owner:', board === null || board === void 0 ? void 0 : board.ownerId);
            if (!board) {
                const error = new Error('Board not found');
                error.status = 404;
                throw error;
            }
            // Allow if user is a member of the board OR is the owner
            const hasAccess = member || board.ownerId === userId;
            if (!hasAccess) {
                console.log('Authorization failed - no access');
                const error = new Error('Not authorized to update board');
                error.status = 403;
                throw error;
            }
            // Handle uploaded background image
            let backgroundPath = background;
            let oldBackgroundImage; // For cleanup
            if (req.file) {
                backgroundPath = `/uploads/${req.file.filename}`;
            }
            // Get current board background for cleanup
            const currentBoard = yield client_1.prisma.board.findUnique({
                where: { id },
                select: { background: true }
            });
            if ((currentBoard === null || currentBoard === void 0 ? void 0 : currentBoard.background) && currentBoard.background.startsWith('/uploads/')) {
                oldBackgroundImage = path_1.default.join(__dirname, "..", currentBoard.background);
            }
            // Filter out empty strings from update data
            const updateData = {};
            if (title !== '' && title !== undefined)
                updateData.title = title;
            if (description !== '' && description !== undefined)
                updateData.description = description;
            if (backgroundPath !== '' && backgroundPath !== undefined)
                updateData.background = backgroundPath;
            if (Object.keys(updateData).length === 0) {
                const error = new Error('At least one field must be provided for update');
                error.status = 400;
                throw error;
            }
            const updatedBoard = yield client_1.prisma.board.update({
                where: { id },
                data: updateData
            });
            // Remove old image file if new image uploaded and old was uploaded
            if (req.file && oldBackgroundImage && fs_1.default.existsSync(oldBackgroundImage)) {
                fs_1.default.unlinkSync(oldBackgroundImage);
            }
            // Log activity
            yield client_1.prisma.activity.create({
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
        }
        catch (error) {
            // Clean up uploaded file if update fails
            if (req.file) {
                const filePath = path_1.default.join(__dirname, "..", "uploads", req.file.filename);
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            throw error;
        }
    });
}
function deleteBoard(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const board = yield client_1.prisma.board.findUnique({
                where: { id }
            });
            if (!board) {
                const error = new Error('Board not found');
                error.status = 404;
                throw error;
            }
            if (board.ownerId !== userId) {
                const error = new Error('Only board owner can delete the board');
                error.status = 403;
                throw error;
            }
            yield client_1.prisma.board.delete({
                where: { id }
            });
            res.json({
                message: 'Board deleted successfully'
            });
        }
        catch (error) {
            throw error;
        }
    });
}
