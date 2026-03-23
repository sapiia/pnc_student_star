import { ArrowRight } from 'lucide-react';
import { motion, type Transition } from 'motion/react';
import StarRating from '../../ui/StarRating';
import { DashboardCriterionIcon } from './criterionIcons';
import type { CriterionDetail } from './types';

type CriterionStatusCardProps = {
  criterion: CriterionDetail;
  index: number;
  ratingScale: number;
  prefersReducedMotion: boolean;
  transition: Transition;
  onSelect: (criterion: CriterionDetail) => void;
};

export default function CriterionStatusCard({
  criterion,
  index,
  ratingScale,
  prefersReducedMotion,
  transition,
  onSelect,
}: CriterionStatusCardProps) {
  return (
    <motion.button
      type="button"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion ? { duration: 0 } : { ...transition, delay: index * 0.04 }
      }
      whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.005 }}
      style={{ willChange: 'transform, opacity' }}
      onClick={() => onSelect(criterion)}
      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
    >
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${criterion.bgColor} ${criterion.color}`}
      >
        <DashboardCriterionIcon name={criterion.icon} />
      </div>

      <div className="flex-1">
        <p className="mb-1 text-sm font-semibold">{criterion.label}</p>
        <StarRating rating={criterion.score} max={ratingScale} />
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
    </motion.button>
  );
}
