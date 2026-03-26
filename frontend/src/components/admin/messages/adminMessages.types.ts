export interface ApiUser {
  id: number;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  role?: string | null;
  profile_image?: string | null;
}

export interface NotificationRecord {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at?: string;
}

export interface DirectMessage {
  fromId: number;
  toId: number;
  senderName: string;
  text: string;
}

export interface ParsedDirectNotification {
  notification: NotificationRecord;
  parsed: DirectMessage;
}

export interface Contact {
  id: number;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  timestamp?: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: number;
  isMe: boolean;
  fromId: number;
  toId: number;
  senderName: string;
  text: string;
  createdAt?: string;
  notificationId?: number;
  isRead?: boolean;
  rawIsRead: number;
}

export interface AdminProfile {
  id: number | null;
  name: string;
  avatar: string;
}
