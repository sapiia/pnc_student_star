import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Search } from 'lucide-react';

interface NotificationTopBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  hasUnread: boolean;
}

export default function NotificationTopBar({
  searchQuery,
  onSearchChange,
  onRefresh,
  hasUnread,
}: NotificationTopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <button onClick={() => navigate('/teacher/dashboard')} className="hover:text-primary">
          Home
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="font-semibold text-slate-900">Notifications</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-72 pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <button
          onClick={onRefresh}
          className="px-3 py-2 rounded-lg text-sm font-bold border border-slate-200 text-slate-600 hover:border-primary/30 hover:text-primary transition-colors"
        >
          Refresh
        </button>
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
          <Bell className="w-5 h-5" />
          {hasUnread && (
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
}