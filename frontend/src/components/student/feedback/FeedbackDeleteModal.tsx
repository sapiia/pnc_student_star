import type { DeleteTarget } from './types';

type Props = {
  deleteTarget: DeleteTarget | null;
  isDeletingMessage: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function FeedbackDeleteModal({
  deleteTarget,
  isDeletingMessage,
  onClose,
  onConfirm,
}: Props) {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-black text-slate-900">Delete Message?</h3>
        <p className="mt-2 text-sm text-slate-500">
          This will delete the selected{' '}
          {deleteTarget.kind === 'feedback' ? 'feedback' : 'reply'} message for
          both sides.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeletingMessage}
            className="flex-1 rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white hover:bg-rose-600 disabled:opacity-60"
          >
            {isDeletingMessage ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
