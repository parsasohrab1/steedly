import webpush from 'web-push';
import { query } from '../database/connection';

// Initialize web-push with VAPID keys
// These should be set in environment variables
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@steedly.ir';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Save push subscription for a user
export const savePushSubscription = async (
  userId: number,
  subscription: PushSubscription,
  userAgent?: string
) => {
  try {
    const result = await query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (endpoint) 
       DO UPDATE SET 
         user_id = $1,
         p256dh = $3,
         auth = $4,
         user_agent = $5,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        userId,
        subscription.endpoint,
        subscription.keys.p256dh,
        subscription.keys.auth,
        userAgent || null,
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error saving push subscription:', error);
    throw error;
  }
};

// Get all push subscriptions for a user
export const getUserPushSubscriptions = async (userId: number) => {
  try {
    const result = await query(
      'SELECT * FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting user push subscriptions:', error);
    throw error;
  }
};

// Delete push subscription
export const deletePushSubscription = async (endpoint: string) => {
  try {
    await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
  } catch (error) {
    console.error('Error deleting push subscription:', error);
    throw error;
  }
};

// Send push notification to a single subscription
export const sendPushNotification = async (
  subscription: PushSubscription,
  payload: {
    title: string;
    message: string;
    link?: string;
    type?: string;
    icon?: string;
  }
): Promise<boolean> => {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('VAPID keys not configured. Push notifications disabled.');
      return false;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      message: payload.message,
      body: payload.message,
      icon: payload.icon || '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: payload.type || 'notification',
      data: {
        url: payload.link || '/',
        type: payload.type || 'system',
      },
      dir: 'rtl',
      lang: 'fa',
      requireInteraction: false,
    });

    await webpush.sendNotification(subscription, notificationPayload);
    return true;
  } catch (error: any) {
    // If subscription is invalid, delete it
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('Subscription expired or invalid, deleting...');
      try {
        await deletePushSubscription(subscription.endpoint);
      } catch (deleteError) {
        console.error('Error deleting expired subscription:', deleteError);
      }
    } else {
      console.error('Error sending push notification:', error);
    }
    return false;
  }
};

// Send push notification to all user subscriptions
export const sendPushNotificationToUser = async (
  userId: number,
  payload: {
    title: string;
    message: string;
    link?: string;
    type?: string;
    icon?: string;
  }
): Promise<number> => {
  try {
    const subscriptions = await getUserPushSubscriptions(userId);
    let successCount = 0;

    for (const sub of subscriptions) {
      const subscription: PushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      const success = await sendPushNotification(subscription, payload);
      if (success) {
        successCount++;
      }
    }

    return successCount;
  } catch (error) {
    console.error('Error sending push notification to user:', error);
    return 0;
  }
};

// Send push notification to multiple users
export const sendPushNotificationToUsers = async (
  userIds: number[],
  payload: {
    title: string;
    message: string;
    link?: string;
    type?: string;
    icon?: string;
  }
): Promise<number> => {
  let totalSuccess = 0;

  for (const userId of userIds) {
    const count = await sendPushNotificationToUser(userId, payload);
    totalSuccess += count;
  }

  return totalSuccess;
};

// Get VAPID public key (for client-side subscription)
export const getVAPIDPublicKey = (): string | null => {
  return vapidPublicKey || null;
};

