import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface Props {
  message: string | null;
  onClose: () => void;
}

export function ResultToast({ message, onClose }: Props) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-4 right-4 top-20 z-[200] flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white shadow-2xl md:left-auto md:right-8 md:w-[420px]"
        >
          <div className="flex-1 text-sm font-bold leading-snug">{message}</div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1 transition-colors hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
