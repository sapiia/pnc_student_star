export type FeedbackItem = {
  id: number;
  teacher_id?: number;
  student_id?: number;
  evaluation_id?: number | null;
  evaluation_period?: string | null;
  teacher_name?: string;
  teacher_profile_image?: string | null;
  comment: string;
  created_at?: string;
};

export type StudentReplyItem = {
  id: number;
  feedback_id: number;
  student_id: number;
  student_name: string;
  reply_message: string;
  created_at?: string;
  is_read?: number;
};

export type TeacherSummary = {
  teacherId: number;
  teacherName: string;
  teacherProfileImage: string | null;
  latestAt?: string;
  latestSnippet: string;
  totalFeedbacks: number;
  unreadCount: number;
};

export type ChatEntry = {
  id: string;
  kind: 'teacher' | 'student';
  text: string;
  createdAt?: string;
  quarterLabel?: string;
  feedbackId?: number;
  replyId?: number;
};

export type DeleteTarget = {
  kind: 'feedback' | 'reply';
  id: number;
};

