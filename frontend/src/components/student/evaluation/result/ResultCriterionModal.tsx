import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { EvaluationIcon } from '../IconMapper';
import StarRating from '../../../ui/StarRating';
import type { CriterionView } from './types';

interface Props {
  criterion: CriterionView | null;
  ratingScale: number;
  onClose: () => void;
}

export function ResultCriterionModal({
  criterion,
  ratingScale,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {criterion ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-6 border-b border-slate-100 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl md:h-14 md:w-14 ${criterion.bgColor} ${criterion.color}`}
                >
                  <EvaluationIcon
                    iconName={criterion.icon}
                    className="h-6 w-6 md:h-7 md:w-7"
                  />
                </div>

                <div className="space-y-1 md:space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary md:text-[11px]">
                    Detail View
                  </p>
                  <h3 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">
                    {criterion.label}
                  </h3>
                  <div className="flex items-center gap-2 md:gap-3">
                    <StarRating
                      rating={criterion.score}
                      max={ratingScale}
                      starClassName="h-4 w-4 md:h-5 md:w-5"
                    />
                    <span className="text-xs font-black text-slate-900 md:text-sm">
                      {criterion.score}/{ratingScale}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6 md:space-y-6 md:p-8">
              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 md:p-5">
                <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-primary md:text-[11px]">
                  Assigned Tip
                </p>
                <p className="text-sm font-medium leading-relaxed text-slate-700">
                  {criterion.tip || 'No admin tip was saved for this criterion.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
                <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-slate-400 md:text-[11px]">
                  Your Reflection
                </p>
                <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700">
                  {criterion.reflection ||
                    'No written reflection was submitted for this criterion.'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
