import { useState, useEffect } from 'react';
import { DEFAULT_AVATAR } from '../lib/api';
import { getRealtimeSocket, type NotificationRealtimePayload } from '../lib/realtime';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export function useSidebarData() {
  const [profileName, setProfileName] = useState('Student');
  const [studentId, setStudentId] = useState<string>('');
  const [authUserId, setAuthUserId] = useState<number | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState(DEFAULT_AVATAR);

  // Load profile identity
  useEffect(() => {
    const loadProfileIdentity = async () => {
      try {
        const raw = localStorage.getItem('auth_user');
        if (!raw) return;
        const authUser = JSON.parse(raw);
        const userId = Number(authUser?.id);
        if (!Number.isInteger(userId) || userId <= 0) return;
        setAuthUserId(userId);

        if (authUser?.name) setProfileName(String(authUser.name));
        if (authUser?.student_id) setStudentId(String(authUser.student_id));
        if (authUser?.profile_image) {
          setProfilePhoto(String(authUser.profile_image));
        } else {
          const savedPhoto = localStorage.getItem(`profile_photo_${userId}`);
          if (savedPhoto) setProfilePhoto(savedPhoto);
        }

        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        const data = await response.json();
        if (!response.ok) return;

        setProfileName(
          String(data?.name || '').trim() ||
          [data?.first_name, data?.last_name].filter(Boolean).join(' ').trim() ||
          String(authUser?.name || 'Student')
        );
        setStudentId(String(data?.student_id || data?.resolved_student_id || authUser?.student_id || '').trim());
        const resolvedPhoto = String(data?.profile_image || authUser?.profile_image || '').trim();
        if (resolvedPhoto) setProfilePhoto(resolvedPhoto);
      } catch { /* silent fallback */ }
    };
    loadProfileIdentity();
  }, []);

  // Load notifications
  useEffect(() => {
    if (!authUserId) {
      setUnreadNotificationCount(0);
      setUnreadMessageCount(0);
      return;
    }

    const parseDirectMessage = (raw: unknown) => {
      const text = String(raw || '').trim();
      const match = text.match(/^\[DirectMessage\]\s+from=(\d+);\s*to=(\d+);\s*sender_name=(.*?);\s*text=(.*)$/);
      return match ? { fromId: Number(match[1]), toId: Number(match[2]) } : null;
    };

    const loadUnreadNotifications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/user/${authUserId}/unread`);
        const data = await response.json().catch(() => []);
        if (!response.ok || !Array.isArray(data)) {
          setUnreadNotificationCount(0);
          setUnreadMessageCount(0);
          return;
        }
        setUnreadNotificationCount(data.length);
        const directUnread = data.filter((notification: any) => {
          const parsed = parseDirectMessage(notification?.message);
          return parsed && parsed.toId === authUserId;
        }).length;
        setUnreadMessageCount(directUnread);
      } catch {
        setUnreadNotificationCount(0);
        setUnreadMessageCount(0);
      }
    };

    loadUnreadNotifications();
    window.addEventListener('student-notifications-updated', loadUnreadNotifications);
    const socket = getRealtimeSocket();
    const subscription = { userId: authUserId };
    const handleNotificationEvent = (payload: NotificationRealtimePayload = {}) => {
      if (Number(payload.userId) !== authUserId) return;
      void loadUnreadNotifications();
    };
    socket.emit('notification:subscribe', subscription);
    socket.on('notification:created', handleNotificationEvent);
    socket.on('notification:updated', handleNotificationEvent);
    socket.on('notification:deleted', handleNotificationEvent);

    return () => {
      window.removeEventListener('student-notifications-updated', loadUnreadNotifications);
      socket.emit('notification:unsubscribe', subscription);
      socket.off('notification:created', handleNotificationEvent);
      socket.off('notification:updated', handleNotificationEvent);
      socket.off('notification:deleted', handleNotificationEvent);
    };
  }, [authUserId]);

  // Refresh photo listener
  useEffect(() => {
    const refreshPhoto = () => {
      try {
        const raw = localStorage.getItem('auth_user');
        if (!raw) return;
        const authUser = JSON.parse(raw);
        const userId = Number(authUser?.id);
        if (!Number.isInteger(userId) || userId <= 0) return;
        if (authUser?.profile_image) {
          setProfilePhoto(String(authUser.profile_image));
        } else {
          const savedPhoto = localStorage.getItem(`profile_photo_${userId}`);
          if (savedPhoto) setProfilePhoto(savedPhoto);
        }
      } catch { /* ignore */ }
    };

    const loadProfileIdentity = async () => {
      try {
        const raw = localStorage.getItem('auth_user');
        if (!raw) return;
        const authUser = JSON.parse(raw);
        const userId = Number(authUser?.id);
        if (!Number.isInteger(userId) || userId <= 0) return;

        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        const data = await response.json();
        if (!response.ok) return;

        setProfileName(
          String(data?.name || '').trim() ||
          [data?.first_name, data?.last_name].filter(Boolean).join(' ').trim() ||
          String(authUser?.name || 'Student')
        );
        setStudentId(String(data?.student_id || data?.resolved_student_id || authUser?.student_id || '').trim());
        const resolvedPhoto = String(data?.profile_image || authUser?.profile_image || '').trim();
        if (resolvedPhoto) setProfilePhoto(resolvedPhoto);
      } catch { /* silent fallback */ }
    };

    window.addEventListener('profile-photo-updated', refreshPhoto);
    window.addEventListener('profile-updated', loadProfileIdentity);

    return () => {
      window.removeEventListener('profile-photo-updated', refreshPhoto);
      window.removeEventListener('profile-updated', loadProfileIdentity);
    };
  }, []);

  return { profileName, studentId, authUserId, unreadNotificationCount, unreadMessageCount, profilePhoto };
}

