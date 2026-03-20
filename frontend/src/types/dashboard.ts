/// Teacher Dashboard Types

export interface StudentData {
  id: number;
  studentId: string;
  name: string;
  avatar: string;
  generation: string;
  class: string;
  gender: string | null;
  rating: number | null;
  status: "Healthy" | "Action Needed" | "No Data";
  lastEval: string;
}

export type GenderOption = "All Genders" | "Male" | "Female";

export type SortKey =
  | "name"
  | "rating"
  | "generation"
  | "class"
  | "gender"
  | "status";

export type SortDirection = "asc" | "desc";

export interface Stat {
  label: string;
  value: string | number;
  total?: string;
  trend?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  actionLabel?: string;
  onAction?: () => void;
}
