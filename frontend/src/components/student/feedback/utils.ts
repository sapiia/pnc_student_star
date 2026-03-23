import type { ChatEntry } from './types';

type StoredStudentUser = {
  id: number | null;
  name: string;
};

const AUTH_USER_STORAGE_KEY = 'auth_user';
const HIDDEN_MESSAGES_STORAGE_PREFIX = 'student_hidden_messages_';
const SEEN_BY_TEACHER_STORAGE_PREFIX = 'student_seen_by_teacher_';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const formatDateLabel = (value?: string) => {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return 'Unknown';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const toQuarterLabel = (period?: string | null) => {
  const text = String(period || '').trim();
  const match = text.match(/^(\d{4})-Q([1-4])$/i);
  if (match) return `Q${match[2]} ${match[1]}`;
  return text || 'Unknown Quarter';
};

export const sortByDateAsc = (left?: string, right?: string) =>
  new Date(String(left || '')).getTime() -
  new Date(String(right || '')).getTime();

export const parseStoredStudentUser = (): StoredStudentUser => {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) return { id: null, name: 'Student' };

    const authUser = JSON.parse(raw) as Record<string, unknown>;
    const parsedId = Number(authUser?.id);
    const studentId =
      Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
    const studentName =
      String(authUser?.name || '').trim() ||
      [authUser?.first_name, authUser?.last_name]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      'Student';

    return { id: studentId, name: studentName };
  } catch {
    return { id: null, name: 'Student' };
  }
};

export const getHiddenMessagesStorageKey = (studentId: number) =>
  `${HIDDEN_MESSAGES_STORAGE_PREFIX}${studentId}`;

export const getSeenByTeacherStorageKey = (studentId: number) =>
  `${SEEN_BY_TEACHER_STORAGE_PREFIX}${studentId}`;

export const readStoredHiddenMessageIds = (studentId: number) => {
  try {
    const raw = localStorage.getItem(getHiddenMessagesStorageKey(studentId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch {
    return [] as string[];
  }
};

export const readStoredSeenByTeacher = (studentId: number) => {
  try {
    const raw = localStorage.getItem(getSeenByTeacherStorageKey(studentId));
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, string>)
      : {};
  } catch {
    return {} as Record<string, string>;
  }
};

export const getReplyPreviewLabel = (message: ChatEntry) =>
  `Replying to ${
    message.kind === 'teacher' ? 'teacher' : 'my message'
  }: "${message.text.slice(0, 120)}"`;

