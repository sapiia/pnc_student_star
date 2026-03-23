import { Bell, Search } from 'lucide-react';

type Props = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

export function FeedbackTopBar({
  searchQuery,
  onSearchQueryChange,
}: Props) {
  return (
    <header className="flex h-auto min-h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-8 md:py-0">
      <div className="relative max-w-xl flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search teacher..."
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          className="w-full rounded-2xl border-none bg-slate-100 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="ml-4 flex items-center gap-4">
        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}

