import {
  Bell,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { motion } from 'motion/react';

import type { AdminNotification } from './adminNotifications.types';
import { formatNotificationTime } from './adminNotifications.utils';
import { cn } from '../../../lib/utils';

interface AdminNotificationCardProps {
  notification: AdminNotification;
  onDelete: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onOpenMessage: (notification: AdminNotification) => void;
}

export default function AdminNotificationCard({
  notification,
  onDelete,
  onMarkAsRead,
  onOpenMessage,
}: AdminNotificationCardProps) {
  const typeIcon =
    notification.type === 'message'
      ? <MessageSquare className="h-3 w-3" />
      : notification.type === 'alert'
        ? <ShieldCheck className="h-3 w-3" />
        : <Bell className="h-3 w-3" />;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'group relative rounded-2xl border bg-white p-4 transition-all',
        notification.isRead
          ? 'border-slate-200 opacity-75'
          : 'border-primary/20 shadow-sm ring-1 ring-primary/5',
      )}
    >
      <div className="flex gap-4">
        <div className="relative shrink-0">
          <div className="size-12 overflow-hidden rounded-full border-2 border-white shadow-sm">
            <img
              src={notification.sender.avatar}
              alt={notification.sender.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div
            className={cn(
              'absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border-2 border-white shadow-sm',
              notification.type === 'message'
                ? 'bg-primary text-white'
                : notification.type === 'alert'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-500 text-white',
            )}
          >
            {typeIcon}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {notification.sender.name}
              </span>
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest',
                  notification.sender.role === 'Student'
                    ? 'bg-blue-50 text-blue-600'
                    : notification.sender.role === 'Admin'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-amber-50 text-amber-600',
                )}
              >
                {notification.sender.role}
              </span>
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest',
                  notification.type === 'message'
                    ? 'bg-primary/10 text-primary'
                    : notification.type === 'alert'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-slate-100 text-slate-600',
                )}
              >
                {notification.type === 'system' ? 'System' : notification.type}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                <Clock className="h-3 w-3" />
                {formatNotificationTime(notification.time)}
              </span>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {!notification.isRead ? (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="rounded-lg p-1.5 text-emerald-500 transition-colors hover:bg-emerald-50"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                ) : null}
                <button
                  onClick={() => onDelete(notification.id)}
                  className="rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <p
            className={cn(
              'text-sm leading-relaxed',
              notification.isRead
                ? 'text-slate-500'
                : 'font-medium text-slate-700',
            )}
          >
            {notification.content}
          </p>
        </div>
      </div>

      {!notification.isRead ? (
        <div className="absolute top-0 left-0 bottom-0 w-1 rounded-l-2xl bg-primary" />
      ) : null}

      {notification.type === 'message' ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => onOpenMessage(notification)}
            className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
          >
            Open message
          </button>
        </div>
      ) : null}
    </motion.div>
  );
}
