import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronRight, Clock, Home, MessageSquare, ShieldCheck, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import TeacherSidebar from '../components/TeacherSidebar';
import { getRealtimeSocket, type NotificationRealtimePayload } from '../lib/realtime';

type NotificationType = 'message' | 'system' | 'alert';

type NotificationItem = {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at?: string;
};

type ApiUser = {
  id: number;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  profile_image?: string | null;
  role?: string | null;
};

type DirectMessage = {
  fromId: number;
  toId: number;
  senderName: string;
  text: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

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

const resolveAvatarUrl = (value: string | null | undefined, fallback: string) => {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw;
  }
  const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`;
  return `${API_ORIGIN}${normalizedPath}`;
};

const toDisplayName = (user: ApiUser) => {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return String(user.name || '').trim() || fullName || `User ${user.id}`;
};

const inferType = (message: string): NotificationType => {
  const text = String(message || '').toLowerCase();
  if (text.startsWith('[directmessage]')) return 'message';
  if (text.includes('urgent') || text.includes('alert')) return 'alert';
  return 'system';
};

export default function TeacherNotificationsPage() {
  const navigate = useNavigate();
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) {
        setTeacherId(null);
        setIsLoading(false);
        return;
      }
      const authUser = JSON.parse(raw);
      const resolvedTeacherId = Number(authUser?.id);
      if (!Number.isInteger(resolvedTeacherId) || resolvedTeacherId <= 0) {
        setTeacherId(null);
        setIsLoading(false);
        return;
      }
      setTeacherId(resolvedTeacherId);
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
      const response = await fetch(`${API_BASE_URL}/notifications/user/${teacherId}`);
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load notifications.');
      }
      setNotifications(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load notifications.');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data = await response.json().catch(() => []);
      if (!response.ok) return;
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    if (!teacherId) return;
    void Promise.all([loadNotifications(), loadUsers()]);
  }, [teacherId, loadNotifications, loadUsers]);

  useEffect(() => {
    if (!teacherId) return;
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

    return () => {
      socket.emit('notification:unsubscribe', subscription);
      socket.off('notification:created', handleNotificationEvent);
      socket.off('notification:updated', handleNotificationEvent);
      socket.off('notification:deleted', handleNotificationEvent);
    };
  }, [loadNotifications, teacherId]);

  const markAsRead = async (id: number) => {
    setActiveId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to mark as read.');
      }
      setNotifications((current) => current.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
      setSelectedNotification((current) => (current && current.id === id ? { ...current, is_read: 1 } : current));
      window.dispatchEvent(new Event('teacher-notifications-updated'));
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Failed to mark as read.');
    } finally {
      setActiveId(null);
    }
  };

  const markAllAsRead = async () => {
    if (!teacherId) return;
    setIsMarkingAllRead(true);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/user/${teacherId}/read-all`, { method: 'PUT' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to mark all as read.');
      }
      setNotifications((current) => current.map((n) => ({ ...n, is_read: 1 })));
      setSelectedNotification((current) => (current ? { ...current, is_read: 1 } : current));
      window.dispatchEvent(new Event('teacher-notifications-updated'));
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Failed to mark all as read.');
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const deleteNotification = async (id: number) => {
    setActiveId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete notification.');
      }
      setNotifications((current) => current.filter((n) => n.id !== id));
      setSelectedNotification((current) => (current && current.id === id ? null : current));
      window.dispatchEvent(new Event('teacher-notifications-updated'));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete notification.');
    } finally {
      setActiveId(null);
    }
  };

  const decoratedNotifications = useMemo(() => (
    notifications.map((notification) => {
      const direct = parseDirectMessage(notification.message);
      const sender = direct
        ? users.find((user) => Number(user.id) === direct.fromId)
        : null;
      const senderRole = String(sender?.role || '').trim().toLowerCase();
      const senderRoleLabel = senderRole === 'student' ? 'Student' : senderRole === 'admin' ? 'Admin' : senderRole === 'teacher' ? 'Teacher' : 'System';
      const senderName = direct?.senderName || (sender ? toDisplayName(sender) : 'System');
      const avatarSeed = direct?.fromId
        ? `user-${direct.fromId}`
        : `sender-${senderName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'system'}`;
      const senderAvatar = resolveAvatarUrl(
        String(sender?.profile_image || '').trim(),
        `https://picsum.photos/seed/${avatarSeed}/100/100`
      );

      return {
        ...notification,
        type: inferType(notification.message),
        senderName,
        senderRole: senderRoleLabel,
        senderAvatar,
        visibleMessage: direct?.text || notification.message,
      };
    })
  ), [notifications, users]);

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return decoratedNotifications.filter((notification) => {
      if (filter === 'unread' && Number(notification.is_read) === 1) return false;
      if (!query) return true;
      return (
        notification.senderName.toLowerCase().includes(query) ||
        notification.visibleMessage.toLowerCase().includes(query)
      );
    });
  }, [decoratedNotifications, filter, searchQuery]);

  const unreadCount = useMemo(
    () => decoratedNotifications.filter((n) => Number(n.is_read) !== 1).length,
    [decoratedNotifications]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={() => navigate('/teacher/dashboard')} className="hover:text-primary inline-flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-slate-900">Notifications</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                className="w-72 pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={isMarkingAllRead || unreadCount === 0}
              className="text-sm font-bold text-primary hover:underline disabled:opacity-60"
            >
              {isMarkingAllRead ? 'Marking...' : 'Mark all as read'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[880px] mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
              <p className="text-slate-500 mt-2">When others send messages, you will see them here.</p>
            </header>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  'px-6 py-2 rounded-xl text-sm font-bold transition-all',
                  filter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                )}
              >
                All Notifications
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={cn(
                  'px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2',
                  filter === 'unread' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                )}
              >
                Unread
                {unreadCount > 0 ? (
                  <span className={cn('size-5 rounded-full flex items-center justify-center text-[10px]', filter === 'unread' ? 'bg-white text-primary' : 'bg-primary text-white')}>
                    {unreadCount}
                  </span>
                ) : null}
              </button>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 mb-6">
                {error}
              </div>
            ) : null}

            <div className="space-y-3">
              {isLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-400">
                  Loading notifications...
                </div>
              ) : filteredNotifications.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {filteredNotifications.map((notification) => {
                    const isRead = Number(notification.is_read) === 1;
                    return (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => {
                          setSelectedNotification(isRead ? notification : { ...notification, is_read: 1 });
                          if (!isRead) {
                            void markAsRead(notification.id);
                          }
                        }}
                        className={cn(
                          'bg-white p-4 rounded-2xl border transition-all group relative cursor-pointer hover:border-primary/40',
                          isRead ? 'border-slate-200 opacity-75' : 'border-primary/20 shadow-sm ring-1 ring-primary/5'
                        )}
                      >
                        <div className="flex gap-4">
                          <div className="relative shrink-0">
                            <div className="size-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                              <img src={notification.senderAvatar} alt={notification.senderName} className="w-full h-full object-cover" />
                            </div>
                            <div className={cn(
                              'absolute -bottom-1 -right-1 size-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm',
                              notification.type === 'message'
                                ? 'bg-primary text-white'
                                : notification.type === 'alert'
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-slate-500 text-white'
                            )}>
                              {notification.type === 'message' ? <MessageSquare className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">{notification.senderName}</span>
                                <span className={cn(
                                  'text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md',
                                  notification.senderRole === 'Student'
                                    ? 'bg-blue-50 text-blue-600'
                                    : notification.senderRole === 'Admin'
                                      ? 'bg-rose-50 text-rose-600'
                                      : notification.senderRole === 'Teacher'
                                        ? 'bg-amber-50 text-amber-600'
                                        : 'bg-slate-100 text-slate-600'
                                )}>
                                  {notification.senderRole}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDateTime(notification.created_at)}
                                </span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                  {!isRead ? (
                                    <button
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        void markAsRead(notification.id);
                                      }}
                                      className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="Mark as read"
                                    >
                                      <CheckCheck className="w-4 h-4" />
                                    </button>
                                  ) : null}
                                  <button
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      void deleteNotification(notification.id);
                                    }}
                                    disabled={activeId === notification.id}
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-60"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <p className={cn('text-sm leading-relaxed', isRead ? 'text-slate-500' : 'text-slate-700 font-medium')}>
                              {notification.visibleMessage}
                            </p>
                          </div>
                        </div>
                        {!isRead ? (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />
                        ) : null}
                      </motion.div>
                    );
                  })}
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

      {selectedNotification ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setSelectedNotification(null)}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 p-6">
            {(() => {
              const parsedDirect = parseDirectMessage(selectedNotification.message);
              const cleanMessage = parsedDirect?.text || selectedNotification.message;
              const senderName = parsedDirect?.senderName || 'System';
              return (
                <>
                  <h3 className="text-xl font-black text-slate-900">Notification Detail</h3>
                  <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{cleanMessage}</p>
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">From</span>
                      <span className="text-sm font-bold text-slate-700">{senderName}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Received</span>
                      <span className="text-sm font-bold text-slate-700">{formatDateTime(selectedNotification.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Status</span>
                      <span className="text-sm font-bold text-slate-700">{Number(selectedNotification.is_read) === 1 ? 'Read' : 'Unread'}</span>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedNotification(null)}
                      className="rounded-xl bg-primary text-white px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-primary/90"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      ) : null}
    </div>
  );
}
