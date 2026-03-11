import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Clock,
  MessageSquare,
  Search,
  Trash2,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from '../../components/layout/sidebar/student/Sidebar';
import StudentMobileNav from '../../components/common/StudentMobileNav';
import { cn } from '../../lib/utils';
import { getRealtimeSocket, type NotificationRealtimePayload } from '../../lib/realtime';

type NotificationType = 'message' | 'system';

type NotificationItem = {
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) {
        setStudentId(null);
        setIsLoading(false);
        return;
      }
      const authUser = JSON.parse(raw);
      const resolvedStudentId = Number(authUser?.id);
      if (!Number.isInteger(resolvedStudentId) || resolvedStudentId <= 0) {
        setStudentId(null);
        setIsLoading(false);
        return;
      }
      setStudentId(resolvedStudentId);
    } catch {
      setStudentId(null);
      setIsLoading(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/user/${studentId}`);
      const data = await response.json().catch(() => []);
      if (!response.ok) throw new Error((data as any)?.error || 'Failed to load notifications.');
      setNotifications(Array.isArray(data) ? (data as NotificationItem[]) : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load notifications.');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!studentId) return;
    const socket = getRealtimeSocket();
    const handler = (payload: NotificationRealtimePayload) => {
      if (Number(payload?.notification?.user_id) !== studentId) return;
      void loadNotifications();
    };
    socket.on('notification:created', handler);
    socket.on('notification:updated', handler);
    socket.on('notification:deleted', handler);
    return () => {
      socket.off('notification:created', handler);
      socket.off('notification:updated', handler);
      socket.off('notification:deleted', handler);
    };
  }, [loadNotifications, studentId]);

  const markAsRead = useCallback(
    async (id: number) => {
      if (!studentId) return;
      setActiveId(id);
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_read: 1 }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error((data as any)?.error || 'Failed to update notification.');
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
      } catch (markError) {
        setError(markError instanceof Error ? markError.message : 'Failed to update notification.');
      } finally {
        setActiveId(null);
      }
    },
    [studentId],
  );

  const deleteNotification = useCallback(async (id: number) => {
    setActiveId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error((data as any)?.error || 'Failed to delete notification.');
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (selectedNotification?.id === id) setSelectedNotification(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete notification.');
    } finally {
      setActiveId(null);
    }
  }, [selectedNotification?.id]);

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return notifications
      .filter((n) => (filter === 'unread' ? Number(n.is_read) !== 1 : true))
      .map((n) => {
        const parsedDirect = parseDirectMessage(n.message);
        return {
          ...n,
          type: inferType(n.message),
          visibleMessage: parsedDirect?.text || n.message,
          senderName: parsedDirect?.senderName || 'System',
        };
      })
      .filter((n) => {
        if (!query) return true;
        return (
          n.visibleMessage.toLowerCase().includes(query) ||
          String(n.senderName || '').toLowerCase().includes(query)
        );
      })
      .sort((a, b) => new Date(String(b.created_at || '')).getTime() - new Date(String(a.created_at || '')).getTime());
  }, [filter, notifications, searchQuery]);

  const unreadCount = useMemo(() => notifications.filter((n) => Number(n.is_read) !== 1).length, [notifications]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <StudentMobileNav />

        <header className="h-auto min-h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-0 flex items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">Notifications</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {unreadCount} unread
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-xl relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter((prev) => (prev === 'all' ? 'unread' : 'all'))}
              className={cn(
                'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors',
                filter === 'unread'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
              )}
            >
              {filter === 'unread' ? 'Unread Only' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              Back
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="md:hidden mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            {error ? <p className="mb-4 text-sm font-bold text-rose-600">{error}</p> : null}

            {isLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 font-bold">
                Loading notifications...
              </div>
            ) : filteredNotifications.length > 0 ? (
              <AnimatePresence initial={false}>
                {filteredNotifications.map((notification) => {
                  const isRead = Number(notification.is_read) === 1;
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        'relative bg-white rounded-2xl border p-5 mb-4 cursor-pointer transition-all',
                        isRead ? 'border-slate-200' : 'border-primary/30 shadow-sm',
                      )}
                      onClick={() => setSelectedNotification(notification)}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'size-11 rounded-2xl flex items-center justify-center shrink-0',
                            notification.type === 'message' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500',
                          )}
                        >
                          {notification.type === 'message' ? <MessageSquare className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {notification.senderName}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-slate-500">
                                <Clock className="w-4 h-4" />
                                <span>{formatDateTime(notification.created_at)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {!isRead ? (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    void markAsRead(notification.id);
                                  }}
                                  disabled={activeId === notification.id}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-60"
                                  title="Mark as read"
                                >
                                  <CheckCheck className="w-4 h-4" />
                                </button>
                              ) : null}
                              <button
                                type="button"
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
                          <p className={cn('mt-3 text-sm leading-relaxed', isRead ? 'text-slate-500' : 'text-slate-700 font-medium')}>
                            {notification.visibleMessage}
                          </p>
                        </div>
                      </div>
                      {!isRead ? <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" /> : null}
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
                    {!Number(selectedNotification.is_read) ? (
                      <button
                        type="button"
                        onClick={() => void markAsRead(selectedNotification.id)}
                        className="mr-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-emerald-700"
                      >
                        Mark Read
                      </button>
                    ) : null}
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

