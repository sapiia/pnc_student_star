import { Filter, Search, Shield } from 'lucide-react';

interface AdminRecordsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function AdminRecordsToolbar({
  searchQuery,
  onSearchChange,
}: AdminRecordsToolbarProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search administrators..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none transition-all shadow-sm focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

          <div>
            <p className="text-sm font-bold text-amber-800">
              Admin Account Protection
            </p>
            <p className="mt-1 text-xs text-amber-700">
              For security reasons, you cannot disable or delete the last active
              admin account. Bulk actions are disabled for administrator
              accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
