import { type Criterion } from "../../components/student/dashboard/types";

export interface EvaluationCriterion extends Criterion {
  id?: string;
  description?: string;
  starDescriptions: string[];
}

export interface EvaluationState {
  scores: Record<string, number>;
  reflections: Record<string, string>;
}

export interface EvaluationFormProps {
  criteria: EvaluationCriterion[];
  ratingScale: number;
  maxReflectionChars: number;
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
  onRate: (criterionKey: string, rating: number) => void;
  onReflectionChange: (criterionKey: string, value: string) => void;
  scores: Record<string, number>;
  reflections: Record<string, string>;
}

export interface EligibilityState {
  isLoading: boolean;
  canEvaluate: boolean;
  daysUntilAvailable: number;
  nextAvailableLabel: string;
  evaluationsUsed: number;
  maxEvaluationsPerCycle: number;
}
