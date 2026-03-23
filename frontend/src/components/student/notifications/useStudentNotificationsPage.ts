import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRealtimeSocket, type NotificationRealtimePayload } from '../../../lib/realtime';
import type {
  NotificationReadFilter,
  NotificationTypeFilter,
  StudentNotificationCard,
  StudentNotificationItem,
} from './types';
import {
  API_BASE_URL,
  dispatchNotificationsUpdated,
  isLegacyFeedbackNotification,
  mapStudentNotification,
} from './utils';

type AuthUser = {
  id?: number | string;
};

const getStoredStudentId = () => {
  try {
    const raw = localStorage.getItem('auth_user');

    if (!raw) {
      return null;
    }

    const authUser = JSON.parse(raw) as AuthUser;
    const resolvedUserId = Number(authUser?.id);

    if (!Number.isInteger(resolvedUserId) || resolvedUserId <= 0) {
      return null;
    }

    return resolvedUserId;
  } catch {
    return null;
  }
};

export function useStudentNotificationsPage() {
  const [studentId, setStudentId] = useState(null as number | null);
  const [notifications, setNotifications] = useState([] as StudentNotificationItem[]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [activeNotificationId, setActiveNotificationId] = useState(
    null as number | null
  );
  const [selectedNotification, setSelectedNotification] =
    useState(null as StudentNotificationItem | null);
  const [filter, setFilter] = useState('all' as NotificationReadFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('any' as NotificationTypeFilter);

  const loadNotifications = useCallback(async () => {
    if (!studentId) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let response = await fetch(`${API_BASE_URL}/notifications/user/${studentId}`);
      let data = await response.json().catch(() => []);

      if (!response.ok) {
        response = await fetch(`${API_BASE_URL}/notifications`);
        data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load notifications.');
        }
      }

      setNotifications(Array.isArray(data) ? data : []);
      dispatchNotificationsUpdated();
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load notifications.'
      );
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    const resolvedStudentId = getStoredStudentId();

    setStudentId(resolvedStudentId);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!studentId) {
      return;
    }

    void loadNotifications();
  }, [loadNotifications, studentId]);

  useEffect(() => {
    if (!studentId) {
      return;
    }

    const socket = getRealtimeSocket();
    const subscription = { userId: studentId };
    const handleNotificationEvent = (payload: NotificationRealtimePayload = {}) => {
      if (Number(payload.userId) !== studentId) {
        return;
      }

      void loadNotifications();
    };

    socket.emit('notification:subscribe', subscription);
    socket.on('notification:created', handleNotificationEvent);
    socket.on('notification:updated', handleNotificationEvent);
    socket.on('notification:deleted', handleNotificationEvent);

    return () => {
      socket.emit('notification:unsubscribe', subscription);
      socket.off('notification:created', handleNotificationEvent);
      socket.off('notification:updated', handleNotificationEvent);
      socket.off('notification:deleted', handleNotificationEvent);
    };
  }, [loadNotifications, studentId]);

  const visibleNotifications = useMemo(
    () => notifications.filter((notification) => !isLegacyFeedbackNotification(notification)),
    [notifications]
  );

  const notificationCards = useMemo(
    () => visibleNotifications.map(mapStudentNotification) as StudentNotificationCard[],
    [visibleNotifications]
  );

  const unreadCount = useMemo(
    () => notificationCards.filter((notification) => !notification.isRead).length,
    [notificationCards]
  );

  const filteredNotifications = useMemo(
    () =>
      notificationCards.filter((notification) => {
        const matchesRead = filter === 'all' ? true : !notification.isRead;
        const matchesSearch = searchQuery.trim()
          ? notification.searchText.includes(searchQuery.trim().toLowerCase())
          : true;
        const matchesType =
          typeFilter === 'any' ? true : notification.type === typeFilter;

        return matchesRead && matchesSearch && matchesType;
      }),
    [filter, notificationCards, searchQuery, typeFilter]
  );

  const markAsRead = useCallback(async (notificationId: number) => {
    setActiveNotificationId(notificationId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to mark notification as read.');
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: 1 }
            : notification
        )
      );
      setSelectedNotification((current) =>
        current && current.id === notificationId
          ? { ...current, is_read: 1 }
          : current
      );
      dispatchNotificationsUpdated();
    } catch (markError) {
      setError(
        markError instanceof Error
          ? markError.message
          : 'Failed to mark notification as read.'
      );
    } finally {
      setActiveNotificationId(null);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!studentId) {
      return;
    }

    setIsMarkingAllRead(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/user/${studentId}/read-all`, {
        method: 'PUT',
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to mark all notifications as read.');
      }

      setNotifications((current) =>
        current.map((notification) => ({ ...notification, is_read: 1 }))
      );
      setSelectedNotification((current) =>
        current ? { ...current, is_read: 1 } : current
      );
      dispatchNotificationsUpdated();
    } catch (markError) {
      setError(
        markError instanceof Error
          ? markError.message
          : 'Failed to mark all notifications as read.'
      );
    } finally {
      setIsMarkingAllRead(false);
    }
  }, [studentId]);

  const deleteNotification = useCallback(async (notificationId: number) => {
    setActiveNotificationId(notificationId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete notification.');
      }

      setNotifications((current) =>
        current.filter((notification) => notification.id !== notificationId)
      );
      setSelectedNotification((current) =>
        current?.id === notificationId ? null : current
      );
      dispatchNotificationsUpdated();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete notification.'
      );
    } finally {
      setActiveNotificationId(null);
    }
  }, []);

  return {
    activeNotificationId,
    deleteNotification,
    error,
    filter,
    filteredNotifications,
    isLoading,
    isMarkingAllRead,
    markAllRead,
    markAsRead,
    refresh: loadNotifications,
    searchQuery,
    selectedNotification,
    setFilter,
    setSearchQuery,
    setSelectedNotification,
    setTypeFilter,
    typeFilter,
    unreadCount,
  };
}
