import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Props {
  totalEvaluations: number;
  highestRating: number;
  nextDueLabel: string;
}

export function QuickSummary({ 
  totalEvaluations, 
  highestRating, 
  nextDueLabel 
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-primary p-8 rounded-2xl shadow-xl shadow-primary/20 text-white relative overflow-hidden"
    >
      <div className="relative z-10 space-y-6">
        <h3 className="text-xl font-bold">Quick Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-primary-100 text-sm">Total Evaluations</span>
            <span className="text-2xl font-black">{totalEvaluations}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-primary-100 text-sm">Highest Rating</span>
            <span className="text-2xl font-black">{highestRating.toFixed(1)}</span>
          </div>
        </div>
        <div className="pt-6 border-t border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-primary-100 text-xs uppercase tracking-widest font-bold">Next Evaluation</span>
              <span className="text-lg font-bold mt-1">{nextDueLabel}</span>
            </div>
            <div className="size-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 fill-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl" />
    </motion.div>
  );
}
