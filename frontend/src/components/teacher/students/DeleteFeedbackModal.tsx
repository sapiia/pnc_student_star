type DeleteFeedbackModalProps = {
  pendingDeleteFeedbackId: number | null;
  isDeletingFeedbackId: number | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteFeedbackModal({
  pendingDeleteFeedbackId,
  isDeletingFeedbackId,
  onCancel,
  onConfirm,
}: DeleteFeedbackModalProps) {
  if (!pendingDeleteFeedbackId) return null;

  return (
    <div className="fixed inset-0 z-[118] flex items-center justify-center p-4">
      <button type="button" onClick={onCancel} className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-black text-slate-900">Delete Message?</h3>
        <p className="mt-2 text-sm text-slate-500">This will delete the selected feedback message for both teacher and student.</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeletingFeedbackId === Number(pendingDeleteFeedbackId)}
            className="flex-1 rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white hover:bg-rose-600 disabled:opacity-60"
          >
            {isDeletingFeedbackId === Number(pendingDeleteFeedbackId) ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
