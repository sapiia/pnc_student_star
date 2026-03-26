import { Bell } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

import type { AdminNotification } from './adminNotifications.types';
import AdminNotificationCard from './AdminNotificationCard';

interface AdminNotificationsListProps {
  error: string;
  isLoading: boolean;
  notifications: AdminNotification[];
  onDelete: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onOpenMessage: (notification: AdminNotification) => void;
}

export default function AdminNotificationsList({
  error,
  isLoading,
  notifications,
  onDelete,
  onMarkAsRead,
  onOpenMessage,
}: AdminNotificationsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-slate-200" />
                <div className="h-3 w-2/3 rounded bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
        {error}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-50">
          <Bell className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No notifications</h3>
        <p className="mt-1 text-sm text-slate-500">
          You&apos;re all caught up! Check back later for updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <AdminNotificationCard
            key={notification.id}
            notification={notification}
            onDelete={onDelete}
            onMarkAsRead={onMarkAsRead}
            onOpenMessage={onOpenMessage}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
