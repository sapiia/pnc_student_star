import type { ApiUser } from './types';

export type TeacherReportGenderOption = 'All' | 'Male' | 'Female';

export type TeacherReportNotice = {
  type: 'success' | 'error';
  message: string;
};

export type TeacherReportCriterionNavItem = {
  id: string;
  label: string;
  key: string;
};

export interface TeacherReportEvaluation {
  id: number;
  user_id: number;
  period: string;
  average_score: number;
  criteria_count: number;
  submitted_at: string;
  created_at?: string;
  responses: Array<{
    criterion_key: string;
    criterion_name: string;
    star_value: number;
  }>;
}

export interface TeacherReportStudent {
  id: number;
  name: string;
  email: string;
  className: string;
  generation?: string;
  student_id: string;
  gender: string;
}

export type TeacherReportTrendPoint = {
  name: string;
  avg: number;
  completion: number;
};

export type TeacherReportCriteriaPoint = {
  name: string;
  value: number;
  fill: string;
  color: string;
};

export type TeacherReportEngagementPoint = {
  name: string;
  value: number;
  fill: string;
};

export type TeacherReportStats = {
  totalStudents: number;
  avgScore: number;
  completionRate: number;
};

export type TeacherReportProcessedData = {
  trend: TeacherReportTrendPoint[];
  criteria: TeacherReportCriteriaPoint[];
  engagement: TeacherReportEngagementPoint[];
  stats: TeacherReportStats;
};

export const REPORT_GENERATION_HINTS = ['2026', '2027'];

export const REPORT_DEFAULT_CLASS_FALLBACK = [
  'WEB Class A',
  'WEB Class B',
  'WEB Class C',
  'WEB Class D',
];

export const REPORT_CRITERIA_COLORS = [
  '#6366F1',
  '#06B6D4',
  '#F59E0B',
  '#10B981',
  '#EC4899',
  '#8B5CF6',
  '#F97316',
  '#22C55E',
  '#0EA5E9',
  '#EF4444',
];

export const buildReportAuthHeaders = () => {
  const authToken =
    localStorage.getItem('token') || localStorage.getItem('auth_token') || '';
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
};

export const parseReportGeneration = (student: TeacherReportStudent) => {
  const direct = String(student.generation || '').trim();
  if (direct) return direct;

  const match = String(student.className || '').match(/gen\s*(\d{4})/i);
  return match?.[1] || '';
};

export const normalizeReportGenerationValue = (value: string) =>
  String(value || '')
    .replace(/gen\s*/i, '')
    .trim();

export const toCriterionKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_match, char: string) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');

export const parseReportPeriodParts = (value: string) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;

  const yearQuarterMatch = trimmed.match(/^(\d{4})\s*[-/ ]\s*Q([1-4])$/i);
  if (yearQuarterMatch) {
    return {
      year: Number(yearQuarterMatch[1]),
      quarter: Number(yearQuarterMatch[2]),
    };
  }

  const quarterYearMatch = trimmed.match(/^Q([1-4])\s*[-/ ]?\s*(\d{4})$/i);
  if (quarterYearMatch) {
    return {
      year: Number(quarterYearMatch[2]),
      quarter: Number(quarterYearMatch[1]),
    };
  }

  return null;
};

export const formatReportPeriodLabel = (year: number, quarter: number) =>
  `Q${quarter} ${year}`;

export const getReportEngagementHealth = (completionRate: number) => {
  if (completionRate >= 80) return 'Healthy';
  if (completionRate >= 50) return 'Moderate';
  return 'Low';
};

type TeacherReportApiUser = Partial<ApiUser> &
  Record<string, unknown> & {
    class?: string | null;
    generation?: string | null;
    student_id?: string | null;
    resolved_student_id?: string | null;
    gender?: string | null;
  };

export const mapTeacherReportStudent = (
  user: TeacherReportApiUser,
  toDisplayName: (value: ApiUser) => string,
  normalizeGender: (value?: string | null) => string,
): TeacherReportStudent => ({
  id: Number(user.id),
  name: toDisplayName(user as ApiUser),
  email: String(user.email || '').trim(),
  student_id:
    String(user.student_id || user.resolved_student_id || '').trim() ||
    `STU-${user.id}`,
  className: String(user.class || '').trim(),
  generation: user.generation ? String(user.generation) : undefined,
  gender: normalizeGender(user.gender),
});
