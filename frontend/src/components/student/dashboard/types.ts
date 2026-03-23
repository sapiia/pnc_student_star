export type EvaluationResponse = {
  criterion_id?: string | number | null;
  criterion_key: string;
  criterion_name?: string;
  criterion_icon?: string;
  star_value: number;
  reflection?: string;
  tip_snapshot?: string;
};

export type EvaluationRecord = {
  period: string;
  rating_scale?: number;
  submitted_at?: string;
  created_at?: string;
  responses?: EvaluationResponse[];
};

export type FeedbackItem = {
  id: number;
  teacher_name?: string;
  teacher_profile_image?: string | null;
  comment: string;
  created_at?: string;
};

export type NotificationItem = {
  id: number;
  message: string;
  is_read: number;
  created_at?: string;
};

export type GlobalCriterion = {
  id?: string | number | null;
  name?: string;
  icon?: string;
  status?: string;
  [key: string]: unknown;
};

export type CriterionDetail = {
  key: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  score: number;
  reflection: string;
  tip: string;
};

export type HistoricalComparisonDataKey = {
  key: string;
  name: string;
  color: string;
  fill: string;
};

export type HistoricalComparison = {
  data: Array<Record<string, string | number>>;
  dataKeys: HistoricalComparisonDataKey[];
  maxValue: number;
};
