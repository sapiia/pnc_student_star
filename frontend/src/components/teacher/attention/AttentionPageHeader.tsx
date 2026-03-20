import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Bell, AlertCircle } from 'lucide-react';

interface AttentionPageHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  unreadNotificationCount: number;
}

export default function AttentionPageHeader({
  searchQuery,
  onSearchChange,
  unreadNotificationCount,
}: AttentionPageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="h-auto min-h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-2 md:py-0 flex items-center justify-between shrink-0 z-10">
      <div className="min-w-0 flex items-center gap-4">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-black text-rose-600 truncate flex items-center gap-2">
            <AlertCircle className="w-5 h-5 hidden sm:block" /> Needs Attention
          </h1>
          <p className="text-[10px] md:text-xs text-slate-500 font-bold truncate">Students requiring immediate support.</p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 ml-2">
        <div className="relative flex-1 sm:flex-none hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-1.5 md:py-2 bg-slate-100 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 outline-none w-40 md:w-64 transition-all"
          />
        </div>
        <button
          onClick={() => navigate('/teacher/notifications')}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative shrink-0"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 md:min-w-5 h-4 md:h-5 px-1 rounded-full bg-rose-500 text-white text-[8px] md:text-[10px] font-black flex items-center justify-center ring-2 ring-white">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}