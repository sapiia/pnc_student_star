import { History, LayoutDashboard } from 'lucide-react';

interface Props {
  onDashboard: () => void;
  onHistory: () => void;
}

export function ResultActions({ onDashboard, onHistory }: Props) {
  return (
    <div className="mt-8 flex flex-col items-stretch justify-center gap-3 pb-12 md:flex-row md:items-center md:gap-4">
      <button
        onClick={onDashboard}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 md:flex-none"
      >
        <LayoutDashboard className="h-5 w-5" />
        Return Home
      </button>

      <button
        onClick={onHistory}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all hover:bg-slate-50 md:flex-none"
      >
        <History className="h-5 w-5" />
        History
      </button>
    </div>
  );
}
