import { AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion, type Transition } from 'motion/react';

type DashboardUrgentBannerProps = {
  show: boolean;
  daysLeft: number;
  transition: Transition;
  onViewSchedule: () => void;
};

export default function DashboardUrgentBanner({
  show,
  daysLeft,
  transition,
  onViewSchedule,
}: DashboardUrgentBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={transition}
          className="flex items-center gap-4 rounded-xl border border-rose-100 bg-rose-50 p-4 text-rose-800"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-rose-500 text-white">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold">
              {daysLeft === 0
                ? 'Action Required: Evaluation Is Due Now'
                : 'Action Required: Evaluation Window Opening Soon!'}
            </p>
            <p className="text-xs opacity-80">
              {daysLeft === 0
                ? 'Your self-evaluation is due now.'
                : `Your next self-evaluation is scheduled in ${daysLeft} days.`}
            </p>
          </div>

          <button
            type="button"
            onClick={onViewSchedule}
            className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
          >
            View Schedule
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
