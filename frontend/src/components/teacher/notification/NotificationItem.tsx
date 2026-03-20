import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ShieldCheck, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { MappedNotification } from '../../../lib/notifications/mapper';

interface NotificationItemProps {
  notification: MappedNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationItem({ notification, onMarkRead, onDelete }: NotificationItemProps) {
  const navigate = useNavigate();
  const canOpenMessage = typeof notification.sender.id === 'number' && notification.sender.id > 0;

  const formatTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value || '—';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "bg-white p-4 rounded-2xl border transition-all group relative",
        notification.isRead ? "border-slate-200 opacity-75" : "border-primary/20 shadow-sm ring-1 ring-primary/5"
      )}
    >
      <div className="flex gap-4">
        <div className="relative shrink-0">
          <div className="size-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img src={notification.sender.avatar} alt={notification.sender.name} className="w-full h-full object-cover" />
          </div>
          <div className={cn(
            "absolute -bottom-1 -right-1 size-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm",
            notification.type === 'message' ? "bg-primary text-white" :
            notification.type === 'alert' ? "bg-rose-500 text-white" : "bg-slate-500 text-white"
          )}>
            {notification.type === 'message' ? <MessageSquare className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{notification.sender.name}</span>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                notification.sender.role === 'Student' ? "bg-blue-50 text-blue-600" :
                notification.sender.role === 'Admin' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
              )}>
                {notification.sender.role}
              </span>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                notification.type === 'message' ? "bg-primary/10 text-primary" :
                notification.type === 'alert' ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"
              )}>
                {notification.type === 'system' ? 'System' : notification.type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(notification.time)}
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                {!notification.isRead && (
                  <button
                    onClick={() => onMarkRead(notification.id)}
                    className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(notification.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <p className={cn(
            "text-sm leading-relaxed",
            notification.isRead ? "text-slate-500" : "text-slate-700 font-medium"
          )}>
            {notification.content}
          </p>
        </div>
      </div>
      {!notification.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {notification.type === 'message' && canOpenMessage && (
          <button
            onClick={() =>
              navigate('/teacher/messages', {
                state: {
                  selectedContactId: notification.sender.id,
                  selectedContactName: notification.sender.name,
                  selectedContactAvatar: notification.sender.avatar,
                  selectedContactRole: notification.sender.role,
                  selectedContactType: notification.sender.role,
                },
              })
            }
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            Open message
          </button>
        )}
        {notification.type === 'alert' && (
          <button
            onClick={() => navigate('/teacher/attention')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            View alerts
          </button>
        )}
      </div>
    </motion.div>
  );
}
