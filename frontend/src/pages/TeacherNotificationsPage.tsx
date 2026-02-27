import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  MessageSquare, 
  User, 
  ShieldCheck, 
  ChevronRight, 
  Search,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Trash2
} from 'lucide-react';
import TeacherSidebar from '../components/TeacherSidebar';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useState } from 'react';

type NotificationType = 'message' | 'system' | 'alert';

interface Notification {
  id: string;
  type: NotificationType;
  sender: {
    name: string;
    role: 'Student' | 'Admin' | 'Teacher';
    avatar: string;
  };
  content: string;
  time: string;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'message',
    sender: {
      name: 'Dany Chan',
      role: 'Student',
      avatar: 'https://picsum.photos/seed/dany/100/100'
    },
    content: 'sent you a message: "Teacher, I have a question about my evaluation results."',
    time: '2 mins ago',
    isRead: false
  },
  {
    id: '2',
    type: 'message',
    sender: {
      name: 'Admin Sarah',
      role: 'Admin',
      avatar: 'https://picsum.photos/seed/sarah/100/100'
    },
    content: 'sent you a message: "Please review the Q4 evaluation schedule for Gen 2026."',
    time: '1 hour ago',
    isRead: false
  },
  {
    id: '3',
    type: 'message',
    sender: {
      name: 'Teacher Sokha',
      role: 'Teacher',
      avatar: 'https://picsum.photos/seed/sokha/100/100'
    },
    content: 'sent you a message: "Can we discuss the student performance in WEB A?"',
    time: '3 hours ago',
    isRead: true
  },
  {
    id: '4',
    type: 'alert',
    sender: {
      name: 'System',
      role: 'Admin',
      avatar: 'https://picsum.photos/seed/system/100/100'
    },
    content: 'New urgent alert: 3 students in Gen 2026 need immediate attention.',
    time: '5 hours ago',
    isRead: true
  },
  {
    id: '5',
    type: 'message',
    sender: {
      name: 'Leakna Roeun',
      role: 'Student',
      avatar: 'https://picsum.photos/seed/leakna/100/100'
    },
    content: 'sent you a message: "Thank you for the feedback, teacher!"',
    time: 'Yesterday',
    isRead: true
  }
];

export default function TeacherNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : !n.isRead
  );

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={() => navigate('/teacher/dashboard')} className="hover:text-primary">Home</button>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-slate-900">Notifications</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search notifications..." 
                className="w-64 pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[800px] mx-auto">
            <header className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
                <p className="text-slate-500 mt-2">Stay updated with messages and alerts from students and staff.</p>
              </div>
              <button 
                onClick={markAllAsRead}
                className="text-sm font-bold text-primary hover:underline"
              >
                Mark all as read
              </button>
            </header>

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => setFilter('all')}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                  filter === 'all' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
                )}
              >
                All Notifications
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  filter === 'unread' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
                )}
              >
                Unread
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className={cn(
                    "size-5 rounded-full flex items-center justify-center text-[10px]",
                    filter === 'unread' ? "bg-white text-primary" : "bg-primary text-white"
                  )}>
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
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
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {notification.time}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              {!notification.isRead && (
                                <button 
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Mark as read"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                onClick={() => deleteNotification(notification.id)}
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
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredNotifications.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                  <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No notifications</h3>
                  <p className="text-slate-500 text-sm mt-1">You're all caught up! Check back later for updates.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
