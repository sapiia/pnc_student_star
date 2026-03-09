import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  AlertCircle, 
  Search, 
  ChevronLeft,
  Bell,
  Star,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { getRealtimeSocket, type NotificationRealtimePayload } from '../../lib/realtime';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

type ApiUser = {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  student_id?: string;
  resolved_student_id?: string;
  class?: string;
  gender?: string;
  profile_image?: string;
};

type EvaluationRecord = {
  id: number;
  user_id?: number;
  average_score?: number;
  rating_scale?: number;
  submitted_at?: string;
  created_at?: string;
};

type NotificationRecord = {
  id: number;
  user_id: number;
  is_read: number;
};

const toDisplayName = (user: ApiUser) => {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return String(user.name || '').trim() || fullName || String(user.email || 'Student').trim();
};

const extractGeneration = (user: ApiUser) => {
  const classText = String(user.class || '').trim();
  const classMatch = classText.match(/gen\s*(\d{4})/i);
  if (classMatch) return `Gen ${classMatch[1]}`;

  const studentId = String(user.student_id || user.resolved_student_id || '').trim();
  const studentIdMatch = studentId.match(/^(\d{4})-/);
  if (studentIdMatch) return `Gen ${studentIdMatch[1]}`;

  return 'Unknown Gen';
};

const extractClassName = (user: ApiUser) => {
  const classText = String(user.class || '').trim();
  const plainClass = classText.replace(/gen\s*\d{4}/i, '').trim();
  if (plainClass) {
    if (plainClass.match(/^[A-G]$/i)) {
      if (classText.toLowerCase().includes('web')) return `WEB ${plainClass.toUpperCase()}`;
      if (classText.toLowerCase().includes('mobile')) return `MOBILE ${plainClass.toUpperCase()}`;
      return `Class ${plainClass.toUpperCase()}`;
    }
    return plainClass.toUpperCase();
  }
  return 'Unassigned';
};

const getEvaluationSortValue = (evaluation: EvaluationRecord) => {
  const submittedAt = evaluation.submitted_at;
  const createdAt = evaluation.created_at;
  
  if (submittedAt) return new Date(submittedAt).getTime();
  if (createdAt) return new Date(createdAt).getTime();
  return 0;
};

