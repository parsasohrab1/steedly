'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { FaBell, FaCheck, FaTrash } from 'react-icons/fa';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await api.get('/notifications?limit=50');
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این اعلان را حذف کنید؟')) {
      return;
    }
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'order':
        return 'سفارش';
      case 'booking':
        return 'رزرو';
      case 'system':
        return 'سیستم';
      case 'promotion':
        return 'پیشنهاد ویژه';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">اعلان‌ها</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
          >
            <FaCheck />
            همه را خوانده شده علامت بزن
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">اعلانی وجود ندارد</h2>
          <p className="text-gray-600">هنگامی که اعلان جدیدی دریافت کنید، اینجا نمایش داده می‌شود</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition ${
                !notification.is_read ? 'border-r-4 border-primary-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      {getTypeLabel(notification.type)}
                    </span>
                    {!notification.is_read && (
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        خوانده نشده
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{notification.title}</h3>
                  <p className="text-gray-600 mb-4">{notification.message}</p>
                  {notification.link && (
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                    >
                      مشاهده بیشتر →
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                      title="خوانده شده"
                    >
                      <FaCheck />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="حذف"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

