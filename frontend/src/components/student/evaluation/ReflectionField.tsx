import { cn } from '../../../lib/utils';
import type { EvaluationCriterion } from './types';

interface Props {
  criterionKey: string;
  value: string;
  maxChars: number;
  onChange: (value: string) => void;
  label: string;
}

export function ReflectionField({ 
  criterionKey, 
  value, 
  maxChars, 
  onChange, 
  label 
}: Props) {
  const currentLength = value.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label 
          className="block text-lg md:text-[22px] font-black text-slate-900 tracking-tight" 
          htmlFor={`reflection-${criterionKey}`}
        >
          Self-Reflection
        </label>
        <span className={cn(
          "text-[10px] font-black uppercase tracking-widest",
          currentLength >= maxChars ? "text-rose-500" : "text-slate-400"
        )}>
          {currentLength} / {maxChars} max
        </span>
      </div>
      <textarea 
        id={`reflection-${criterionKey}`}
        className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary placeholder:text-slate-400 p-4 md:p-5 text-sm md:text-base text-slate-700 font-medium outline-none transition-all resize-vertical" 
        placeholder={`Describe your ${label.toLowerCase()} situation...`}
        rows={4}
        maxLength={maxChars}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

