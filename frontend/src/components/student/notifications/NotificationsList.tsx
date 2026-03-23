import { AnimatePresence } from 'motion/react';
import { Bell } from 'lucide-react';
import NotificationsItem from './NotificationsItem';
import type { StudentNotificationCard } from './types';

type NotificationsListProps = {
  notifications: StudentNotificationCard[];
  isLoading: boolean;
  activeNotificationId: number | null;
  onOpen: (id: number) => void;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function NotificationsList({
  notifications,
  isLoading,
  activeNotificationId,
  onOpen,
  onMarkRead,
  onDelete,
}: NotificationsListProps) {
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

  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-50">
          <Bell className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No notifications</h3>
        <p className="mt-1 text-sm text-slate-500">
          You're all caught up! Check back later for updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationsItem
            key={notification.id}
            notification={notification}
            isBusy={activeNotificationId === notification.id}
            onOpen={onOpen}
            onMarkRead={onMarkRead}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
