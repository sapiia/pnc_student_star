interface AdminNotificationsToolbarProps {
  onClearRead: () => void;
  onMarkAllAsRead: () => void;
}

export default function AdminNotificationsToolbar({
  onClearRead,
  onMarkAllAsRead,
}: AdminNotificationsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Notifications
        </h1>
        <p className="mt-1 text-slate-500">
          Stay updated with messages and system alerts.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onMarkAllAsRead}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-primary/90"
        >
          Mark all as read
        </button>
        <button
          onClick={onClearRead}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:border-rose-200 hover:text-rose-600"
        >
          Clear read
        </button>
      </div>
    </div>
  );
}
