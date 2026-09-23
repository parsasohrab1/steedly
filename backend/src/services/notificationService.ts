import { query } from '../database/connection';
import { getCache, setCache, deleteCache, deleteCacheByPattern } from '../database/redis';
import { sendPushNotificationToUser } from './pushService';

export interface Notification {
  id: number;
  user_id: number;
  type: 'order' | 'booking' | 'system' | 'promotion';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

// Drop every cached list (one key per limit) and the unread counter for a user
const invalidateUserCache = async (userId: number) => {
  await deleteCacheByPattern(`notifications:${userId}:*`);
  await deleteCache(`notifications:unread:${userId}`);
};

// Create notification
export const createNotification = async (
  userId: number,
  type: Notification['type'],
  title: string,
  message: string,
  link?: string
) => {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, type, title, message, link || null]
    );

    // Invalidate user notifications cache
    await invalidateUserCache(userId);

    // Send push notification if enabled
    try {
      if (process.env.PUSH_NOTIFICATIONS_ENABLED === 'true') {
        await sendPushNotificationToUser(userId, {
          title,
          message,
          link: link || undefined,
          type,
        });
      }
    } catch (pushError) {
      console.error('Error sending push notification:', pushError);
      // Don't fail notification creation if push fails
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get user notifications
export const getUserNotifications = async (userId: number, limit: number = 20) => {
  try {
    const cacheKey = `notifications:${userId}:${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    const notifications = result.rows;
    await setCache(cacheKey, JSON.stringify(notifications), 300); // Cache for 5 minutes

    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId: number, userId: number) => {
  try {
    await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    // Invalidate cache
    await invalidateUserCache(userId);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all as read
export const markAllAsRead = async (userId: number) => {
  try {
    await query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    // Invalidate cache
    await invalidateUserCache(userId);
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

// Get unread count
export const getUnreadCount = async (userId: number) => {
  try {
    const cacheKey = `notifications:unread:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return parseInt(cached);
    }

    const result = await query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    const count = parseInt(result.rows[0].count);
    await setCache(cacheKey, count.toString(), 60); // Cache for 1 minute

    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId: number, userId: number) => {
  try {
    await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    // Invalidate cache
    await invalidateUserCache(userId);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

