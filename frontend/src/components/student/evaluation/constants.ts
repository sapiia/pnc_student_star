import type { EvaluationCriterion } from "./types";

export const CRITERION_STYLES = [
  { color: "text-blue-600", bgColor: "bg-blue-100" },
  { color: "text-orange-600", bgColor: "bg-orange-100" },
  { color: "text-violet-600", bgColor: "bg-violet-100" },
  { color: "text-rose-600", bgColor: "bg-rose-100" },
  { color: "text-pink-600", bgColor: "bg-pink-100" },
  { color: "text-cyan-600", bgColor: "bg-cyan-100" },
  { color: "text-emerald-600", bgColor: "bg-emerald-100" },
  { color: "text-indigo-600", bgColor: "bg-indigo-100" },
  { color: "text-sky-600", bgColor: "bg-sky-100" },
  { color: "text-amber-600", bgColor: "bg-amber-100" },
] as const;

export const DEFAULT_REFLECTION_MAX = 500;
export const DEFAULT_RATING_SCALE = 5;
