import { PartyPopper } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  period: string;
  completedLabel: string;
}

export function ResultHeroCard({ period, completedLabel }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm md:rounded-3xl md:p-8"
    >
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-emerald-400 to-primary" />
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 md:h-16 md:w-16">
        <PartyPopper className="h-6 w-6 md:h-8 md:w-8" />
      </div>
      <h1 className="mb-2 text-2xl font-black leading-tight tracking-tight text-slate-900 md:text-4xl">
        Well Done!
      </h1>
      <p className="mx-auto max-w-2xl text-sm font-bold text-slate-600 md:text-lg">
        {period
          ? `Your ${period} evaluation was submitted on ${completedLabel}.`
          : 'Your evaluation has been submitted successfully.'}
      </p>
    </motion.section>
  );
}
