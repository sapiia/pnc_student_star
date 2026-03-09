import { useEffect, useState } from 'react';
import { getRealtimeSocket, type NotificationRealtimePayload } from './realtime';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const parseDirectMessage = (raw: unknown) => {
  const text = String(raw || '').trim();
  const match = text.match(/^\[DirectMessage\]\s+from=(\d+);\s*to=(\d+);\s*sender_name=(.*?);\s*text=(.*)$/);
  if (!match) return null;
  return {
    fromId: Number(match[1]),
    toId: Number(match[2]),
  };
};

export const useAdminUnreadNotifications = () => {
  const [adminId, setAdminId] = useState<number | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return;
      const authUser = JSON.parse(raw);
      const userId = Number(authUser?.id);
      if (!Number.isInteger(userId) || userId <= 0) return;
      const role = String(authUser?.role || '').trim().toLowerCase();
      if (role !== 'admin') return;
      setAdminId(userId);
    } catch {
      setAdminId(null);
      setUnreadNotificationCount(0);
      setUnreadMessageCount(0);
    }
  }, []);

  useEffect(() => {
    if (!adminId) {
      setUnreadNotificationCount(0);
      setUnreadMessageCount(0);
      return;
    }

    const loadUnread = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/user/${adminId}/unread`);
        const data = await response.json().catch(() => []);
        if (!response.ok || !Array.isArray(data)) {
          setUnreadNotificationCount(0);
          setUnreadMessageCount(0);
          return;
        }

        setUnreadNotificationCount(data.length);
        const directUnread = data.filter((notification: any) => {
          const parsed = parseDirectMessage(notification?.message);
          return parsed && parsed.toId === adminId;
        }).length;
        setUnreadMessageCount(directUnread);
      } catch {
        setUnreadNotificationCount(0);
        setUnreadMessageCount(0);
      }
    };

    void loadUnread();
    window.addEventListener('admin-notifications-updated', loadUnread);

    const socket = getRealtimeSocket();
    const subscription = { userId: adminId };
    const handleNotificationEvent = (payload: NotificationRealtimePayload = {}) => {
      if (Number(payload.userId) !== adminId) return;
      void loadUnread();
    };

    socket.emit('notification:subscribe', subscription);
    socket.on('notification:created', handleNotificationEvent);
    socket.on('notification:updated', handleNotificationEvent);
    socket.on('notification:deleted', handleNotificationEvent);

    return () => {
      window.removeEventListener('admin-notifications-updated', loadUnread);
      socket.emit('notification:unsubscribe', subscription);
      socket.off('notification:created', handleNotificationEvent);
      socket.off('notification:updated', handleNotificationEvent);
      socket.off('notification:deleted', handleNotificationEvent);
    };
  }, [adminId]);

  return { unreadNotificationCount, unreadMessageCount };
};
