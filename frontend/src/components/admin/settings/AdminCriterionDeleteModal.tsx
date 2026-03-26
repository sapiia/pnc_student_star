import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import type { CriterionSetting } from "./adminSettings.types";

interface AdminCriterionDeleteModalProps {
  criterion: CriterionSetting | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function AdminCriterionDeleteModal({
  criterion,
  onClose,
  onConfirm,
}: AdminCriterionDeleteModalProps) {
  return (
    <AnimatePresence>
      {criterion && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="border-b border-slate-100 px-8 py-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Delete Criterion?
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                You are about to remove{" "}
                <span className="font-black text-slate-700">{criterion.name}</span>.
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 bg-slate-50 px-8 py-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 rounded-2xl bg-rose-500 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-600"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
