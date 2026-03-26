import type {
  NotificationFilter,
  NotificationType,
} from './adminNotifications.types';
import {
  READ_FILTER_OPTIONS,
  TYPE_FILTER_OPTIONS,
} from './adminNotifications.utils';
import { cn } from '../../../lib/utils';

interface AdminNotificationsFiltersProps {
  filter: NotificationFilter;
  totalCount: number;
  typeFilter: NotificationType | 'any';
  unreadCount: number;
  onFilterChange: (value: NotificationFilter) => void;
  onTypeFilterChange: (value: NotificationType | 'any') => void;
}

export default function AdminNotificationsFilters({
  filter,
  totalCount,
  typeFilter,
  unreadCount,
  onFilterChange,
  onTypeFilterChange,
}: AdminNotificationsFiltersProps) {
  const tabCounts: Record<NotificationFilter, number> = {
    all: totalCount,
    unread: unreadCount,
  };

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      {READ_FILTER_OPTIONS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onFilterChange(tab.key)}
          className={cn(
            'flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all',
            filter === tab.key
              ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100',
          )}
        >
          {tab.label}
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-bold',
              filter === tab.key
                ? 'bg-white text-primary'
                : 'bg-slate-100 text-slate-600',
            )}
          >
            {tabCounts[tab.key]}
          </span>
        </button>
      ))}

      <div className="ml-auto flex items-center gap-2">
        {TYPE_FILTER_OPTIONS.map((type) => (
          <button
            key={type}
            onClick={() => onTypeFilterChange(type)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all',
              typeFilter === type
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-primary/30',
            )}
          >
            {type === 'any'
              ? 'All types'
              : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
