import { useEffect, useState } from 'react';
import { getRealtimeSocket, type NotificationRealtimePayload } from './realtime';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const useTeacherUnreadNotifications = () => {
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return;
      const authUser = JSON.parse(raw);
      const userId = Number(authUser?.id);
      if (!Number.isInteger(userId) || userId <= 0) return;
      const role = String(authUser?.role || '').trim().toLowerCase();
      if (role !== 'teacher') return;
      setTeacherId(userId);
    } catch {
      setTeacherId(null);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    if (!teacherId) {
      setUnreadCount(0);
      return;
    }

    const loadUnread = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/user/${teacherId}/unread`);
        const data = await response.json().catch(() => []);
        if (!response.ok || !Array.isArray(data)) {
          setUnreadCount(0);
          return;
        }
        setUnreadCount(data.length);
      } catch {
        setUnreadCount(0);
      }
    };

    void loadUnread();
    window.addEventListener('teacher-notifications-updated', loadUnread);

    const socket = getRealtimeSocket();
    const subscription = { userId: teacherId };
    const handleNotificationEvent = (payload: NotificationRealtimePayload = {}) => {
      if (Number(payload.userId) !== teacherId) return;
      void loadUnread();
    };

    socket.emit('notification:subscribe', subscription);
    socket.on('notification:created', handleNotificationEvent);
    socket.on('notification:updated', handleNotificationEvent);
    socket.on('notification:deleted', handleNotificationEvent);

    return () => {
      window.removeEventListener('teacher-notifications-updated', loadUnread);
      socket.emit('notification:unsubscribe', subscription);
      socket.off('notification:created', handleNotificationEvent);
      socket.off('notification:updated', handleNotificationEvent);
      socket.off('notification:deleted', handleNotificationEvent);
    };
  }, [teacherId]);

  return unreadCount;
};

