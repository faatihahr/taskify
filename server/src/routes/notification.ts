import express from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount
} from '../controllers/notification';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all notifications for the authenticated user
router.get('/', getUserNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadNotificationCount);

// Mark a notification as read
router.patch('/:notificationId/read', markNotificationAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllNotificationsAsRead);

// Delete a notification
router.delete('/:notificationId', deleteNotification);

export default router;
