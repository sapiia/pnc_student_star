import type { Transition } from 'motion/react';
import CriterionStatusCard from './CriterionStatusCard';
import type { CriterionDetail, EvaluationRecord } from './types';
import { formatPeriodLabel, formatShortDate } from './utils';

type CurrentStatusSectionProps = {
  criteria: CriterionDetail[];
  latestEvaluation: EvaluationRecord | null;
  ratingScale: number;
  prefersReducedMotion: boolean;
  transition: Transition;
  onSelectCriterion: (criterion: CriterionDetail) => void;
};

export default function CurrentStatusSection({
  criteria,
  latestEvaluation,
  ratingScale,
  prefersReducedMotion,
  transition,
  onSelectCriterion,
}: CurrentStatusSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">
          Current Status ({formatPeriodLabel(latestEvaluation?.period || '')})
        </h3>
        <span className="text-sm text-slate-500">
          Last updated:{' '}
          {formatShortDate(
            String(latestEvaluation?.submitted_at || latestEvaluation?.created_at || '')
          )}
        </span>
      </div>

      {criteria.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm font-bold text-slate-400 shadow-sm">
          No submitted evaluation is available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {criteria.map((criterion, index) => (
            <div key={criterion.key}>
              <CriterionStatusCard
                criterion={criterion}
                index={index}
                ratingScale={ratingScale}
                prefersReducedMotion={prefersReducedMotion}
                transition={transition}
                onSelect={onSelectCriterion}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
