import { cn } from '../../../lib/utils';
import type { EvaluationCriterion } from './types';
import { Check, ClipboardList } from 'lucide-react';

interface Props {
  criteria: EvaluationCriterion[];
  currentStep: number;
  ratingScale: number;
  isEditMode?: boolean;
  editTitle?: string;
  onEditTitleChange: (title: string) => void;
}

export function EvaluationProgress({
  criteria,
  currentStep,
  ratingScale: _ratingScale,
  isEditMode = false,
  editTitle = '',
  onEditTitleChange,
}: Props) {
  const isSummaryStep = currentStep === criteria.length;
  const activeStepIndex = isSummaryStep ? criteria.length : currentStep;
  const steps = [
    ...criteria.map((criterion) => ({
      key: criterion.key,
      label: criterion.label,
      isSummary: false,
    })),
    {
      key: 'summary',
      label: 'Summary',
      isSummary: true,
    },
  ];

  return (
    <div className="mb-5 md:mb-7">
      {isEditMode && (
        <div className="mb-4 bg-white border border-primary/10 rounded-2xl px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Edit Evaluation</p>
            <p className="text-sm font-bold text-slate-900">Update the title and scores below.</p>
          </div>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            placeholder="Q4 2026"
            className="w-full md:w-56 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}
      <div className="overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <div className="min-w-[760px] rounded-3xl border border-slate-200/80 bg-white px-3 py-4 shadow-sm md:px-4 md:py-5">
          <div className="flex items-start justify-between">
            {steps.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              const isCompleted = idx < activeStepIndex;
              const labelLines = splitProgressLabel(step.label);

              return (
                <div key={step.key} className="relative flex min-w-0 flex-1 flex-col items-center px-1 text-center">
                  {idx > 0 && (
                    <div
                      className={cn(
                        "absolute right-1/2 top-4 h-[2px] w-full md:top-[19px]",
                        idx <= activeStepIndex ? "bg-primary/70" : "bg-slate-200"
                      )}
                    />
                  )}

                  <div
                    className={cn(
                      "relative z-10 flex size-8 items-center justify-center rounded-full border text-xs font-black transition-all md:size-10 md:text-sm",
                      isActive && "border-primary bg-primary text-white shadow-[0_14px_30px_-16px_rgba(93,95,239,0.9)] ring-4 ring-primary/10",
                      isCompleted && "border-primary/20 bg-primary/10 text-primary",
                      !isActive && !isCompleted && "border-slate-200 bg-slate-100 text-slate-400"
                    )}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {step.isSummary ? (
                      <ClipboardList className="h-4 w-4 md:h-[18px] md:w-[18px]" />
                    ) : isCompleted ? (
                      <Check className="h-4 w-4 md:h-[18px] md:w-[18px]" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  <div className="mt-2 min-h-[2.6rem] px-1 md:min-h-[3rem]">
                    {labelLines.map((line) => (
                      <span
                        key={`${step.key}-${line}`}
                        className={cn(
                          "block text-[9px] font-black uppercase leading-[1.15] tracking-[0.18em] md:text-[11px]",
                          isActive ? "text-primary" : isCompleted ? "text-slate-700" : "text-slate-400"
                        )}
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function splitProgressLabel(label: string) {
  const normalizedLabel = label.replace(/\s+and\s+/gi, ' & ').replace(/\s+/g, ' ').trim();

  if (normalizedLabel.length <= 12) {
    return [normalizedLabel];
  }

  if (normalizedLabel.includes(' & ')) {
    const [start, end] = normalizedLabel.split(' & ');

    if (start && end) {
      return [`${start} &`, end];
    }
  }

  const words = normalizedLabel.split(' ');

  if (words.length === 1) {
    return [normalizedLabel];
  }

  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')];
}

