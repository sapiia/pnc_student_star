import { motion } from 'motion/react';
import {
  Bell,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { StudentNotificationCard } from './types';

type NotificationsItemProps = {
  key?: string | number;
  notification: StudentNotificationCard;
  isBusy: boolean;
  onOpen: (id: number) => void;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function NotificationsItem({
  notification,
  isBusy,
  onOpen,
  onMarkRead,
  onDelete,
}: NotificationsItemProps) {
  const badgeClassName =
    notification.type === 'message'
      ? 'bg-primary text-white'
      : notification.type === 'alert'
        ? 'bg-rose-500 text-white'
        : 'bg-slate-500 text-white';

  const roleClassName =
    notification.senderRole === 'Teacher'
      ? 'bg-amber-50 text-amber-600'
      : 'bg-rose-50 text-rose-600';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onOpen(notification.id)}
      className={cn(
        'group relative cursor-pointer rounded-2xl border bg-white p-4 transition-all',
        notification.isRead
          ? 'border-slate-200 opacity-75'
          : 'border-primary/20 shadow-sm ring-1 ring-primary/5'
      )}
    >
      <div className="flex gap-4">
        <div className="relative shrink-0">
          {notification.senderAvatar ? (
            <div className="size-10 overflow-hidden rounded-full border-2 border-white shadow-sm md:size-12">
              <img
                src={notification.senderAvatar}
                alt={notification.senderName}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-500 shadow-sm md:size-12">
              <Bell className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          )}

          <div
            className={cn(
              'absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-white shadow-sm md:size-6',
              badgeClassName
            )}
          >
            {notification.type === 'message' ? (
              <MessageSquare className="h-2.5 w-2.5 md:h-3 md:w-3" />
            ) : (
              <ShieldCheck className="h-2.5 w-2.5 md:h-3 md:w-3" />
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {notification.senderName}
              </span>
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest',
                  roleClassName
                )}
              >
                {notification.senderRole}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                <Clock className="h-3 w-3" />
                {notification.timeLabel}
              </span>

              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {!notification.isRead && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={(event) => {
                      event.stopPropagation();
                      onMarkRead(notification.id);
                    }}
                    className="rounded-lg p-1.5 text-emerald-500 transition-colors hover:bg-emerald-50 disabled:opacity-60"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-60"
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
              notification.isRead ? 'text-slate-500' : 'font-medium text-slate-700'
            )}
          >
            {notification.content}
          </p>

          {notification.periodLabel ? (
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1">
              <span className="text-[10px] font-bold text-slate-500">
                Evaluation: {notification.periodLabel}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {!notification.isRead && (
        <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-2xl bg-primary" />
      )}
    </motion.div>
  );
}
