import { Clock } from 'lucide-react';
import { motion, type Transition } from 'motion/react';
import { getRemainingDaysPercent } from './utils';

type DashboardCountdownCardProps = {
  daysLeft: number;
  cycleDays: number;
  evaluationsUsed: number;
  maxEvaluationsPerCycle: number;
  transition: Transition;
};

export default function DashboardCountdownCard({
  daysLeft,
  cycleDays,
  evaluationsUsed,
  maxEvaluationsPerCycle,
  transition,
}: DashboardCountdownCardProps) {
  const remainingPercent = Math.round(
    getRemainingDaysPercent(daysLeft, cycleDays)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay: 0.08 }}
      className="relative flex flex-col justify-center overflow-hidden rounded-2xl bg-slate-900 p-6 text-white md:p-8"
    >
      <div className="absolute right-0 top-0 p-4 opacity-10">
        <Clock className="-mr-6 -mt-6 h-24 w-24 md:-mr-8 md:-mt-8 md:h-32 md:w-32" />
      </div>

      <div className="relative z-10">
        <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 md:text-xs">
          Next Evaluation In
        </p>

        <div className="mb-6 flex items-baseline gap-2">
          <span className="text-5xl font-black md:text-6xl">{daysLeft}</span>
          <span className="text-lg font-bold text-slate-400 md:text-xl">Days</span>
        </div>

        <div className="space-y-3">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${remainingPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-primary"
            />
          </div>

          <div className="flex justify-between text-[8px] font-black uppercase text-slate-500 md:text-[10px]">
            <span>Cycle: {cycleDays} Days</span>
            <span>{remainingPercent}% Remaining</span>
          </div>

          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 md:text-[10px]">
            Used {evaluationsUsed} of {maxEvaluationsPerCycle} evaluations
          </div>
        </div>
      </div>
    </motion.div>
  );
}
