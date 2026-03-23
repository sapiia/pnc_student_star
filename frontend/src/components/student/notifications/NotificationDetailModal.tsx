import type { StudentNotificationItem } from './types';
import { toNotificationDetail } from './utils';

type NotificationDetailModalProps = {
  notification: StudentNotificationItem | null;
  onClose: () => void;
};

export default function NotificationDetailModal({
  notification,
  onClose,
}: NotificationDetailModalProps) {
  if (!notification) {
    return null;
  }

  const detail = toNotificationDetail(notification);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-black text-slate-900">{detail.title}</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
          {detail.description}
        </p>

        <div className="mt-5 space-y-2">
          {detail.meta.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
            >
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                {item.label}
              </span>
              <span className="text-sm font-bold text-slate-700">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
