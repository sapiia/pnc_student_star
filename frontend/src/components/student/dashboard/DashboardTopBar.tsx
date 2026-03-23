import { Bell, HelpCircle, Home } from 'lucide-react';

type DashboardTopBarProps = {
  unreadNotificationCount: number;
  onOpenNotifications: () => void;
  onOpenHelp: () => void;
};

export default function DashboardTopBar({
  unreadNotificationCount,
  onOpenNotifications,
  onOpenHelp,
}: DashboardTopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-auto min-h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md md:px-8 md:py-0">
      <div className="flex items-center gap-2 text-[10px] text-slate-500 md:text-sm">
        <Home className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span>/</span>
        <span className="font-medium text-slate-900">Student Dashboard</span>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative flex size-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 md:size-10"
        >
          <Bell className="h-4.5 w-4.5 md:h-5 md:w-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white">
              {Math.min(unreadNotificationCount, 9)}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenHelp}
          className="flex size-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 md:size-10"
        >
          <HelpCircle className="h-4.5 w-4.5 md:h-5 md:w-5" />
        </button>
      </div>
    </header>
  );
}
