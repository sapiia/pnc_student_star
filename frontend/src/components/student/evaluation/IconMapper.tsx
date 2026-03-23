import {
  Star, 
  Home,
  Briefcase,
  Users,
  Heart,
  Smile,
  Brain,
  CreditCard,
  Wrench,
  ClipboardList,
  Users2,
  MessageCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { EvaluationCriterion } from './types';

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Briefcase,
  Users,
  Users2,
  Heart,
  Smile,
  Brain,
  CreditCard,
  Wrench,
  MessageCircle,
  ClipboardList,
  Star,
};

interface Props {
  iconName: string;
  className?: string;
}

export function EvaluationIcon({ iconName, className = 'w-6 h-6' }: Props) {
  const Icon = ICON_MAP[iconName as keyof typeof ICON_MAP] || Star;
  return <Icon className={className} />;
}

