import { CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface AdminSettingsToastProps {
  message: string;
  show: boolean;
}

export default function AdminSettingsToast({
  message,
  show,
}: AdminSettingsToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: "-50%", y: -20 }}
          animate={{ opacity: 1, x: "-50%", y: 20 }}
          exit={{ opacity: 0, x: "-50%", y: -20 }}
          className="fixed left-1/2 top-0 z-[100] flex items-center gap-3 rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-2xl"
        >
          <CheckCircle2 className="h-5 w-5" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
