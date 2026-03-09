import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronRight, Home, Trash2, MessageSquare, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import Sidebar from '../components/Sidebar';
import StudentMobileNav from '../components/StudentMobileNav';
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
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

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

  const filteredAndVisibleNotifications = visibleNotifications.filter(n =>
    filter === 'all' ? true : Number(n.is_read) !== 1
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        <StudentMobileNav />
        <header className="h-auto min-h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sticky top-0 z-[110]">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] md:text-sm">
            <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 hover:text-primary transition-colors">
              <Home className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="font-semibold text-slate-900">Dashboard</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-30" />
            <span className="font-semibold text-slate-900">Notifications</span>
          </div>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isMarkingAllRead || unreadCount === 0}
            className="text-sm font-bold text-primary hover:underline disabled:opacity-60 transition-all"
          >
            {isMarkingAllRead ? 'Marking...' : 'Mark All Read'}
          </button>
        </header>

        <div className="max-w-[800px] mx-auto p-4 md:p-8 space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-slate-500 mt-2 text-sm md:text-base">Stay updated with feedback and alerts from your teachers and admin.</p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {error}
            </div>
          ) : null}

          {/* Filter Tabs */}
          <div className="flex gap-3 md:gap-4 mb-6">
            <button 
              onClick={() => setFilter('all')}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold transition-all",
                filter === 'all' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
              )}
            >
              All Notifications
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2",
                filter === 'unread' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
              )}
            >
              Unread
              {unreadCount > 0 && (
                <span className={cn(
                  "size-5 rounded-full flex items-center justify-center text-[10px]",
                  filter === 'unread' ? "bg-white text-primary" : "bg-primary text-white"
                )}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-400">
              Loading notifications...
            </div>
          ) : filteredAndVisibleNotifications.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredAndVisibleNotifications.map((notification, index) => {
                  const isRead = Number(notification.is_read) === 1;
                  const teacherFeedbackNotice = parseTeacherFeedbackNotification(notification.message);
                  
                  const type = teacherFeedbackNotice ? 'message' : 'alert';
                  const senderName = teacherFeedbackNotice?.teacherName || (teacherFeedbackNotice ? 'Teacher' : 'System');
                  const senderRole = teacherFeedbackNotice ? 'Teacher' : 'Admin';
                  const senderAvatar = teacherFeedbackNotice?.teacherProfile || null;
                  const content = teacherFeedbackNotice?.text || notification.message;

                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedNotification(notification)}
                      className={cn(
                        "bg-white p-4 rounded-2xl border transition-all group relative cursor-pointer",
                        isRead ? "border-slate-200 opacity-75" : "border-primary/20 shadow-sm ring-1 ring-primary/5"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className="relative shrink-0">
                          {senderAvatar ? (
                            <div className="size-10 md:size-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                              <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="size-10 md:size-12 rounded-full flex items-center justify-center border-2 border-white shadow-sm bg-slate-100 text-slate-500">
                              <Bell className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                          )}
                          <div className={cn(
                            "absolute -bottom-1 -right-1 size-5 md:size-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm",
                            type === 'message' ? "bg-primary text-white" : "bg-rose-500 text-white"
                          )}>
                            {type === 'message' ? <MessageSquare className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">{senderName}</span>
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                                senderRole === 'Teacher' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                              )}>
                                {senderRole}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDateTime(notification.created_at)}
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                {!isRead && (
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); void handleMarkAsRead(notification.id); }}
                                    className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); void handleDelete(notification.id); }}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <p className={cn(
                            "text-sm leading-relaxed",
                            isRead ? "text-slate-500" : "text-slate-700 font-medium"
                          )}>
                            {content}
                          </p>
                          {teacherFeedbackNotice?.periodLabel ? (
                            <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-500">Evaluation: {teacherFeedbackNotice.periodLabel}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {!isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
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
