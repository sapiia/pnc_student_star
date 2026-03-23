import { Lightbulb, TrendingUp } from 'lucide-react';
import type { CriterionView } from './types';

interface Props {
  criterion: CriterionView | null;
  ratingScale: number;
}

export function StrongestAreaCard({ criterion, ratingScale }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <TrendingUp className="h-5 w-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-slate-900">Strongest Area</h3>
      </div>

      {criterion ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="mb-2 flex items-start justify-between gap-4">
            <h4 className="font-bold text-emerald-800">{criterion.label}</h4>
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-white">
              {criterion.score}/{ratingScale} Stars
            </span>
          </div>
          <p className="text-sm leading-relaxed text-emerald-700">
            {criterion.reflection ||
              criterion.tip ||
              'This criterion currently has the strongest score in your evaluation.'}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function FocusAreaCard({ criterion, ratingScale }: Props) {
  return (
    <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-bold text-slate-900">Focus Area</h3>
      </div>

      {criterion ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-slate-700">
                {criterion.label}
              </span>
              <span className="text-xs font-bold text-amber-600">
                {criterion.score}/{ratingScale} Stars
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-sm italic text-slate-600">
              "{criterion.tip ||
                criterion.reflection ||
                'Open the criterion card below to review the full details for this area.'}"
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
