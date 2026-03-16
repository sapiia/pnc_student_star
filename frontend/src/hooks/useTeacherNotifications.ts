import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { getRealtimeSocket, type NotificationRealtimePayload } from '../lib/realtime';
import { API_BASE_URL } from '../lib/teacher/utils';
import type { NotificationRecord } from '../lib/teacher/types';

type UseTeacherNotificationsOptions = {
  enabled?: boolean;
};

type UseTeacherNotificationsResult = {
  notifications: NotificationRecord[];
  unreadCount: number;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
  setNotifications: Dispatch<SetStateAction<NotificationRecord[]>>;
};

export function useTeacherNotifications(
  teacherId: number | null,
  options: UseTeacherNotificationsOptions = {},
): UseTeacherNotificationsResult {
  const { enabled = true } = options;
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    if (!teacherId) {
      setNotifications([]);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/user/${teacherId}`);
      const data = await response.json().catch(() => []);
      if (!response.ok) throw new Error(data?.error || 'Failed to load notifications.');
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications.');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    if (!enabled) return;
    void loadNotifications();
  }, [enabled, loadNotifications]);

  useEffect(() => {
    if (!enabled || !teacherId) return;
    const socket = getRealtimeSocket();
    const subscription = { userId: teacherId };
    const handleNotificationEvent = (payload: NotificationRealtimePayload = {}) => {
      if (Number(payload.userId) !== teacherId) return;
      void loadNotifications();
    };

    socket.emit('notification:subscribe', subscription);
    socket.on('notification:created', handleNotificationEvent);
    socket.on('notification:updated', handleNotificationEvent);
    socket.on('notification:deleted', handleNotificationEvent);
    socket.on('notification:read', handleNotificationEvent);

    return () => {
      socket.emit('notification:unsubscribe', subscription);
      socket.off('notification:created', handleNotificationEvent);
      socket.off('notification:updated', handleNotificationEvent);
      socket.off('notification:deleted', handleNotificationEvent);
      socket.off('notification:read', handleNotificationEvent);
    };
  }, [enabled, loadNotifications, teacherId]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => Number(n.is_read) !== 1).length,
    [notifications],
  );

  return { notifications, unreadCount, isLoading, error, reload: loadNotifications, setNotifications };
}
