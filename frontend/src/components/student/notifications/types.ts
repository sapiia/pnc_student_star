export type StudentNotificationItem = {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at?: string;
};

export type TeacherFeedbackNotice = {
  teacherId?: number;
  teacherName?: string;
  teacherProfile?: string | null;
  periodLabel?: string;
  feedbackId?: number;
  text?: string;
};

export type NotificationDetail = {
  title: string;
  description: string;
  meta: Array<{ label: string; value: string }>;
};

export type NotificationReadFilter = 'all' | 'unread';
export type NotificationTypeFilter = 'any' | 'message' | 'alert' | 'system';
export type NotificationCardType = Exclude<NotificationTypeFilter, 'any'>;

export type StudentNotificationCard = {
  id: number;
  raw: StudentNotificationItem;
  searchText: string;
  isRead: boolean;
  type: NotificationCardType;
  senderName: string;
  senderRole: 'Teacher' | 'Admin';
  senderAvatar: string;
  content: string;
  periodLabel?: string;
  timeLabel: string;
};
