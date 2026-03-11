import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, Settings, Shield, Users } from 'lucide-react';
import { motion } from 'motion/react';
import AdminSidebar from '../components/layout/sidebar/AdminSidebar';
import AdminMobileNav from '../components/AdminMobileNav';
import { cn } from '../lib/utils';

type ApiUser = {
  id: number;
  role?: string | null;
};

type NotificationItem = {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const normalizeRole = (value: string | null | undefined) => String(value || '').trim().toLowerCase();

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      const authUser = raw ? JSON.parse(raw) : null;
      const resolvedId = Number(authUser?.id);
      if (Number.isInteger(resolvedId) && resolvedId > 0) setAdminId(resolvedId);
    } catch {
      setAdminId(null);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data = await response.json().catch(() => []);
      if (!response.ok) throw new Error((data as any)?.error || 'Failed to load users.');
      setUsers(Array.isArray(data) ? (data as ApiUser[]) : []);
    } catch (loadError) {
      setUsers([]);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load users.');
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!adminId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/user/${adminId}`);
      const data = await response.json().catch(() => []);
      if (!response.ok) return;
      setNotifications(Array.isArray(data) ? (data as NotificationItem[]) : []);
    } catch {
      setNotifications([]);
    }
  }, [adminId]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadUsers(), loadNotifications()])
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, [loadNotifications, loadUsers]);

  const counts = useMemo(() => {
    const next = { students: 0, teachers: 0, admins: 0 };
    for (const user of users) {
      const role = normalizeRole(user.role);
      if (role === 'student') next.students += 1;
      else if (role === 'teacher') next.teachers += 1;
      else if (role === 'admin') next.admins += 1;
    }
    return next;
  }, [users]);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => Number(n.is_read) !== 1).length,
    [notifications],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <AdminMobileNav />

        <header className="h-auto min-h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-4 md:px-6 lg:px-8 py-3 md:py-0 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-black text-slate-900">Admin Dashboard</h1>
            <p className="text-xs text-slate-500 font-bold hidden md:block">Overview and quick actions.</p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/notifications')}
            className="relative size-10 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 ? (
              <span className="absolute top-2.5 right-2.5 size-2 bg-rose-500 rounded-full ring-2 ring-white" />
            ) : null}
          </button>
        </header>

        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 pb-24 md:pb-8">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                label: 'Students',
                value: counts.students,
                icon: Users,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                onClick: () => navigate('/admin/users'),
              },
              {
                label: 'Teachers',
                value: counts.teachers,
                icon: Shield,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                onClick: () => navigate('/admin/users'),
              },
              {
                label: 'Messages',
                value: 'Inbox',
                icon: MessageSquare,
                color: 'text-violet-600',
                bg: 'bg-violet-50',
                onClick: () => navigate('/admin/messages'),
              },
              {
                label: 'Settings',
                value: 'Manage',
                icon: Settings,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                onClick: () => navigate('/admin/settings'),
              },
            ].map((card) => (
              <motion.button
                key={card.label}
                type="button"
                onClick={card.onClick}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left p-6',
                  isLoading && 'opacity-70',
                )}
              >
                <div className="flex items-start justify-between">
                  <div className={cn('size-12 rounded-xl flex items-center justify-center', card.bg, card.color)}>
                    <card.icon className="w-6 h-6" />
                  </div>
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
                <p className="mt-1 text-3xl font-black text-slate-900">{card.value}</p>
              </motion.button>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Next Steps</h2>
            <div className="mt-4 flex flex-col md:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/users')}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-5 py-4 text-left transition-colors"
              >
                <p className="text-sm font-black text-slate-900">Manage Users</p>
                <p className="text-xs font-bold text-slate-500 mt-1">Invite, disable, or remove accounts.</p>
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/messages')}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-5 py-4 text-left transition-colors"
              >
                <p className="text-sm font-black text-slate-900">Message Teachers</p>
                <p className="text-xs font-bold text-slate-500 mt-1">Send updates and announcements.</p>
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/settings')}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-5 py-4 text-left transition-colors"
              >
                <p className="text-sm font-black text-slate-900">Configure Settings</p>
                <p className="text-xs font-bold text-slate-500 mt-1">Permissions and evaluation criteria.</p>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

