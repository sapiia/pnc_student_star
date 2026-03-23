import { cn } from '../../../lib/utils';
import type { NotificationReadFilter, NotificationTypeFilter } from './types';

type NotificationsFiltersProps = {
  filter: NotificationReadFilter;
  unreadCount: number;
  typeFilter: NotificationTypeFilter;
  onFilterChange: (value: NotificationReadFilter) => void;
  onTypeFilterChange: (value: NotificationTypeFilter) => void;
};

const TYPE_OPTIONS: NotificationTypeFilter[] = ['any', 'message', 'alert', 'system'];

export default function NotificationsFilters({
  filter,
  unreadCount,
  typeFilter,
  onFilterChange,
  onTypeFilterChange,
}: NotificationsFiltersProps) {
  return (
    <>
      <div className="mb-6 flex gap-3 md:gap-4">
        <button
          onClick={() => onFilterChange('all')}
          className={cn(
            'rounded-xl px-4 py-2 text-xs font-bold transition-all md:px-6 md:text-sm',
            filter === 'all'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-100'
          )}
        >
          All Notifications
        </button>

        <button
          onClick={() => onFilterChange('unread')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all md:px-6 md:text-sm',
            filter === 'unread'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-100'
          )}
        >
          Unread
          {unreadCount > 0 && (
            <span
              className={cn(
                'flex size-5 items-center justify-center rounded-full text-[10px]',
                filter === 'unread' ? 'bg-white text-primary' : 'bg-primary text-white'
              )}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TYPE_OPTIONS.map((type) => (
          <button
            key={type}
            onClick={() => onTypeFilterChange(type)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all',
              typeFilter === type
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-primary/30'
            )}
          >
            {type === 'any' ? 'All types' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
    </>
  );
}
