'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSupport();
    loadVAPIDKey();
    checkSubscriptionStatus();
  }, []);

  const checkSupport = () => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    ) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  };

  const loadVAPIDKey = async () => {
    try {
      const response = await api.get('/push/vapid-key');
      if (response.data.success) {
        setVapidPublicKey(response.data.data.publicKey);
      }
    } catch (error) {
      console.error('Error loading VAPID key:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!isSupported || !vapidPublicKey) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    if (!isSupported || !vapidPublicKey) {
      alert('Push notifications are not supported in this browser');
      return;
    }

    try {
      setLoading(true);

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Notification permission denied');
        setLoading(false);
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      // Send subscription to server
      const subscriptionData: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))
          ),
        },
      };

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to enable push notifications');
        setLoading(false);
        return;
      }

      await api.post('/push/subscribe', { subscription: subscriptionData });
      setIsSubscribed(true);
      alert('Push notifications enabled successfully!');
    } catch (error: any) {
      console.error('Error subscribing to push:', error);
      if (error.response?.status === 401) {
        alert('Please login to enable push notifications');
      } else {
        alert('Failed to enable push notifications. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      setLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from server
        try {
          await api.post('/push/unsubscribe', { endpoint: subscription.endpoint });
        } catch (error) {
          console.error('Error removing subscription from server:', error);
        }

        setIsSubscribed(false);
        alert('Push notifications disabled');
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      alert('Failed to disable push notifications');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!isSupported) {
    return null; // Don't show anything if not supported
  }

  return (
    <div className="flex items-center gap-2">
      {isSubscribed ? (
        <button
          onClick={unsubscribeFromPush}
          disabled={loading}
          className="text-sm text-gray-600 hover:text-gray-800"
          title="غیرفعال کردن اعلان‌های Push"
        >
          🔔 اعلان‌ها فعال است
        </button>
      ) : (
        <button
          onClick={subscribeToPush}
          disabled={loading || !vapidPublicKey}
          className="text-sm text-primary-600 hover:text-primary-700"
          title="فعال کردن اعلان‌های Push"
        >
          {loading ? 'در حال فعال‌سازی...' : '🔕 فعال‌سازی اعلان‌ها'}
        </button>
      )}
    </div>
  );
}

