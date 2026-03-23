import { X } from 'lucide-react';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import StarRating from '../../ui/StarRating';
import { DashboardCriterionIcon } from './criterionIcons';
import type { CriterionDetail } from './types';

type CriterionDetailModalProps = {
  criterion: CriterionDetail | null;
  ratingScale: number;
  transition: Transition;
  onClose: () => void;
};

export default function CriterionDetailModal({
  criterion,
  ratingScale,
  transition,
  onClose,
}: CriterionDetailModalProps) {
  return (
    <AnimatePresence>
      {criterion && (
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
            transition={transition}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-6 border-b border-slate-100 p-8">
              <div className="flex items-start gap-4">
                <div
                  className={`flex size-14 items-center justify-center rounded-2xl ${criterion.bgColor} ${criterion.color}`}
                >
                  <DashboardCriterionIcon
                    name={criterion.icon}
                    className="h-7 w-7"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-widest text-primary">
                    Current Status Detail
                  </p>
                  <h3 className="text-2xl font-black text-slate-900">
                    {criterion.label}
                  </h3>
                  <div className="flex items-center gap-3">
                    <StarRating
                      rating={criterion.score}
                      max={ratingScale}
                      starClassName="h-5 w-5"
                    />
                    <span className="text-sm font-black text-slate-900">
                      {criterion.score}/{ratingScale} Stars
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-8">
              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-primary">
                  Assigned Tip
                </p>
                <p className="text-sm font-medium leading-relaxed text-slate-700">
                  {criterion.tip || 'No saved tip is available for this criterion yet.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Your Comment
                </p>
                <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700">
                  {criterion.reflection ||
                    'No written comment was saved for this criterion.'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