const formatShortDate = (value?: string) => {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export default function TeacherAttentionStudentsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [globalRatingScale, setGlobalRatingScale] = useState(5);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return;
      const authUser = JSON.parse(raw);
      const resolvedTeacherId = Number(authUser?.id);
      if (Number.isInteger(resolvedTeacherId) && resolvedTeacherId > 0) {
        setTeacherId(resolvedTeacherId);
      }
    } catch {
      setTeacherId(null);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersResponse, evaluationsResponse, criteriaConfigResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/users`),
        fetch(`${API_BASE_URL}/evaluations`),
        fetch(`${API_BASE_URL}/settings/evaluation-criteria`)
      ]);

      const usersData = await usersResponse.json().catch(() => []);
      const evaluationsData = await evaluationsResponse.json().catch(() => []);
      const criteriaConfigData = await criteriaConfigResponse.json().catch(() => ({}));

      const nextRatingScale = Math.max(1, Number(criteriaConfigData?.ratingScale || 5));
      setGlobalRatingScale(nextRatingScale);

      const latestEvaluationByUser = new Map<number, EvaluationRecord>();
      if (Array.isArray(evaluationsData)) {
        [...evaluationsData as EvaluationRecord[]]
          .sort((left, right) => getEvaluationSortValue(right) - getEvaluationSortValue(left))
          .forEach((evaluation) => {
            const userId = Number(evaluation.user_id);
            if (Number.isInteger(userId) && userId > 0 && !latestEvaluationByUser.has(userId)) {
              latestEvaluationByUser.set(userId, evaluation);
            }
          });
      }

      const mappedStudents = Array.isArray(usersData)
        ? (usersData as ApiUser[])
            .filter((user) => String(user.role || '').trim().toLowerCase() === 'student')
            .map((user) => {
              const latestEvaluation = latestEvaluationByUser.get(Number(user.id)) || null;
              const averageScore = latestEvaluation && Number.isFinite(Number(latestEvaluation.average_score))
                ? Number(latestEvaluation.average_score)
                : null;
              
              let status = 'No Data';
              if (averageScore !== null) {
                if (averageScore < 3) status = 'Action Needed';
                else status = 'Healthy';
              }

              return {
                id: Number(user.id),
                studentId: String(user.student_id || user.resolved_student_id || '').trim() || `STU-${user.id}`,
                name: toDisplayName(user),
                avatar: String(user.profile_image || '').trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${toDisplayName(user)}`,
                generation: extractGeneration(user),
                class: extractClassName(user),
                rating: averageScore,
                status: status,
                lastEval: latestEvaluation ? formatShortDate(latestEvaluation.submitted_at || latestEvaluation.created_at) : 'No Data',
              };
            })
            // Only keep students who strictly "Need Attention" for this dedicated page
            .filter(student => student.status === 'Action Needed')
            .sort((a, b) => {
               // sort by lowest rating first
               if (a.rating !== null && b.rating !== null) {
                  return a.rating - b.rating;
               }
               return a.name.localeCompare(b.name);
            })
        : [];

      setStudents(mappedStudents);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const loadNotifications = useCallback(async () => {
    if (!teacherId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/user/${teacherId}`);
      const data = await response.json().catch(() => []);
      if (response.ok && Array.isArray(data)) {
        setNotifications(data);
      }
    } catch {
      // Ignore
    }
  }, [teacherId]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!teacherId) return;
    const socket = getRealtimeSocket();
    const subscription = { userId: teacherId };
    const handleNotificationEvent = (payload: NotificationRealtimePayload = {}) => {
      if (Number(payload.userId) !== teacherId) return;
      void loadNotifications();
    };

    socket.emit('notification:subscribe', subscription);
    socket.on('notification:created', handleNotificationEvent);
    socket.on('notification:updated', handleNotificationEvent);
    socket.on('notification:deleted', handleNotificationEvent);

    return () => {
      socket.emit('notification:unsubscribe', subscription);
      socket.off('notification:created', handleNotificationEvent);
      socket.off('notification:updated', handleNotificationEvent);
      socket.off('notification:deleted', handleNotificationEvent);
    };
  }, [loadNotifications, teacherId]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return students.filter(student => {
      const matchesSearch = !normalizedQuery || 
                           student.name.toLowerCase().includes(normalizedQuery) || 
                           student.studentId.toLowerCase().includes(normalizedQuery) ||
                           student.class.toLowerCase().includes(normalizedQuery);
      return matchesSearch;
    });
  }, [students, searchQuery]);

  const unreadNotificationCount = notifications.filter(n => Number(n.is_read) !== 1).length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TeacherMobileNav />
        {/* Header */}
        <header className="h-auto min-h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-2 md:py-0 flex items-center justify-between shrink-0 z-10">
          <div className="min-w-0 flex items-center gap-4">
            <button 
              onClick={() => navigate('/teacher/dashboard')}
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-black text-rose-600 truncate flex items-center gap-2">
                <AlertCircle className="w-5 h-5 hidden sm:block" /> Needs Attention
              </h1>
              <p className="text-[10px] md:text-xs text-slate-500 font-bold truncate">Students requiring immediate support.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-2">
            <div className="relative flex-1 sm:flex-none hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-1.5 md:py-2 bg-slate-100 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500/20 outline-none w-40 md:w-64 transition-all"
              />
            </div>
            <button 
              onClick={() => navigate('/teacher/notifications')}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative shrink-0"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 md:min-w-5 h-4 md:h-5 px-1 rounded-full bg-rose-500 text-white text-[8px] md:text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-[1200px] mx-auto space-y-6 md:space-y-8">

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-rose-900 mb-2">Priority Intervention List</h2>
                    <p className="text-sm text-rose-700 font-medium">
                        These {students.length} students have recorded an average self-evaluation rating below 3.0 stars. Prompt coaching and direct messaging is strongly recommended.
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 text-center shrink-0 min-w-32">
                    <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Total</p>
                    <p className="text-3xl font-black text-rose-700">{students.length}</p>
                </div>
            </div>

            {/* Mobile Search Bar (Only visible on SM and below) */}
            <div className="relative sm:hidden block w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, ID or class..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white shadow-sm border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 outline-none w-full transition-all block"
              />
            </div>

            {/* Student Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {isLoading ? (
                  [...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl p-6 min-h-48 border border-slate-100 shadow-sm animate-pulse" />
                  ))
              ) : filteredStudents.length === 0 ? (
                  <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
                      <div className="size-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <AlertCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">No Students Found</h3>
                      <p className="text-sm text-slate-500">There are no students requiring attention matching your search.</p>
                  </div>
              ) : filteredStudents.map((student, idx) => (
                  <motion.div 
                    key={student.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-rose-100 shadow-sm shadow-rose-100/50 hover:shadow-md hover:border-rose-300 transition-all overflow-hidden flex flex-col"
                  >
                        <div className="p-6 flex items-start gap-4">
                            <div className="size-14 rounded-full overflow-hidden border-2 border-rose-100 shrink-0 relative">
                                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-rose-500/10 mix-blend-multiply"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-slate-900 truncate pr-4">{student.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase tracking-wider">{student.generation}</span>
                                    <span className="text-xs font-bold text-slate-500">{student.class}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-wider uppercase">ID: {student.studentId}</p>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Avg Score</p>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex text-amber-400">
                                        {[...Array(globalRatingScale)].map((_, i) => (
                                            <Star key={i} className={cn("w-3.5 h-3.5 fill-current", i >= Math.floor(student.rating) && "text-slate-200 fill-slate-200")} />
                                        ))}
                                    </div>
                                    <span className="text-sm font-black text-rose-600">{Number(student.rating).toFixed(1)}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Last Eval</p>
                                <p className="text-xs font-bold text-slate-700">{student.lastEval}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-white mt-auto flex gap-3">
                            <button 
                                onClick={() => navigate(`/teacher/students/${student.id}`)}
                                className="flex-1 py-2.5 bg-white border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all"
                            >
                                Profile
                            </button>
                            <button 
                                onClick={() => navigate('/teacher/messages', { state: { selectedContactId: student.id } })}
                                className="flex-1 py-2.5 bg-rose-600 border-2 border-rose-600 hover:bg-rose-700 hover:border-rose-700 text-white flex justify-center items-center gap-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/20"
                            >
                                <MessageSquare className="w-4 h-4" /> Message
                            </button>
                        </div>
                  </motion.div>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
