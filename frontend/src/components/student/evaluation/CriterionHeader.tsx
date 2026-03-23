import { cn } from '../../../lib/utils';
import { EvaluationIcon } from './IconMapper';
import type { EvaluationCriterion } from './types';

interface Props {
  criterion: EvaluationCriterion | null;
  currentStep: number;
  totalSteps: number;
}

export function CriterionHeader({ 
  criterion, 
  currentStep, 
  totalSteps 
}: Props) {
  if (!criterion) return null;

  return (
    <div className="px-5 py-6 md:px-8 md:py-7 border-b border-primary/5 flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start text-center md:text-left">
      <div className={cn("size-14 md:size-16 rounded-2xl flex items-center justify-center shrink-0", criterion.bgColor, criterion.color)}>
        <EvaluationIcon iconName={criterion.icon} className="w-7 h-7 md:w-8 md:h-8" />
      </div>
      <div>
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-2 md:mb-3">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">
          {criterion.label}
        </h2>
        <p className="text-sm md:text-[15px] text-slate-500 font-bold leading-relaxed px-2 md:px-0 max-w-2xl">
          {criterion.description || `Reflect on your ${criterion.label.toLowerCase()} this quarter. What is going well? What could be improved?`}
        </p>
      </div>
    </div>
  );
}

