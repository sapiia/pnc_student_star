import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  MessageSquare,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import { cn } from '../../lib/utils';
import { getRealtimeSocket, type NotificationRealtimePayload } from '../../lib/realtime';

type NotificationType = 'message' | 'system';

type ApiUser = {
  id: number;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  role?: string | null;
  profile_image?: string | null;
};

type NotificationRecord = {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at?: string;
};

type DirectMessage = {
  fromId: number;
  toId: number;
  senderName: string;
  text: string;
};

type NotificationViewModel = {
  id: number;
  type: NotificationType;
  senderId?: number;
  senderName: string;
  senderRole: 'Student' | 'Admin' | 'Teacher' | 'System';
  senderAvatar: string;
  content: string;
  createdAt?: string;
  isRead: boolean;
  raw: NotificationRecord;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');
const FALLBACK_AVATAR = 'http://localhost:3001/uploads/logo/star_gmail_logo.jpg';

const resolveAvatarUrl = (value: string | null | undefined, fallback: string) => {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
  const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`;
  return `${API_ORIGIN}${normalizedPath}`;
};

const toDisplayName = (user: ApiUser) => {
  const fallback = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return String(user.name || '').trim() || fallback || String(user.email || `User ${user.id}`).trim();
};

const toSenderRole = (role: string | null | undefined): NotificationViewModel['senderRole'] => {
  const normalized = String(role || '').trim().toLowerCase();
  if (normalized === 'admin') return 'Admin';
  if (normalized === 'teacher') return 'Teacher';
  if (normalized === 'student') return 'Student';
  return 'System';
};

const formatDateTime = (value?: string) => {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const parseDirectMessage = (raw: string): DirectMessage | null => {
  const text = String(raw || '').trim();
  const match = text.match(/^\[DirectMessage\]\s+from=(\d+);\s*to=(\d+);\s*sender_name=(.*?);\s*text=(.*)$/);
  if (!match) return null;
  return {
    fromId: Number(match[1]),
    toId: Number(match[2]),
    senderName: String(match[3] || 'User').trim() || 'User',
    text: String(match[4] || '').trim(),
  };
};

const inferType = (message: string): NotificationType => {
  const text = String(message || '').toLowerCase();
  if (text.startsWith('[directmessage]')) return 'message';
  return 'system';
};

export default function TeacherNotificationsPage() {
  const navigate = useNavigate();
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<NotificationViewModel[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) {
        setTeacherId(null);
        setIsLoading(false);
        return;
      }

      const authUser = JSON.parse(raw);
      const resolvedUserId = Number(authUser?.id);
      const role = String(authUser?.role || '').trim().toLowerCase();
      if (!Number.isInteger(resolvedUserId) || resolvedUserId <= 0 || role !== 'teacher') {
        setTeacherId(null);
        setIsLoading(false);
        return;
      }
      setTeacherId(resolvedUserId);
    } catch {
      setTeacherId(null);
      setIsLoading(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!teacherId) return;
    setIsLoading(true);
    setError('');

    try {
      const [notificationsResponse, usersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/notifications/user/${teacherId}`),
        fetch(`${API_BASE_URL}/users`),
      ]);

      const notificationsData = await notificationsResponse.json().catch(() => []);
      const usersData = await usersResponse.json().catch(() => []);

      if (!notificationsResponse.ok) {
        throw new Error((notificationsData as any)?.error || 'Failed to load notifications.');
      }

      const users = Array.isArray(usersData) ? (usersData as ApiUser[]) : [];
      const usersById = new Map<number, ApiUser>(users.map((user) => [Number(user.id), user]));

      const rawNotifications = Array.isArray(notificationsData)
        ? (notificationsData as NotificationRecord[])
        : [];

      const viewModels = rawNotifications.map((record) => {
        const type = inferType(record.message);
        const parsedDirect = type === 'message' ? parseDirectMessage(record.message) : null;
        const senderId = parsedDirect?.fromId;
        const senderUser = senderId ? usersById.get(Number(senderId)) : undefined;
        const senderName = String(
          parsedDirect?.senderName || (senderUser ? toDisplayName(senderUser) : 'System'),
        ).trim() || 'System';
        const senderRole = senderUser ? toSenderRole(senderUser.role) : 'System';
        const senderAvatar = resolveAvatarUrl(senderUser?.profile_image, FALLBACK_AVATAR);
        const content = type === 'message'
          ? (parsedDirect
              ? `sent you a message: "${String(parsedDirect.text || '').trim()}"`
              : String(record.message || '').trim())
          : String(record.message || '').trim();

        return {
          id: Number(record.id),
          type,
          senderId: senderId ? Number(senderId) : undefined,
          senderName,
          senderRole,
          senderAvatar,
          content,
          createdAt: record.created_at,
          isRead: Number(record.is_read) === 1,
          raw: record,
        } satisfies NotificationViewModel;
      });

      setNotifications(viewModels);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load notifications.');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!teacherId) return;
    const socket = getRealtimeSocket();
    const subscription = { userId: teacherId };
    const handler = (payload: NotificationRealtimePayload = {}) => {
      if (Number(payload.userId) !== teacherId) return;
      void loadNotifications();
    };

    socket.emit('notification:subscribe', subscription);
    socket.on('notification:created', handler);
    socket.on('notification:updated', handler);
    socket.on('notification:deleted', handler);

    return () => {
      socket.emit('notification:unsubscribe', subscription);
      socket.off('notification:created', handler);
      socket.off('notification:updated', handler);
      socket.off('notification:deleted', handler);
    };
  }, [loadNotifications, teacherId]);

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return notifications.filter((notification) => {
      if (filter === 'unread' && notification.isRead) return false;
      if (!normalizedQuery) return true;
      return (
        notification.senderName.toLowerCase().includes(normalizedQuery) ||
        notification.content.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [filter, notifications, searchQuery]);

  const unreadExists = useMemo(
    () => notifications.some((notification) => !notification.isRead),
    [notifications],
  );

  const markAsRead = useCallback(
    async (id: number) => {
      if (!teacherId) return;
      setActiveId(id);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error((data as any)?.error || 'Failed to mark notification as read.');
        window.dispatchEvent(new CustomEvent('teacher-notifications-updated'));
        void loadNotifications();
      } catch (updateError) {
        setError(updateError instanceof Error ? updateError.message : 'Failed to mark notification as read.');
      } finally {
        setActiveId(null);
      }
    },
    [loadNotifications, teacherId],
  );

  const deleteNotification = useCallback(
    async (id: number) => {
      if (!teacherId) return;
      setActiveId(id);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/${id}`, { method: 'DELETE' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error((data as any)?.error || 'Failed to delete notification.');
        window.dispatchEvent(new CustomEvent('teacher-notifications-updated'));
        void loadNotifications();
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete notification.');
      } finally {
        setActiveId(null);
      }
    },
    [loadNotifications, teacherId],
  );

  const markAllAsRead = useCallback(async () => {
    if (!teacherId) return;
    setActiveId(-1);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/user/${teacherId}/read-all`, { method: 'PUT' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error((data as any)?.error || 'Failed to mark all notifications as read.');
      window.dispatchEvent(new CustomEvent('teacher-notifications-updated'));
      void loadNotifications();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to mark all notifications as read.');
    } finally {
      setActiveId(null);
    }
  }, [loadNotifications, teacherId]);

  const handleView = useCallback(
    async (notification: NotificationViewModel) => {
      const parsed = parseDirectMessage(notification.raw.message);
      if (!teacherId || !parsed) return;

      const contactId = parsed.fromId === teacherId ? parsed.toId : parsed.fromId;
      if (!Number.isInteger(contactId) || contactId <= 0) return;

      await markAsRead(notification.id);
      navigate('/teacher/messages', { state: { selectedContactId: contactId, isMobileChatOpen: true } });
    },
    [markAsRead, navigate, teacherId],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TeacherMobileNav />

        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={() => navigate('/teacher/dashboard')} className="hover:text-primary">Home</button>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-slate-900">Notifications</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              {unreadExists ? (
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
              ) : null}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[800px] mx-auto">
            <header className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
                <p className="text-slate-500 text-sm mt-1 font-medium">
                  {unreadExists ? 'You have new updates.' : "You're all caught up."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFilter('all')}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
                    filter === 'all'
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-white text-slate-500 hover:bg-slate-100',
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
                    filter === 'unread'
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-white text-slate-500 hover:bg-slate-100',
                  )}
                >
                  Unread
                </button>
              </div>
              <button
                onClick={markAllAsRead}
                disabled={activeId === -1 || !unreadExists}
                className="px-4 py-2 bg-white text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-60"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            </header>

            <div className="space-y-4">
              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                  {error}
                </div>
              ) : null}

              {isLoading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm font-bold text-slate-500">
                  Loading notifications...
                </div>
              ) : filteredNotifications.length ? (
                <AnimatePresence>
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={cn(
                        'bg-white p-4 rounded-2xl border transition-all group relative',
                        notification.isRead
                          ? 'border-slate-200 opacity-75'
                          : 'border-primary/20 shadow-sm ring-1 ring-primary/5',
                      )}
                    >
                      <div className="flex gap-4">
                        <div className="relative shrink-0">
                          <div className="size-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100">
                            <img
                              src={notification.senderAvatar || FALLBACK_AVATAR}
                              alt={notification.senderName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div
                            className={cn(
                              'absolute -bottom-1 -right-1 size-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm',
                              notification.type === 'message' ? 'bg-primary text-white' : 'bg-slate-500 text-white',
                            )}
                          >
                            {notification.type === 'message'
                              ? <MessageSquare className="w-3 h-3" />
                              : <ShieldCheck className="w-3 h-3" />}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm font-bold text-slate-900 truncate">{notification.senderName}</span>
                              <span
                                className={cn(
                                  'text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shrink-0',
                                  notification.senderRole === 'Student'
                                    ? 'bg-blue-50 text-blue-600'
                                    : notification.senderRole === 'Admin'
                                      ? 'bg-rose-50 text-rose-600'
                                      : notification.senderRole === 'Teacher'
                                        ? 'bg-amber-50 text-amber-600'
                                        : 'bg-slate-100 text-slate-600',
                                )}
                              >
                                {notification.senderRole}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDateTime(notification.createdAt)}
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                {notification.type === 'message' && notification.senderId ? (
                                  <button
                                    onClick={() => void handleView(notification)}
                                    disabled={activeId === notification.id}
                                    className="px-2.5 py-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors text-[10px] font-black uppercase tracking-widest disabled:opacity-60"
                                    title="View message"
                                  >
                                    View
                                  </button>
                                ) : null}
                                {!notification.isRead ? (
                                  <button
                                    onClick={() => void markAsRead(notification.id)}
                                    disabled={activeId === notification.id}
                                    className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-60"
                                    title="Mark as read"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                ) : null}
                                <button
                                  onClick={() => void deleteNotification(notification.id)}
                                  disabled={activeId === notification.id}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-60"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <p
                            className={cn(
                              'text-sm leading-relaxed',
                              notification.isRead ? 'text-slate-500' : 'text-slate-700 font-medium',
                            )}
                          >
                            {notification.content}
                          </p>
                        </div>
                      </div>
                      {!notification.isRead ? (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />
                      ) : null}
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                  <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No notifications</h3>
                  <p className="text-slate-500 text-sm mt-1">You're all caught up! Check back later for updates.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
