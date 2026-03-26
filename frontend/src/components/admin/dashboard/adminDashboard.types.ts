import type { LucideIcon } from 'lucide-react';

export type DashboardSortBy = 'generation' | 'name' | 'created_at';
export type DashboardSortOrder = 'asc' | 'desc';
export type PendingUserRole = 'Student' | 'Teacher' | 'Admin';
export type PendingUserStatus = 'Active' | 'Inactive' | 'Deleted' | 'Pending';

export interface ApiUserRecord {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
  class?: string;
  major?: string;
  generation?: string | number;
  profile_image?: string;
  student_id?: string;
  resolved_student_id?: string;
  gender?: string;
  is_deleted?: number | string;
  is_disable?: number | string;
  is_active?: number | string;
  is_registered?: number | string;
  registration_status?: string;
  account_status?: string;
  [key: string]: unknown;
}

export interface PendingUser {
  id: number;
  name: string;
  email: string;
  role: PendingUserRole;
  group: string;
  status: PendingUserStatus;
  profileImage: string;
  initials: string;
}

export interface GenerationClassSummary {
  name: string;
  count: number;
}

export interface GenerationSummary {
  title: string;
  total: number;
  classes: GenerationClassSummary[];
  activeCount: number;
  disabledCount: number;
}

export interface StudentStatsSummary {
  total: string;
  generations: GenerationSummary[];
}

export interface DashboardSummary {
  studentStats: StudentStatsSummary;
  teacherCount: number;
  adminCount: number;
  pendingUsers: PendingUser[];
}

export interface EditUserFormState {
  firstName: string;
  lastName: string;
  email: string;
  role: PendingUserRole;
  gender: 'male' | 'female';
  generation: string;
  major: string;
  className: string;
  studentId: string;
}

export interface SystemActivityItem {
  id: number;
  type: 'success' | 'info' | 'warning';
  message: string;
  time: string;
  icon: LucideIcon;
}
