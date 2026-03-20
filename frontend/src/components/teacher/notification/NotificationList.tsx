import { AnimatePresence } from 'motion/react';
import { Bell } from 'lucide-react';
import NotificationItem from './NotificationItem';
import type { MappedNotification } from '../../../lib/notifications/mapper';

interface NotificationListProps {
  isLoading: boolean;
  error: string;
  notifications: MappedNotification[];
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationList({ isLoading, error, notifications, onMarkRead, onDelete }: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-100 text-rose-700 text-sm font-bold rounded-2xl p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkRead={onMarkRead}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>

      {notifications.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No notifications</h3>
          <p className="text-slate-500 text-sm mt-1">You're all caught up! Check back later for updates.</p>
        </div>
      )}
    </div>
  );
}