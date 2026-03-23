import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { EvaluationIcon } from '../IconMapper';
import StarRating from '../../../ui/StarRating';
import type { CriterionView } from './types';

interface Props {
  criteriaData: CriterionView[];
  ratingScale: number;
  onSelectCriterion: (criterion: CriterionView) => void;
}

export function ResultCriteriaGrid({
  criteriaData,
  ratingScale,
  onSelectCriterion,
}: Props) {
  if (criteriaData.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm font-bold text-slate-400">
        No criterion details were saved for this evaluation.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {criteriaData.map((criterion, index) => (
        <motion.button
          type="button"
          key={criterion.key}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{
            delay: index * 0.04,
            duration: 0.28,
            ease: [0.16, 1, 0.3, 1],
          }}
          onClick={() => onSelectCriterion(criterion)}
          className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
        >
          <div className="flex items-start justify-between gap-3">
            <div
              className={`rounded-lg p-2 ${criterion.bgColor} ${criterion.color}`}
            >
              <EvaluationIcon iconName={criterion.icon} className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-primary">
              Details
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-800">{criterion.label}</h4>
            <div className="flex items-center justify-between gap-3">
              <StarRating
                rating={criterion.score}
                max={ratingScale}
                starClassName="h-4 w-4"
              />
              <span className="text-sm font-black text-slate-900">
                {criterion.score}/{ratingScale}
              </span>
            </div>
            <p className="line-clamp-2 text-xs text-slate-500">
              {criterion.reflection ||
                criterion.tip ||
                'Click to open the full comment for this criterion.'}
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
