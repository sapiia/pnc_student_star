import { cn } from '../../../lib/utils';
import { EvaluationIcon } from './IconMapper';
import StarRating from '../../../components/ui/StarRating';
import type { EvaluationCriterion } from './types';

interface Props {
  criteria: EvaluationCriterion[];
  scores: Record<string, number>;
  ratingScale: number;
}

export function EvaluationSummary({ 
  criteria, 
  scores, 
  ratingScale 
}: Props) {
  return (
    <div className="p-6 md:p-10 space-y-4 md:space-y-6">
      {criteria.map((c) => {
        const score = scores[c.key] || 0;
        return (
          <div key={c.key} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
            <div className="flex items-center gap-4">
              <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0", c.bgColor, c.color)}>
                <EvaluationIcon iconName={c.icon} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{c.label}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Rating: {score}/5
                </p>
              </div>
            </div>
            <div className="flex justify-end md:justify-start">
              <StarRating rating={score} max={ratingScale} starClassName="size-4" readonly />
            </div>
          </div>
        );
      })}
    </div>
  );
}

