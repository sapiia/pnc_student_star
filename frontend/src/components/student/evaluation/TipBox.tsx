import { Lightbulb } from 'lucide-react';
import type { EvaluationCriterion } from './types';

interface Props {
  criterion: EvaluationCriterion | null;
  selectedRating: number;
}

export function TipBox({ criterion, selectedRating }: Props) {
  if (!criterion || selectedRating === 0) {
    return (
      <div className="flex items-start gap-3 md:gap-4 p-4 md:p-5 bg-primary/5 rounded-2xl border border-primary/10">
        <div className="text-primary mt-0.5 shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <p className="text-[11px] md:text-sm text-slate-600 font-bold leading-relaxed">
          <strong className="text-primary text-[10px] md:text-xs">TIP:</strong>{' '}
          Choose a star rating to see guidance for that score.
        </p>
      </div>
    );
  }

  const selectedTip = criterion.starDescriptions[selectedRating - 1] || '';

  return (
    <div className="flex items-start gap-3 md:gap-4 p-4 md:p-5 bg-primary/5 rounded-2xl border border-primary/10">
      <div className="text-primary mt-0.5 shrink-0">
        <Lightbulb className="w-5 h-5" />
      </div>
      <p className="text-[11px] md:text-sm text-slate-600 font-bold leading-relaxed">
        <strong className="text-primary text-[10px] md:text-xs">TIP:</strong>{' '}
        {selectedTip}
      </p>
    </div>
  );
}

