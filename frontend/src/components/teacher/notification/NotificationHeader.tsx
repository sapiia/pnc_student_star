interface NotificationHeaderProps {
  onMarkAllRead: () => void;
  onClearRead: () => void;
}

export default function NotificationHeader({ onMarkAllRead, onClearRead }: NotificationHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
        <p className="text-slate-500 mt-2">Stay updated with messages and alerts from students and staff.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onMarkAllRead}
          className="px-3 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Mark all as read
        </button>
        <button
          onClick={onClearRead}
          className="px-3 py-2 rounded-lg text-sm font-bold border border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-600 transition-colors"
        >
          Clear read
        </button>
      </div>
    </header>
  );
}