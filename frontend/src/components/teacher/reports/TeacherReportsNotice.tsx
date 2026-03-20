import { cn } from '../../../lib/utils';
import type { TeacherReportNotice } from '../../../lib/teacher/reporting';

interface TeacherReportsNoticeProps {
  notice: TeacherReportNotice | null;
  onDismiss: () => void;
}

export default function TeacherReportsNotice({
  notice,
  onDismiss,
}: TeacherReportsNoticeProps) {
  if (!notice) return null;

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-semibold',
        notice.type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-rose-200 bg-rose-50 text-rose-700',
      )}
    >
      <span>{notice.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100"
      >
        Dismiss
      </button>
    </div>
  );
}
