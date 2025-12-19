import express from 'express';
import { inviteMember, acceptInvitation, acceptInvitationById, getPendingInvitations } from '../controllers/invitation';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// POST /api/invitation/invite - Send invitation
router.post('/invite', authenticate, inviteMember);

// GET /api/invitation/accept/:token - Accept invitation (legacy)
router.get('/accept/:token', acceptInvitation);

// POST /api/invitation/accept-by-id/:id - Accept invitation by ID (new)
router.post('/accept-by-id/:id', authenticate, acceptInvitationById);

// GET /api/invitation/pending - Get user's pending invitations
router.get('/pending', authenticate, getPendingInvitations);

export default router;
