import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification
} from '../services/notificationService';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user notifications
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const notifications = await getUserNotifications(userId, limit);
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
});

// Get unread count
router.get('/unread-count', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const count = await getUnreadCount(userId);
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    next(error);
  }
});

// Mark as read
router.put('/:id/read', async (req: AuthRequest, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user!.id;
    await markAsRead(notificationId, userId);
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// Mark all as read
router.put('/read-all', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    await markAllAsRead(userId);
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// Delete notification
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user!.id;
    await deleteNotification(notificationId, userId);
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

