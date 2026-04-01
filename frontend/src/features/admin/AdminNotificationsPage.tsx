import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  MessageSquare,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  RefreshCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import AdminSidebar from '../../components/layout/sidebar/admin/AdminSidebar';
import { cn } from '../../lib/utils';
import { API_BASE_URL } from '../../lib/teacher/utils';
import { DEFAULT_AVATAR } from '../../lib/api';

type NotificationType = 'message' | 'alert' | 'system';

type Notification = {
  id: string;
  type: NotificationType;
  sender: {
    id?: number;
    name: string;
    role: 'Student' | 'Admin' | 'Teacher';
    avatar: string;
  };
  content: string;
  time: string;
  isRead: boolean;
};

const FALLBACK_AVATAR = DEFAULT_AVATAR;

export default function AdminNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'any'>('any');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const MAX_NOTIFICATIONS = 100;

  const loadNotifications = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`);
      const data = await response.json().catch(() => []);
      if (!response.ok) throw new Error(data?.error || 'Failed to load notifications.');

      const mapped: Notification[] = Array.isArray(data)
        ? data
            // Admin should not see 1:1 message notifications
            .filter((n: any) => String(n.type || '').toLowerCase() !== 'message')
            .map((n: any) => {
              const rawType = String(n.type || 'system').toLowerCase();
              const safeContent = String(n.message || n.content || '').trim() || 'No content';

              return {
                id: String(n.id),
                type: rawType as NotificationType,
                sender: {
                  id: Number(n.from_id) || undefined,
                  name: String(n.from_name || n.sender_name || 'System'),
                  role:
                    String(n.from_role || n.sender_role || 'System').toLowerCase() === 'admin'
                      ? 'Admin'
                      : String(n.from_role || n.sender_role || 'Teacher').toLowerCase() === 'teacher'
                      ? 'Teacher'
                      : 'Student',
                  avatar: String(n.from_avatar || n.sender_avatar || FALLBACK_AVATAR),
                },
                content: safeContent,
                time: String(n.created_at || ''),
                isRead: Number(n.is_read) === 1,
              };
            })
        : [];

      setNotifications(mapped.slice(0, MAX_NOTIFICATIONS));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications.');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    void fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' }).catch(() => null);
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    void fetch(`${API_BASE_URL}/notifications/${id}`, { method: 'DELETE' }).catch(() => null);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      void Promise.all(prev.map((n) => fetch(`${API_BASE_URL}/notifications/${n.id}/read`, { method: 'PUT' }))).catch(
        () => null
      );
      return prev.map((n) => ({ ...n, isRead: true }));
    });
  };

  const clearRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));
  };

  const formatTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value || '—';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((n) => {
        const matchesRead = filter === 'all' ? true : !n.isRead;
        const matchesType = typeFilter === 'any' ? true : n.type === typeFilter;
        const normalized = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !normalized || n.sender.name.toLowerCase().includes(normalized) || n.content.toLowerCase().includes(normalized);
        return matchesRead && matchesType && matchesSearch;
      }),
    [notifications, filter, typeFilter, searchQuery]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-900">Notifications</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <button
              onClick={() => void loadNotifications()}
              className="px-3 py-2 rounded-lg text-sm font-bold border border-slate-200 text-slate-600 hover:border-primary/30 hover:text-primary transition-colors flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" /> Refresh
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              {notifications.some((n) => !n.isRead) && <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[900px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
                <p className="text-slate-500 mt-1">Stay updated with messages and system alerts.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  Mark all as read
                </button>
                <button
                  onClick={clearRead}
                  className="px-3 py-2 rounded-lg text-sm font-bold border border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-600 transition-colors"
                >
                  Clear read
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as 'all' | 'unread')}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border',
                    filter === tab.key ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[11px] font-bold',
                      filter === tab.key ? 'bg-white text-primary' : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}

              <div className="flex items-center gap-2 ml-auto">
                {(['any', 'message', 'alert', 'system'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all',
                      typeFilter === type ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-primary/30'
                    )}
                  >
                    {type === 'any' ? 'All types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-1/3" />
                        <div className="h-3 bg-slate-100 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-sm font-bold rounded-2xl p-4">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      'bg-white p-4 rounded-2xl border transition-all group relative',
                      notification.isRead ? 'border-slate-200 opacity-75' : 'border-primary/20 shadow-sm ring-1 ring-primary/5'
                    )}
                  >
                    <div className="flex gap-4">
                      <div className="relative shrink-0">
                        <div className="size-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                          <img src={notification.sender.avatar} alt={notification.sender.name} className="w-full h-full object-cover" />
                        </div>
                        <div
                          className={cn(
                            'absolute -bottom-1 -right-1 size-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm',
                            notification.type === 'message' ? 'bg-primary text-white' : notification.type === 'alert' ? 'bg-rose-500 text-white' : 'bg-slate-500 text-white'
                          )}
                        >
                          {notification.type === 'message' ? <MessageSquare className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{notification.sender.name}</span>
                            <span
                              className={cn(
                                'text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md',
                                notification.sender.role === 'Student'
                                  ? 'bg-blue-50 text-blue-600'
                                  : notification.sender.role === 'Admin'
                                  ? 'bg-rose-50 text-rose-600'
                                  : 'bg-amber-50 text-amber-600'
                              )}
                            >
                              {notification.sender.role}
                            </span>
                            <span
                              className={cn(
                                'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md',
                                notification.type === 'message' ? 'bg-primary/10 text-primary' : notification.type === 'alert' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                              )}
                            >
                              {notification.type === 'system' ? 'System' : notification.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(notification.time)}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Mark as read"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className={cn('text-sm leading-relaxed', notification.isRead ? 'text-slate-500' : 'text-slate-700 font-medium')}>
                          {notification.content}
                        </p>
                      </div>
                    </div>
                    {!notification.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {notification.type === 'message' && (
                        <button
                          onClick={() => navigate('/admin/messages', { state: { selectedContactId: notification.sender.id, selectedContactName: notification.sender.name } })}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          Open message
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!isLoading && filteredNotifications.length === 0 && !error && (
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
