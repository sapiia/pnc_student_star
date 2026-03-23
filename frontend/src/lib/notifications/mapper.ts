import { DEFAULT_AVATAR } from '../api';

type NotificationType = 'message' | 'alert' | 'system';

export type MappedNotification = {
  id: string;
  type: NotificationType;
  user_id: number | null;
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

type TeacherFeedbackPayload = {
  teacherId?: number;
  teacherName?: string;
  teacherProfile?: string;
  periodLabel?: string;
  feedbackId?: number;
  text?: string;
};

const FALLBACK_AVATAR = DEFAULT_AVATAR;

const parseTeacherFeedback = (raw: string): TeacherFeedbackPayload | null => {
  const text = String(raw || '').trim();
  if (!text.startsWith('[TeacherFeedback]')) return null;
  const json = text.replace(/^\[TeacherFeedback\]\s*/, '');
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      teacherId: Number(parsed.teacherId) || undefined,
      teacherName: parsed.teacherName ? String(parsed.teacherName) : undefined,
      teacherProfile: parsed.teacherProfile ? String(parsed.teacherProfile) : undefined,
      periodLabel: parsed.periodLabel ? String(parsed.periodLabel) : undefined,
      feedbackId: Number(parsed.feedbackId) || undefined,
      text: parsed.text ? String(parsed.text) : undefined,
    };
  } catch {
    return null;
  }
};

const normalizeRole = (rawRole: string | undefined): 'Student' | 'Admin' | 'Teacher' => {
  const r = String(rawRole || '').trim().toLowerCase();
  if (r === 'admin') return 'Admin';
  if (r === 'teacher') return 'Teacher';
  return 'Student';
};

export const mapApiNotifications = (data: any[], limit = 100): MappedNotification[] => {
  if (!Array.isArray(data)) return [];

  const mapped = data.map((n: any): MappedNotification => {
    const rawType = String(n.type || '').toLowerCase();
    const normalizedType: NotificationType =
      rawType === 'alert' ? 'alert' : rawType === 'system' ? 'system' : 'message';

    const backendContent = String(n.content || '').trim();
    const backendFromName = String(n.from_name || '').trim();
    const backendFromRole = normalizeRole(n.from_role || n.sender_role);
    const backendFromAvatar = String(n.from_avatar || '').trim();

    const parsedFeedback = parseTeacherFeedback(String(n.message || n.content || ''));

    const senderName = backendFromName || parsedFeedback?.teacherName || String(n.sender_name || '').trim() || 'Unknown';
    const senderRole = parsedFeedback ? 'Teacher' : backendFromRole;
    const senderAvatar =
      backendFromAvatar || parsedFeedback?.teacherProfile || String(n.sender_avatar || FALLBACK_AVATAR);

    const content =
      backendContent ||
      parsedFeedback?.text ||
      String(n.message || n.content || '').trim() ||
      'No content';

    return {
      id: String(n.id),
      type: parsedFeedback ? 'message' : normalizedType,
      user_id: Number(n.user_id) || null,
      sender: {
        id: parsedFeedback?.teacherId || Number(n.from_id) || undefined,
        name: senderName,
        role: senderRole,
        avatar: senderAvatar,
      },
      content,
      time: String(n.created_at || ''),
      isRead: Number(n.is_read) === 1,
    };
  });

  return mapped.slice(0, limit);
};
