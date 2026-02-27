export type CriterionKey = 
  | 'living' 
  | 'jobStudy' 
  | 'humanSupport' 
  | 'health' 
  | 'feeling' 
  | 'choiceBehavior' 
  | 'moneyPayment' 
  | 'lifeSkill';

export interface Criterion {
  key: CriterionKey;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface EvaluationData {
  id: string;
  date: string;
  quarter: string;
  scores: Record<CriterionKey, number>;
  reflections: Record<CriterionKey, string>;
}

export interface Feedback {
  id: string;
  author: string;
  authorRole: string;
  avatar: string;
  date: string;
  content: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  cohort: string;
}
