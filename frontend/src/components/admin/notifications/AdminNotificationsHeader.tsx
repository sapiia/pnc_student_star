import { Bell, RefreshCcw, Search } from 'lucide-react';

interface AdminNotificationsHeaderProps {
  hasUnread: boolean;
  searchQuery: string;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
}

export default function AdminNotificationsHeader({
  hasUnread,
  searchQuery,
  onRefresh,
  onSearchChange,
}: AdminNotificationsHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="font-semibold text-slate-900">Notifications</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-72 rounded-full border-none bg-slate-100 py-2 pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:border-primary/30 hover:text-primary"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>

        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          {hasUnread ? (
            <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
          ) : null}
        </button>
      </div>
    </header>
  );
}
