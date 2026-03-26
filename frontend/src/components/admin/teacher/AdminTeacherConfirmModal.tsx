import { AnimatePresence, motion } from 'motion/react';
import { Trash2, Plus, Minus } from 'lucide-react';
import type { TeacherConfirmAction } from './adminTeacherRecords.types';

interface AdminTeacherConfirmModalProps {
  action: TeacherConfirmAction | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AdminTeacherConfirmModal({
  action,
  isSubmitting,
  onConfirm,
  onCancel,
}: AdminTeacherConfirmModalProps) {
  if (!action) return null;

  const getTitle = () => {
    switch (action.kind) {
      case 'delete': return 'Delete Teacher?';
      case 'hard-delete': return 'Permanent Removal?';
      case 'toggle-active': return action.shouldEnable ? 'Enable Teacher?' : 'Disable Teacher?';
      case 'disable-all': return 'Disable All Teachers?';
      case 'hard-delete-all': return 'Permanent Cleanup?';
      default: return 'Confirm Action';
    }
  };

  const getMessage = () => {
    if (action.kind === 'delete' && action.teacher) {
      return `Delete "${action.teacher.name}"? Record will be archived.`;
    }
    if (action.kind === 'hard-delete' && action.teacher) {
      return `EXTREME ACTION: Permanently remove "${action.teacher.name}"? This cannot be undone.`;
    }
    if (action.kind === 'disable-all') {
      return 'Are you sure you want to disable all teachers?';
    }
    if (action.kind === 'hard-delete-all') {
      return 'EXTREME ACTION: Permanently delete all teachers? All data will be lost forever.';
    }
    if (action.kind === 'toggle-active' && action.teacher) {
      return action.shouldEnable 
        ? `Enable "${action.teacher.name}"? They will regain access.`
        : `Disable "${action.teacher.name}"? They will lose access to the platform.`;
    }
    return 'Confirm this action?';
  };

  const getIcon = () => {
    if (action.kind.includes('delete')) return Trash2;
    return action?.shouldEnable ? Plus : Minus;
  };

  const Icon = getIcon();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 14 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
        >
          <div className={cn(
            "size-16 rounded-2xl flex items-center justify-center mb-6 mx-auto",
            action.kind.includes('delete') ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500"
          )}>
            <Icon className="w-8 h-8" />
          </div>
          
          <h3 className="text-xl font-black text-slate-900 tracking-tight text-center">
            {getTitle()}
          </h3>
          
          <p className="mt-3 text-sm text-slate-600 font-bold leading-relaxed text-center">
            {getMessage()}
          </p>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className={cn(
                "flex-1 py-3 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-60 flex items-center justify-center",
                action.kind.includes('delete') ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
              )}
            >
              {isSubmitting ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

