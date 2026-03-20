import { motion, AnimatePresence } from 'motion/react';
import { BellRing } from 'lucide-react';

interface SuccessToastProps {
  show: boolean;
  message: string;
}

export default function SuccessToast({ show, message }: SuccessToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 20, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className="fixed top-0 left-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
        >
          <BellRing className="w-5 h-5" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}