import { Minus, Plus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '../../../lib/utils';

import type { AdminRecordConfirmAction } from './adminRecords.types';

interface AdminRecordConfirmModalProps {
  action: AdminRecordConfirmAction | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function AdminRecordConfirmModal({
  action,
  isSubmitting,
  onCancel,
  onConfirm,
}: AdminRecordConfirmModalProps) {
  const title = getActionTitle(action);
  const description = getActionDescription(action);
  const isDeleteAction = action?.kind === 'hard-delete';

  return (
    <AnimatePresence>
      {action ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!isSubmitting) {
                onCancel();
              }
            }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div
              className={cn(
                'mb-6 flex size-16 items-center justify-center rounded-2xl',
                isDeleteAction
                  ? 'bg-rose-50 text-rose-500'
                  : 'bg-amber-50 text-amber-500',
              )}
            >
              {action.kind === 'hard-delete' ? (
                <Trash2 className="h-8 w-8" />
              ) : action.shouldEnable ? (
                <Plus className="h-8 w-8" />
              ) : (
                <Minus className="h-8 w-8" />
              )}
            </div>

            <h3 className="text-xl font-black tracking-tight text-slate-900">
              {title}
            </h3>

            <p className="mt-3 text-sm leading-relaxed font-bold text-slate-600">
              {description}
            </p>

            <div className="mt-8 flex gap-3">
              <button
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-black tracking-widest text-slate-600 uppercase transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                disabled={isSubmitting}
                className={cn(
                  'flex-1 rounded-xl py-3 text-xs font-black tracking-widest text-white uppercase shadow-lg transition-all disabled:opacity-60',
                  isDeleteAction
                    ? 'bg-rose-600 shadow-rose-600/20 hover:bg-rose-700'
                    : 'bg-amber-600 shadow-amber-600/20 hover:bg-amber-700',
                )}
              >
                {isSubmitting ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function getActionTitle(action: AdminRecordConfirmAction | null) {
  if (!action) {
    return '';
  }

  if (action.kind === 'hard-delete') {
    return 'Permanent Removal?';
  }

  return action.shouldEnable ? 'Enable Admin?' : 'Disable Admin?';
}

function getActionDescription(action: AdminRecordConfirmAction | null) {
  if (!action) {
    return '';
  }

  if (action.kind === 'hard-delete') {
    return `EXTREME ACTION: Permanently remove "${action.admin.name}"? This cannot be undone.`;
  }

  return action.shouldEnable
    ? `Enable "${action.admin.name}"? They will regain access.`
    : `Disable "${action.admin.name}"? They will lose access to the platform.`;
}
