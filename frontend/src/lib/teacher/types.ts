// Shared type definitions for Teacher pages

export type GenderOption = 'All Genders' | 'Male' | 'Female';
export type Gender = 'male' | 'female' | 'unknown';

export interface ApiUser {
  id: number;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  role?: string | null;
  class?: string | null;
  gender?: string | null;
  student_id?: string | null;
  resolved_student_id?: string | null;
  profile_image?: string | null;
}

export interface StudentRecord {
  id: number;
  name: string;
  email: string;
  studentId: string;
  generation: string;
  className: string;
  gender: Gender;
  avatar: string;
  averageScore: number | null;
  ratingScale: number;
  latestEvaluation: EvaluationRecord | null;
}

export interface EvaluationRecord {
  id: number;
  user_id?: number;
  average_score?: number;
  rating_scale?: number;
  submitted_at?: string;
  created_at?: string;
  responses?: EvaluationResponse[];
}

export interface EvaluationResponse {
  criterion_key: string;
  criterion_name?: string;
  criterion_icon?: string | null;
  star_value: number;
  reflection?: string;
  tip_snapshot?: string;
}

export interface FeedbackRecord {
  id: number;
  teacher_id: number;
  student_id: number;
  evaluation_id?: number | null;
  comment: string;
  created_at?: string;
  updated_at?: string;
  teacher_name?: string;
}

export interface NotificationRecord {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at?: string;
}

export interface StudentReplyRecord {
  notificationId: number;
  studentId: number;
  studentName: string;
  feedbackId: number;
  message: string;
  createdAt?: string;
  isRead: boolean;
}

export interface ConversationMessage {
  id: string;
  source: 'teacher' | 'student';
  text: string;
  createdAt?: string;
  feedbackId?: number;
  notificationId?: number;
  isRead?: boolean;
}

export interface CriterionDetail {
  key: string;
  label: string;
  icon: string;
  score: number;
  reflection: string;
  tip: string;
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

export interface Contact {
  id: number;
  name: string;
  role: string;
  type: 'Admin' | 'Teacher' | 'Student';
  avatar: string;
  lastMessage: string;
  timestamp?: string;
  unreadCount: number;
  activityCount: number;
}

export interface DirectMessage {
  fromId: number;
  toId: number;
  senderName: string;
  text: string;
}

export interface StatCard {
  label: string;
  value: string | number;
  total?: string;
  trend?: string;
  icon: any; // Lucide icon component
  color: string;
  bg: string;
  actionLabel?: string;
  onAction?: () => void;
}

