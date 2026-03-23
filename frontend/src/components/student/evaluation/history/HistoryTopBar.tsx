import { Search, Bell, ChevronDown } from 'lucide-react';

interface Props {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function HistoryTopBar({ 
  searchQuery, 
  onSearchChange 
}: Props) {
  return (
    <header className="h-auto min-h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shrink-0">
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
<input
          id="history-search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search evaluations..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      </div>
      <div className="flex items-center justify-end gap-3 md:gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl relative border border-transparent hover:border-slate-200 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}

