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
exports.getPendingInvitations = exports.acceptInvitationById = exports.acceptInvitation = exports.inviteMember = void 0;
const client_1 = require("../prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
// Email transporter configuration (you'll need to set up actual email service)
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your Gmail app password
    },
});
const inviteMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { email, boardId } = req.body;
        const inviterId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!email || !boardId || !inviterId) {
            return res.status(400).json({
                success: false,
                message: 'Email, board ID, and inviter ID are required',
            });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
            });
        }
        // Check if board exists
        const board = yield client_1.prisma.board.findUnique({
            where: { id: boardId },
            include: {
                members: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!board) {
            return res.status(404).json({
                success: false,
                message: 'Board not found',
            });
        }
        // Check if inviter is a board member
        const isInviterMember = board.members.some((member) => member.userId === inviterId);
        if (!isInviterMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this board',
            });
        }
        // Check if user is already a member
        const existingMember = board.members.some((member) => member.user.email === email);
        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: 'User is already a member of this board',
            });
        }
        // Check if there's already a pending invitation
        // @ts-ignore - Prisma client needs regeneration
        const existingInvitation = yield client_1.prisma.invitation.findFirst({
            where: {
                email: email,
                boardId: boardId,
                status: 'PENDING',
            },
        });
        if (existingInvitation) {
            return res.status(400).json({
                success: false,
                message: 'Invitation already sent to this email',
            });
        }
        // Create invitation token
        const invitationToken = jsonwebtoken_1.default.sign({
            email,
            boardId,
            inviterId,
            type: 'board_invitation'
        }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' } // Token expires in 7 days
        );
        // Create invitation record
        // @ts-ignore - Prisma client needs regeneration
        const invitation = yield client_1.prisma.invitation.create({
            data: {
                email: email,
                token: invitationToken,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                boardId: boardId,
                inviterId: inviterId,
            },
        });
        // Note: Email sending removed for in-app notification system
        // User will see invitation in their dashboard when they login
        res.status(200).json({
            success: true,
            message: 'Invitation sent successfully',
            data: {
                email,
                boardName: board.title,
            },
        });
    }
    catch (error) {
        console.error('Invite member error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
exports.inviteMember = inviteMember;
const acceptInvitation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Invitation token is required',
            });
        }
        // Verify and decode the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const { email, boardId, inviterId, type } = decoded;
        if (type !== 'board_invitation') {
            return res.status(400).json({
                success: false,
                message: 'Invalid invitation token',
            });
        }
        // Check if board exists
        const board = yield client_1.prisma.board.findUnique({
            where: { id: boardId },
        });
        if (!board) {
            return res.status(404).json({
                success: false,
                message: 'Board not found',
            });
        }
        // Find or create the user
        let user = yield client_1.prisma.user.findFirst({
            where: { email },
        });
        if (!user) {
            // Create a new user with the invited email and a temporary password
            const tempPassword = Math.random().toString(36).slice(-8);
            user = yield client_1.prisma.user.create({
                data: {
                    email,
                    name: email.split('@')[0], // Use email prefix as default name
                    password: tempPassword, // This should be changed on first login
                },
            });
        }
        // Check if user is already a member
        const existingMember = yield client_1.prisma.boardMember.findFirst({
            where: {
                userId: user.id,
                boardId: boardId,
            },
        });
        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this board',
            });
        }
        // Add user to board
        yield client_1.prisma.boardMember.create({
            data: {
                userId: user.id,
                boardId: boardId,
            },
        });
        // Update invitation status
        // @ts-ignore - Prisma client needs regeneration
        yield client_1.prisma.invitation.updateMany({
            where: {
                email: email,
                boardId: boardId,
                status: 'PENDING',
            },
            data: {
                status: 'ACCEPTED',
            },
        });
        res.status(200).json({
            success: true,
            message: 'Invitation accepted successfully',
            data: {
                board: {
                    id: board.id,
                    title: board.title,
                    description: board.description,
                },
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
        });
    }
    catch (error) {
        console.error('Accept invitation error:', error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired invitation token',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
exports.acceptInvitation = acceptInvitation;
const acceptInvitationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!id || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Invitation ID and user ID are required',
            });
        }
        // Find the invitation
        // @ts-ignore - Prisma client needs regeneration
        const invitation = yield client_1.prisma.invitation.findUnique({
            where: { id: id },
            include: {
                board: true,
            },
        });
        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found',
            });
        }
        // Verify the invitation belongs to the current user
        const user = yield client_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || invitation.email !== user.email) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to accept this invitation',
            });
        }
        // Check if invitation is still pending
        if (invitation.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Invitation is no longer valid',
            });
        }
        // Check if user is already a member
        const existingMember = yield client_1.prisma.boardMember.findFirst({
            where: {
                userId: userId,
                boardId: invitation.boardId,
            },
        });
        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this board',
            });
        }
        // Add user to board
        yield client_1.prisma.boardMember.create({
            data: {
                userId: userId,
                boardId: invitation.boardId,
            },
        });
        // Update invitation status
        // @ts-ignore - Prisma client needs regeneration
        yield client_1.prisma.invitation.update({
            where: { id: id },
            data: {
                status: 'ACCEPTED',
            },
        });
        res.status(200).json({
            success: true,
            message: 'Invitation accepted successfully',
            data: {
                invitationId: id,
                board: {
                    id: invitation.board.id,
                    title: invitation.board.title,
                    description: invitation.board.description,
                },
            },
        });
    }
    catch (error) {
        console.error('Accept invitation by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
exports.acceptInvitationById = acceptInvitationById;
const getPendingInvitations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Get user's email to find invitations
        const user = yield client_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        // Find pending invitations for this user's email
        // @ts-ignore - Prisma client needs regeneration
        const invitations = yield client_1.prisma.invitation.findMany({
            where: {
                email: user.email,
                status: 'PENDING',
            },
            include: {
                board: {
                    select: {
                        title: true,
                    },
                },
                inviter: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        res.status(200).json({
            success: true,
            data: invitations,
        });
    }
    catch (error) {
        console.error('Get pending invitations error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
exports.getPendingInvitations = getPendingInvitations;
