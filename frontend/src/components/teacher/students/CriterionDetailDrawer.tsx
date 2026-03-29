import { Star, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../../lib/utils';
import { getIcon } from '../../../lib/teacher/utils';
import type { CriterionDetail } from '../../../lib/teacher/types';

type CriterionDetailDrawerProps = {
  activeCriterion: CriterionDetail | null;
  maxStars: number;
  onClose: () => void;
};

export default function CriterionDetailDrawer({ activeCriterion, maxStars, onClose }: CriterionDetailDrawerProps) {
  return (
    <AnimatePresence>
      {activeCriterion && (
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
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-full md:w-[480px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col z-[100]"
          >
            <div className="p-8 border-b border-slate-100 flex items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="size-14 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">{getIcon(activeCriterion.icon, 'w-7 h-7')}</div>
                <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-widest text-primary">Criterion Detail</p>
                  <h3 className="text-2xl font-black text-slate-900">{activeCriterion.label}</h3>
                  <div className="flex items-center gap-3 text-primary">
                    {Array.from({ length: maxStars }).map((_, index) => (
                      <Star key={index} className={cn('w-4 h-4 fill-current', index >= Math.floor(activeCriterion.score) && 'text-slate-200 fill-slate-200')} />
                    ))}
                    <span className="text-sm font-black text-slate-900">{activeCriterion.score}/{maxStars} Stars</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="size-10 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-2">Assigned Tip</p>
                <p className="text-sm font-medium leading-relaxed text-slate-700">{activeCriterion.tip || 'No admin tip was saved for this criterion.'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Student Reflection</p>
                <p className="text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">{activeCriterion.reflection || 'No student reflection was submitted for this criterion.'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
