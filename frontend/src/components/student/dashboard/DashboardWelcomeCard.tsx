import { PlusCircle, Star } from 'lucide-react';
import { motion, type Transition } from 'motion/react';

type DashboardWelcomeCardProps = {
  studentName: string;
  studentId: string;
  currentPeriodLabel: string;
  canStartEvaluation: boolean;
  daysLeft: number;
  evaluationsUsed: number;
  maxEvaluationsPerCycle: number;
  prefersReducedMotion: boolean;
  transition: Transition;
  onStartEvaluation: () => void;
};

export default function DashboardWelcomeCard({
  studentName,
  studentId,
  currentPeriodLabel,
  canStartEvaluation,
  daysLeft,
  evaluationsUsed,
  maxEvaluationsPerCycle,
  prefersReducedMotion,
  transition,
  onStartEvaluation,
}: DashboardWelcomeCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2"
    >
      <div className="flex h-full flex-col items-center md:flex-row">
        <div className="flex-1 p-6 text-center md:p-8 md:text-left">
          <h2 className="mb-2 text-xl font-bold text-slate-900 md:text-2xl">
            Hello, {studentName}! Ready for your {currentPeriodLabel} Evaluation?
          </h2>

          {studentId && (
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 md:text-xs">
              Student ID: {studentId}
            </p>
          )}

          <p className="mb-6 max-w-xl text-sm text-slate-600 md:text-base">
            Track your progress across 8 key areas. Regular reflection helps you
            stay focused on your goals.
          </p>

          {!canStartEvaluation && (
            <p className="mb-6 text-[10px] font-black uppercase tracking-widest text-amber-600 md:text-xs">
              Next evaluation unlocks in {daysLeft} day{daysLeft === 1 ? '' : 's'}.
              <span className="mt-2 block text-amber-500">
                {evaluationsUsed} of {maxEvaluationsPerCycle} evaluations used this
                cycle
              </span>
            </p>
          )}

          <div className="flex justify-center md:justify-start">
            <button
              type="button"
              onClick={onStartEvaluation}
              disabled={!canStartEvaluation}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              <PlusCircle className="h-5 w-5" />
              {canStartEvaluation
                ? 'Start Evaluation'
                : `Available In ${daysLeft} Days`}
            </button>
          </div>
        </div>

        <div className="flex h-40 w-full items-center justify-center bg-primary/5 md:h-auto md:w-64">
          <div
            className={`flex size-24 items-center justify-center rounded-full bg-primary/20 md:size-32 ${
              prefersReducedMotion ? '' : 'animate-pulse'
            }`}
          >
            <Star className="h-10 w-10 fill-primary text-primary md:h-12 md:w-12" />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
