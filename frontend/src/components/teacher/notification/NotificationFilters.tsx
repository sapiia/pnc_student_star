import { cn } from '../../../lib/utils';
import type { ReadFilter, NotificationTypeFilter } from './useNotificationsPage';

interface NotificationFiltersProps {
  filter: ReadFilter;
  setFilter: (f: ReadFilter) => void;
  typeFilter: NotificationTypeFilter;
  setTypeFilter: (t: NotificationTypeFilter) => void;
  allCount: number;
  unreadCount: number;
}

export default function NotificationFilters({
  filter,
  setFilter,
  typeFilter,
  setTypeFilter,
  allCount,
  unreadCount,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {[
        { key: 'all', label: 'All', count: allCount },
        { key: 'unread', label: 'Unread', count: unreadCount },
      ].map((tab) => (
        <button
          key={tab.key}
          onClick={() => setFilter(tab.key as ReadFilter)}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border",
            filter === tab.key ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
          )}
        >
          {tab.label}
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[11px] font-bold",
            filter === tab.key ? "bg-white text-primary" : "bg-slate-100 text-slate-600"
          )}>
            {tab.count}
          </span>
        </button>
      ))}

      <div className="flex items-center gap-2 ml-auto">
        {(['any', 'message', 'alert', 'system'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={cn(
              "px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all",
              typeFilter === type
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-primary/30"
            )}
          >
            {type === 'any' ? 'All types' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}