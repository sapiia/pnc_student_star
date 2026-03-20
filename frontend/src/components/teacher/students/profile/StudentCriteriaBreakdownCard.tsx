import { Star } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import {
  CRITERIA_COLOR_STYLES,
  formatShortDate,
  getIcon,
  type CriteriaBreakdownItem,
} from '../../../../lib/teacher/utils';
import type { CriterionDetail, EvaluationRecord } from '../../../../lib/teacher/types';

type StudentCriteriaBreakdownCardProps = {
  selectedCriteria: CriteriaBreakdownItem[];
  globalRatingScale: number;
  selectedEvaluation: EvaluationRecord | null;
  onSelectCriterion: (criterion: CriterionDetail) => void;
};

export default function StudentCriteriaBreakdownCard({
  selectedCriteria,
  globalRatingScale,
  selectedEvaluation,
  onSelectCriterion,
}: StudentCriteriaBreakdownCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
          Criteria Breakdown
        </h3>
        {selectedEvaluation && (
          <span className="text-xs font-bold text-primary">
            {selectedEvaluation.period || 'Selected'} |{' '}
            {formatShortDate(selectedEvaluation.submitted_at || selectedEvaluation.created_at)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {selectedCriteria.length > 0 ? (
          selectedCriteria.map((criterion, index) => {
            const style = CRITERIA_COLOR_STYLES[index % CRITERIA_COLOR_STYLES.length];

            return (
              <button
                key={criterion.criterion_key}
                type="button"
                onClick={() =>
                  onSelectCriterion({
                    key: criterion.criterion_key,
                    label: criterion.criterion_name,
                    icon: criterion.criterion_icon,
                    score: Number(criterion.star_value || 0),
                    reflection: criterion.reflection,
                    tip: criterion.tip_snapshot,
                  })
                }
                className={cn(
                  'rounded-2xl border border-slate-100 bg-slate-50 p-5 text-left transition-all hover:bg-white',
                  style.hover,
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className={cn('size-10 rounded-2xl flex items-center justify-center', style.iconBg, style.iconText)}>
                    {getIcon(criterion.criterion_icon)}
                  </div>
                  <span className={cn('text-[10px] font-black uppercase tracking-widest', style.detailText)}>
                    Details
                  </span>
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {criterion.criterion_name}
                </p>

                <div className={cn('mb-4 flex gap-1', style.stars)}>
                  {Array.from({ length: globalRatingScale }).map((_, starIndex) => (
                    <Star
                      key={`${criterion.criterion_key}-${starIndex}`}
                      className={cn(
                        'w-4 h-4 fill-current',
                        starIndex >= Math.floor(Number(criterion.star_value || 0)) &&
                          'fill-slate-200 text-slate-200',
                      )}
                    />
                  ))}
                </div>

                {criterion.reflection && (
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Reflection
                    </p>
                    <p className="line-clamp-2 border-l-2 border-slate-200 pl-3 text-sm italic text-slate-700">
                      {criterion.reflection}
                    </p>
                  </div>
                )}
              </button>
            );
          })
        ) : (
          <div className="col-span-full rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
            Student has not completed any evaluations yet.
          </div>
        )}
      </div>
    </section>
  );
}
