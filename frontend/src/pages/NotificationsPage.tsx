import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronRight, Home, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import Sidebar from '../components/Sidebar';

type NotificationItem = {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at?: string;
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

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) {
        setStudentId(null);
        setIsLoading(false);
        return;
      }

      const authUser = JSON.parse(raw);
      const resolvedUserId = Number(authUser?.id);
      if (!Number.isInteger(resolvedUserId) || resolvedUserId <= 0) {
        setStudentId(null);
        setIsLoading(false);
        return;
      }

      setStudentId(resolvedUserId);
    } catch {
      setStudentId(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!studentId) return;

    const loadNotifications = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/notifications/user/${studentId}`);
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load notifications.');
        }

        setNotifications(Array.isArray(data) ? data : []);
        window.dispatchEvent(new Event('student-notifications-updated'));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load notifications.');
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [studentId]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => Number(notification.is_read) !== 1).length,
    [notifications]
  );

  const handleMarkAsRead = async (notificationId: number) => {
    setActiveId(notificationId);

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to mark notification as read.');
      }

      setNotifications((current) => current.map((notification) => (
        notification.id === notificationId
          ? { ...notification, is_read: 1 }
          : notification
      )));
      window.dispatchEvent(new Event('student-notifications-updated'));
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Failed to mark notification as read.');
    } finally {
      setActiveId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (!studentId) return;
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

      setNotifications((current) => current.map((notification) => ({ ...notification, is_read: 1 })));
      window.dispatchEvent(new Event('student-notifications-updated'));
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Failed to mark all notifications as read.');
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleDelete = async (notificationId: number) => {
    setActiveId(notificationId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete notification.');
      }

      setNotifications((current) => current.filter((notification) => notification.id !== notificationId));
      window.dispatchEvent(new Event('student-notifications-updated'));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete notification.');
    } finally {
      setActiveId(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 hover:text-primary">
              <Home className="w-4 h-4" />
              Dashboard
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium text-slate-900">Notifications</span>
          </div>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isMarkingAllRead || unreadCount === 0}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            <CheckCheck className="w-4 h-4" />
            {isMarkingAllRead ? 'Marking...' : 'Mark All Read'}
          </button>
        </header>

        <div className="max-w-4xl mx-auto p-8 space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Student Alerts</p>
              <h1 className="mt-2 text-2xl font-black text-slate-900">Notifications</h1>
            </div>
            <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center relative">
              <Bell className="w-7 h-7" />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              ) : null}
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-400">
              Loading notifications...
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification, index) => {
                const isRead = Number(notification.is_read) === 1;

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`rounded-3xl border p-5 shadow-sm ${isRead ? 'bg-white border-slate-200' : 'bg-primary/5 border-primary/20'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${isRead ? 'bg-slate-100 text-slate-500' : 'bg-primary text-white'}`}>
                        <Bell className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            {isRead ? 'Read' : 'Unread'} • {formatDateTime(notification.created_at)}
                          </p>
                          <div className="flex items-center gap-2">
                            {!isRead ? (
                              <button
                                type="button"
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={activeId === notification.id}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-60"
                              >
                                {activeId === notification.id ? 'Saving...' : 'Mark Read'}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => handleDelete(notification.id)}
                              disabled={activeId === notification.id}
                              className="rounded-xl bg-rose-500 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white inline-flex items-center gap-1 disabled:opacity-60"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {activeId === notification.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <p className="text-lg font-black text-slate-900">No notifications yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Teacher feedback alerts and evaluation reminders will appear here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
