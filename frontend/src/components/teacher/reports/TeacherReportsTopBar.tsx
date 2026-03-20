import { Bell, Download, Loader2 } from 'lucide-react';

interface TeacherReportsTopBarProps {
  exporting: boolean;
  onExport: () => void;
  onOpenNotifications: () => void;
}

export default function TeacherReportsTopBar({
  exporting,
  onExport,
  onOpenNotifications,
}: TeacherReportsTopBarProps) {
  return (
    <header className="h-auto min-h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-2 md:h-16 md:px-8 md:py-0 flex z-10">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-slate-900 md:text-xl">
          Academic Analytics
        </h1>
        <p className="truncate text-[10px] font-medium text-slate-500 md:text-xs">
          Class performance and trends.
        </p>
      </div>

      <div className="ml-2 flex items-center gap-2 md:gap-4">
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="hidden shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex md:px-4 md:py-2 md:text-sm"
        >
          {exporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin md:h-4 md:w-4" />
          ) : (
            <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
          )}
          {exporting ? 'Exporting...' : 'Export Excel'}
        </button>

        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative shrink-0 rounded-full p-2 text-slate-500 hover:bg-slate-100"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
