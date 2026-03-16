import { Bell, Settings } from 'lucide-react';

type MessagesHeaderProps = {
  unreadTotal: number;
  onOpenNotifications: () => void;
};

export default function MessagesHeader({ unreadTotal, onOpenNotifications }: MessagesHeaderProps) {
  return (
    <header className="h-auto min-h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-2 md:py-0 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
        <h2 className="text-slate-900 text-sm md:text-lg font-bold leading-tight tracking-tight truncate">Messages</h2>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full shrink-0">
          <span className="size-2 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">{unreadTotal} New</span>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 ml-2">
        <button
          onClick={onOpenNotifications}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative shrink-0"
        >
          <Bell className="w-5 h-5" />
          {unreadTotal > 0 ? <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" /> : null}
        </button>
        <button className="hidden sm:block p-2 text-slate-500 hover:bg-slate-100 rounded-full shrink-0">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
