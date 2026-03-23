import { Bell, Settings } from 'lucide-react';

interface Props {
  onDashboard: () => void;
}

export function ResultTopBar({ onDashboard }: Props) {
  return (
    <header className="h-auto min-h-16 shrink-0 flex flex-col items-stretch justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 md:flex-row md:items-center md:px-8 md:py-0">
      <div
        className="flex cursor-pointer items-center gap-4 text-primary"
        onClick={onDashboard}
      >
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 md:text-lg">
          Evaluation Results
        </h2>
      </div>

      <div className="flex items-center justify-end gap-3 md:gap-4">
        <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden">
          <Bell className="h-5 w-5" />
        </button>
        <button className="hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:block">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
