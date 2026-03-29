import { Bell, ChevronRight, Search } from 'lucide-react';

type StudentListTopBarProps = {
  searchQuery: string;
  unreadNotificationCount: number;
  onSearchChange: (value: string) => void;
  onNavigateHome: () => void;
  onOpenNotifications: () => void;
};

export default function StudentListTopBar({
  searchQuery,
  unreadNotificationCount,
  onSearchChange,
  onNavigateHome,
  onOpenNotifications,
}: StudentListTopBarProps) {
  return (
    <header className="h-auto min-h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-2 md:py-0 flex items-center justify-between shrink-0 z-10">
      <nav className="flex items-center gap-2 text-[10px] md:text-sm text-slate-500">
        <button onClick={onNavigateHome} className="hover:text-primary transition-colors">Home</button>
        <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span className="font-semibold text-slate-900 truncate">Students</span>
      </nav>
      <div className="flex items-center gap-2 md:gap-4 ml-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-32 sm:w-48 md:w-72 pl-8 md:pl-10 pr-4 py-1.5 md:py-2 bg-slate-100 border-none rounded-full text-xs md:text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <button onClick={onOpenNotifications} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative shrink-0">
          <Bell className="w-5 h-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 min-w-4 md:min-w-5 h-4 md:h-5 px-1 rounded-full bg-rose-500 text-white text-[8px] md:text-[10px] font-black flex items-center justify-center ring-2 ring-white">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
