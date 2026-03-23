import { ChevronRight, Home, RefreshCcw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type NotificationsTopBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onMarkAllRead: () => void;
  isMarkingAllRead: boolean;
  unreadCount: number;
};

export default function NotificationsTopBar({
  searchQuery,
  onSearchChange,
  onRefresh,
  onMarkAllRead,
  isMarkingAllRead,
  unreadCount,
}: NotificationsTopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-[110] flex h-auto min-h-16 flex-col items-stretch justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 md:flex-row md:items-center md:px-8 md:py-0">
      <div className="flex items-center gap-2 text-[10px] text-slate-500 md:text-sm">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 transition-colors hover:text-primary"
        >
          <Home className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="font-semibold text-slate-900">Dashboard</span>
        </button>
        <ChevronRight className="h-3.5 w-3.5 opacity-30 md:h-4 md:w-4" />
        <span className="font-semibold text-slate-900">Notifications</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search notifications..."
            className="rounded-xl border border-slate-200 bg-slate-100 py-2 pl-10 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 md:text-sm"
          />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-primary/40 hover:text-primary md:text-sm"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>

        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={isMarkingAllRead || unreadCount === 0}
          className="text-sm font-bold text-primary transition-all hover:underline disabled:opacity-60"
        >
          {isMarkingAllRead ? 'Marking...' : 'Mark All Read'}
        </button>
      </div>
    </header>
  );
}
