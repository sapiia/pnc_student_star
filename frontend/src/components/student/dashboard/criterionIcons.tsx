import {
  Brain,
  Briefcase,
  CreditCard,
  Heart,
  Home,
  MessageCircle,
  Smile,
  Star,
  Users,
  Users2,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

type DashboardCriterionIconProps = {
  name: string;
  className?: string;
};

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
  Star,
};

export function DashboardCriterionIcon({
  name,
  className = 'w-6 h-6',
}: DashboardCriterionIconProps) {
  const Icon = ICON_MAP[name] || Star;
  return <Icon className={className} />;
}
