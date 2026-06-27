"use client";

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'schedule' | 'result' | 'document' | 'system';
  is_read: boolean;
  sent_at: string;
  read_at: string | null;
  related_registration_id: number | null;
}

interface NotificationBellProps {
  className?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}

// Notification Bell Component
export function NotificationBell({ className }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?limit=20');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);

    try {
      await Promise.all(unreadIds.map((id) => markAsRead(id)));
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      schedule: '📅',
      result: '🎓',
      document: '📄',
      system: '🔔',
    };
    return icons[type] || '🔔';
  };

  return (
    <div className={cn('relative', className)}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">Notifikasi</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Tandai semua dibaca'}
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">📭</div>
                  <p>Tidak ada notifikasi</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-gray-50 text-center">
              <a
                href="/notifications"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Lihat semua notifikasi →
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Notification Item Component
function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      schedule: '📅',
      result: '🎓',
      document: '📄',
      system: '🔔',
    };
    return icons[type] || '🔔';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div
      onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
      className={cn(
        'p-4 border-b last:border-b-0 cursor-pointer transition-colors',
        notification.is_read
          ? 'bg-white hover:bg-gray-50'
          : 'bg-blue-50 hover:bg-blue-100'
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0">
          {getTypeIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              'font-semibold text-sm',
              notification.is_read ? 'text-gray-700' : 'text-gray-900'
            )}>
              {notification.title}
            </h4>
            {!notification.is_read && (
              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {formatTime(notification.sent_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Full Notifications Page Component
interface NotificationListProps {
  className?: string;
}

export function NotificationList({ className }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications?limit=100');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    await Promise.all(unreadIds.map((id) => markAsRead(id)));
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <span className="inline-block animate-spin text-3xl text-blue-600">⟳</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifikasi</h2>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Tandai semua dibaca
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-4 py-2 font-medium border-b-2 transition-colors',
            filter === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
        >
          Semua
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            'px-4 py-2 font-medium border-b-2 transition-colors',
            filter === 'unread'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
        >
          Belum Dibaca {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg">
              {filter === 'unread' ? 'Tidak ada notifikasi yang belum dibaca' : 'Tidak ada notifikasi'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'p-4 rounded-xl border shadow-sm transition-all',
                notification.is_read
                  ? 'bg-white border-gray-200'
                  : 'bg-blue-50 border-blue-200'
              )}
            >
              <div className="flex gap-4">
                <div className="text-3xl">
                  {notification.type === 'schedule' && '📅'}
                  {notification.type === 'result' && '🎓'}
                  {notification.type === 'document' && '📄'}
                  {notification.type === 'system' && '🔔'}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className={cn(
                      'font-semibold',
                      notification.is_read ? 'text-gray-700' : 'text-gray-900'
                    )}>
                      {notification.title}
                    </h3>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Tandai dibaca
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationBell;