export type EvaluationResponse = {
  criterion_key: string;
  criterion_name: string;
  star_value: number;
  reflection: string;
};

export type EvaluationRecord = {
  id: number;
  user_id: number;
  period: string;
  rating_scale: number;
  criteria_count: number;
  average_score: number;
  submitted_at: string;
  created_at: string;
  responses?: EvaluationResponse[];
};

export type FeedbackRecord = {
  id: number;
  teacher_id: number;
  student_id: number;
  evaluation_id?: number | null;
  evaluation_period?: string | null;
  created_at?: string | null;
};

export type HistoryItem = {
  id: number;
  title: string;
  period: string;
  completedDate: string;
  completedLabel: string;
  nextDueDate: string;
  nextDueLabel: string;
  rating: number;
  ratingScale: number;
};

export interface HistoryFilterState {
  searchQuery: string;
  sortBy: "recent" | "oldest" | "highest" | "lowest" | "title";
}

export interface TrendDataPoint {
  name: string;
  score: number;
  feedbackCount?: number;
}

export interface HistoryContextValue {
  historyItems: HistoryItem[];
  filteredHistoryItems: HistoryItem[];
  trendData: TrendDataPoint[];
  isLoading: boolean;
  studentName: string;
  studentId: string;
  cycleDays: number;
  globalRatingScale: number;
  canEditAfterSubmit: boolean;
  activeCriterionId: string;
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: HistoryFilterState["sortBy"]) => void;
  onCriterionChange: (id: string) => void;
}
