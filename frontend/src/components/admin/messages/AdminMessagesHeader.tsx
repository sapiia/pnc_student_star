import { Bell, Settings } from 'lucide-react';

interface AdminMessagesHeaderProps {
  unreadTotal: number;
  onOpenDashboard: () => void;
  onOpenSettings: () => void;
}

export default function AdminMessagesHeader({
  unreadTotal,
  onOpenDashboard,
  onOpenSettings,
}: AdminMessagesHeaderProps) {
  return (
    <header className="z-10 flex min-h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-2 md:px-8 md:py-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900">
          Messages
        </h2>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {unreadTotal} New Messages
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onOpenDashboard}
          className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
        >
          <Bell className="h-5 w-5" />
          {unreadTotal > 0 ? (
            <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
          ) : null}
        </button>
        <button
          onClick={onOpenSettings}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
