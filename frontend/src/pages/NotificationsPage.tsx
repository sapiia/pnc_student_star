import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronRight, Home, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import Sidebar from '../components/layout/sidebar/Sidebar';
import { getRealtimeSocket, type NotificationRealtimePayload } from '../lib/realtime';

type NotificationItem = {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at?: string;
};

type TeacherFeedbackNotice = {
  teacherId?: number;
  teacherName?: string;
  teacherProfile?: string | null;
  periodLabel?: string;
  feedbackId?: number;
  text?: string;
};

type NotificationDetail = {
  title: string;
  description: string;
  meta: Array<{ label: string; value: string }>;
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

const parseTeacherFeedbackNotification = (raw: string): TeacherFeedbackNotice | null => {
  const text = String(raw || '').trim();
  if (!text.startsWith('[TeacherFeedback]')) return null;
  const jsonText = text.replace(/^\[TeacherFeedback\]\s*/, '').trim();
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      teacherId: Number(parsed.teacherId || 0) || undefined,
      teacherName: String(parsed.teacherName || '').trim() || undefined,
      teacherProfile: parsed.teacherProfile ? String(parsed.teacherProfile) : null,
      periodLabel: String(parsed.periodLabel || '').trim() || undefined,
      feedbackId: Number(parsed.feedbackId || 0) || undefined,
      text: String(parsed.text || '').trim() || undefined,
    };
  } catch {
    return null;
  }
};

const toNotificationDetail = (notification: NotificationItem): NotificationDetail => {
  const teacherFeedback = parseTeacherFeedbackNotification(notification.message);
  if (teacherFeedback) {
    return {
      title: teacherFeedback.teacherName
        ? `${teacherFeedback.teacherName} just sent feedback`
        : 'Teacher Feedback',
      description: teacherFeedback.text || 'A teacher sent you feedback.',
      meta: [
        { label: 'Type', value: 'Teacher Feedback' },
        { label: 'Quarter', value: teacherFeedback.periodLabel || 'Current Evaluation' },
        { label: 'Received', value: formatDateTime(notification.created_at) },
      ],
    };
  }

  return {
    title: 'Notification Detail',
    description: String(notification.message || '').trim() || 'No detail message.',
    meta: [
      { label: 'Type', value: 'General Notification' },
      { label: 'Received', value: formatDateTime(notification.created_at) },
      { label: 'Status', value: Number(notification.is_read) === 1 ? 'Read' : 'Unread' },
    ],
  };
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!studentId) return;
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
  }, [studentId]);

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
    void loadNotifications();
  }, [loadNotifications, studentId]);

  useEffect(() => {
    if (!studentId) return;

    const socket = getRealtimeSocket();
    const subscription = { userId: studentId };
    const handleNotificationEvent = (payload: NotificationRealtimePayload = {}) => {
      if (Number(payload.userId) !== studentId) return;
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

  const visibleNotifications = useMemo(() => (
    notifications.filter((notification) => {
      const messageText = String(notification.message || '').toLowerCase();
      const isLegacyFeedbackNotice = messageText.includes('submitted new feedback');
      return !isLegacyFeedbackNotice;
    })
  ), [notifications]);

  const unreadCount = useMemo(
    () => visibleNotifications.filter((notification) => Number(notification.is_read) !== 1).length,
    [visibleNotifications]
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
          ) : visibleNotifications.length > 0 ? (
            <div className="space-y-4">
              {visibleNotifications.map((notification, index) => {
                const isRead = Number(notification.is_read) === 1;
                const teacherFeedbackNotice = parseTeacherFeedbackNotification(notification.message);
                const teacherName = teacherFeedbackNotice?.teacherName || 'Teacher';
                const visibleMessage = teacherFeedbackNotice?.text || notification.message;

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => setSelectedNotification(notification)}
                    className={`rounded-3xl border p-5 shadow-sm cursor-pointer hover:border-primary/40 transition-colors ${isRead ? 'bg-white border-slate-200' : 'bg-primary/5 border-primary/20'}`}
                  >
                    <div className="flex items-start gap-4">
                      {teacherFeedbackNotice?.teacherProfile ? (
                        <div className="size-12 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                          <img src={teacherFeedbackNotice.teacherProfile} alt={teacherName} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${isRead ? 'bg-slate-100 text-slate-500' : 'bg-primary text-white'}`}>
                          <Bell className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            {isRead ? 'Read' : 'Unread'} • {formatDateTime(notification.created_at)}
                          </p>
                          <div className="flex items-center gap-2">
                            {!isRead ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleMarkAsRead(notification.id);
                                }}
                                disabled={activeId === notification.id}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-60"
                              >
                                {activeId === notification.id ? 'Saving...' : 'Mark Read'}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDelete(notification.id);
                              }}
                              disabled={activeId === notification.id}
                              className="rounded-xl bg-rose-500 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white inline-flex items-center gap-1 disabled:opacity-60"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {activeId === notification.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
                          {visibleMessage}
                        </p>
                        {teacherFeedbackNotice?.periodLabel ? (
                          <p className="mt-1 text-[11px] font-bold text-slate-500">
                            Quarter: {teacherFeedbackNotice.periodLabel}
                          </p>
                        ) : null}
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

      {selectedNotification ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setSelectedNotification(null)}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 p-6">
            {(() => {
              const detail = toNotificationDetail(selectedNotification);
              return (
                <>
                  <h3 className="text-xl font-black text-slate-900">{detail.title}</h3>
                  <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{detail.description}</p>
                  <div className="mt-5 space-y-2">
                    {detail.meta.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                        <span className="text-sm font-bold text-slate-700">{item.value}</span>
                      </div>
                    ))}
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
