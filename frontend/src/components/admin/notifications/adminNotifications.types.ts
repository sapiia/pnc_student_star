export type NotificationType = 'message' | 'alert' | 'system';
export type NotificationFilter = 'all' | 'unread';
export type NotificationSenderRole = 'Student' | 'Admin' | 'Teacher';

export interface AdminNotificationSender {
  id?: number;
  name: string;
  role: NotificationSenderRole;
  avatar: string;
}

export interface AdminNotification {
  id: string;
  type: NotificationType;
  sender: AdminNotificationSender;
  content: string;
  time: string;
  isRead: boolean;
}
