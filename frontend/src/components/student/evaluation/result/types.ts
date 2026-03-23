export type EvaluationResponse = {
  criterion_id?: string | null;
  criterion_key: string;
  criterion_name: string;
  criterion_icon?: string | null;
  star_value: number;
  reflection: string;
  tip_snapshot?: string;
};

export type EvaluationRecord = {
  id: number;
  user_id?: number;
  period: string;
  rating_scale: number;
  average_score: number;
  submitted_at: string;
  created_at: string;
  responses: EvaluationResponse[];
};

export type FeedbackItem = {
  id: number;
  teacher_name?: string;
  teacher_profile_image?: string | null;
  evaluation_id?: number | null;
  comment: string;
  created_at?: string;
};

export type CriterionView = {
  key: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  score: number;
  reflection: string;
  tip: string;
};

export type EvaluationResultLocationState = {
  scores?: Record<string, number>;
  reflections?: Record<string, string>;
  evaluationId?: number;
};

export type ResultRadarDatum = {
  subject: string;
  prev: number;
  curr: number;
};

export type ResultRadarKey = {
  key: 'prev' | 'curr';
  name: string;
  color: string;
  fill: string;
};
