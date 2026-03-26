export type AdminReportsTab = "overview" | "students" | "teachers";
export type StudentGenderFilter = "All" | "Male" | "Female" | "Other";
export type StudentLevel = "Low" | "Medium" | "High";
export type StudentLevelFilter = "All" | StudentLevel;

export interface StudentRecord {
  id: number;
  name: string;
  email: string;
  class: string;
  gender: string;
  generation?: string;
  profileImage?: string | null;
}

export interface CriterionNavItem {
  id: string;
  label: string;
  key: string;
}

export interface EvaluationResponse {
  criterion_key?: string;
  criterion_name?: string;
  star_value: number;
}

export interface EvaluationRecord {
  id: number;
  user_id: number;
  period: string;
  average_score: number;
  submitted_at?: string;
  created_at?: string;
  responses?: EvaluationResponse[];
}

export interface FeedbackRecord {
  id: number;
  teacher_id: number;
  student_id: number;
  evaluation_id?: number | null;
  teacher_name?: string;
  teacher_profile_image?: string | null;
  created_at?: string;
}

export interface ReportCriterion {
  label: string;
  key: string;
}

export interface ReportChartDatum {
  subject: string;
  color: string;
  score: number;
  fullMark: number;
}

export interface RadarDatum {
  subject: string;
  curr: number;
}

export interface RadarSeriesKey {
  key: string;
  name: string;
  color: string;
  fill: string;
}

export interface OverallStats {
  totalStudents: number;
  evaluatedStudents: number;
  completionRate: number;
  pendingEvaluations: number;
  avgScore: number;
}

export interface TeacherPerformanceRow {
  id: number;
  name: string;
  dept: string;
  avgScore: number;
  studentCount: number;
  profileImage?: string | null;
}

export interface FeedbackStatusDatum {
  name: string;
  value: number;
  color: string;
}

export interface FeedbackStatusData {
  completed: number;
  pending: number;
  data: FeedbackStatusDatum[];
}

export interface PerformanceTrendDatum {
  label: string;
  studentAvg: number;
  completion: number;
}

export interface ReportNotice {
  type: "success" | "error";
  message: string;
}

export interface ApiReportUserRecord {
  id?: number | string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  class?: string;
  gender?: string;
  generation?: string | number;
  profile_image?: string | null;
}

export interface ApiCriteriaSetting {
  id?: string | number;
  name?: string;
  key?: string;
  status?: string;
}

export interface ApiCriteriaResponse {
  criteria?: ApiCriteriaSetting[];
  ratingScale?: number | string;
}
