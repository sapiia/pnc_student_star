import { CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '../../../lib/utils';

import type { AdminRecordToast } from './adminRecords.types';

interface AdminRecordsToastProps {
  toast: AdminRecordToast | null;
}

export default function AdminRecordsToast({
  toast,
}: AdminRecordsToastProps) {
  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 20, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className={cn(
            'fixed top-0 left-1/2 z-[100] flex items-center gap-3 rounded-2xl px-6 py-3 font-bold text-white shadow-2xl',
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-amber-600',
          )}
        >
          <CheckCircle2 className="h-5 w-5" />
          {toast.message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
