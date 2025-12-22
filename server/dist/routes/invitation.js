"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invitation_1 = require("../controllers/invitation");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
// POST /api/invitation/invite - Send invitation
router.post('/invite', auth_1.authenticate, invitation_1.inviteMember);
// GET /api/invitation/accept/:token - Accept invitation (legacy)
router.get('/accept/:token', invitation_1.acceptInvitation);
// POST /api/invitation/accept-by-id/:id - Accept invitation by ID (new)
router.post('/accept-by-id/:id', auth_1.authenticate, invitation_1.acceptInvitationById);
// GET /api/invitation/pending - Get user's pending invitations
router.get('/pending', auth_1.authenticate, invitation_1.getPendingInvitations);
exports.default = router;
