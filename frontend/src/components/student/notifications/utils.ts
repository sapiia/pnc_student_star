import type {
  NotificationCardType,
  NotificationDetail,
  StudentNotificationCard,
  StudentNotificationItem,
  TeacherFeedbackNotice,
} from './types';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const FALLBACK_AVATAR =
  'http://localhost:3001/uploads/logo/star_gmail_logo.jpg';

export const dispatchNotificationsUpdated = () => {
  window.dispatchEvent(new Event('student-notifications-updated'));
};

export const formatDateTime = (value?: string) => {
  const date = new Date(String(value || ''));

  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const parseTeacherFeedbackNotification = (
  raw: string
): TeacherFeedbackNotice | null => {
  const text = String(raw || '').trim();

  if (!text.startsWith('[TeacherFeedback]')) {
    return null;
  }

  const jsonText = text.replace(/^\[TeacherFeedback\]\s*/, '').trim();

  try {
    const parsed = JSON.parse(jsonText);

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

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

export const isLegacyFeedbackNotification = (notification: StudentNotificationItem) =>
  String(notification.message || '')
    .toLowerCase()
    .includes('submitted new feedback');

export const getNotificationType = (
  notification: StudentNotificationItem
): NotificationCardType => {
  if (parseTeacherFeedbackNotification(notification.message)) {
    return 'message';
  }

  return String(notification.message || '').toLowerCase().includes('alert')
    ? 'alert'
    : 'system';
};

export const mapStudentNotification = (
  notification: StudentNotificationItem
): StudentNotificationCard => {
  const teacherFeedback = parseTeacherFeedbackNotification(notification.message);

  return {
    id: notification.id,
    raw: notification,
    searchText: String(notification.message || '').toLowerCase(),
    isRead: Number(notification.is_read) === 1,
    type: getNotificationType(notification),
    senderName: teacherFeedback?.teacherName || (teacherFeedback ? 'Teacher' : 'System'),
    senderRole: teacherFeedback ? 'Teacher' : 'Admin',
    senderAvatar: teacherFeedback?.teacherProfile || FALLBACK_AVATAR,
    content: teacherFeedback?.text || notification.message,
    periodLabel: teacherFeedback?.periodLabel,
    timeLabel: formatDateTime(notification.created_at),
  };
};

export const toNotificationDetail = (
  notification: StudentNotificationItem
): NotificationDetail => {
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
      {
        label: 'Type',
        value: getNotificationType(notification) === 'alert'
          ? 'Alert'
          : 'General Notification',
      },
      { label: 'Received', value: formatDateTime(notification.created_at) },
      { label: 'Status', value: Number(notification.is_read) === 1 ? 'Read' : 'Unread' },
    ],
  };
};
