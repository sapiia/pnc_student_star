import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Star, 
  TrendingUp, 
  AlertCircle, 
  Smile, 
  Search, 
  Filter, 
  ChevronRight, 
  Bell,
  ChevronLeft
} from 'lucide-react';

import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';

import { motion, AnimatePresence } from 'motion/react';
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
  message: string;
  is_read: number;
  created_at?: string;
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

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const [selectedGen, setSelectedGen] = useState('All Generations');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'gen' | 'class' | null>(null);



  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

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
      const [usersResponse, evaluationsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/users`),
        fetch(`${API_BASE_URL}/evaluations`)
      ]);

      const usersData = await usersResponse.json().catch(() => []);
      const evaluationsData = await evaluationsResponse.json().catch(() => []);

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
            .sort((a, b) => a.name.localeCompare(b.name))
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

  const gens = useMemo(() => ['All Generations', ...Array.from(new Set(students.map(s => s.generation))).sort()], [students]);
  const classes = useMemo(() => {
    const scopedStudents = selectedGen === 'All Generations' ? students : students.filter(s => s.generation === selectedGen);
    return ['All Classes', ...Array.from(new Set(scopedStudents.map(s => s.class))).sort()];
  }, [selectedGen, students]);

  useEffect(() => {
    if (!gens.includes(selectedGen)) setSelectedGen('All Generations');
    if (!classes.includes(selectedClass)) setSelectedClass('All Classes');
  }, [gens, classes, selectedGen, selectedClass]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return students.filter(student => {
      const matchesGen = selectedGen === 'All Generations' || student.generation === selectedGen;
      const matchesClass = selectedClass === 'All Classes' || student.class === selectedClass;
      const matchesSearch = !normalizedQuery || 
                           student.name.toLowerCase().includes(normalizedQuery) || 
                           student.studentId.toLowerCase().includes(normalizedQuery);
      return matchesGen && matchesClass && matchesSearch;
    });
  }, [students, selectedGen, selectedClass, searchQuery]);


  const unreadNotificationCount = notifications.filter(n => Number(n.is_read) !== 1).length;

  const STATS = useMemo(() => {
    // Only compile stats based on filteredStudents
    const ratedStudents = filteredStudents.filter(s => s.rating !== null);
    
    // Class Avg Stars
    let avgScore = 0;
    if (ratedStudents.length > 0) {
      const sum = ratedStudents.reduce((acc, curr) => acc + (curr.rating as number), 0);
      avgScore = sum / ratedStudents.length;
    }

    // Evaluation Rate
    let evalRate = 0;
    if (filteredStudents.length > 0) {
      evalRate = (ratedStudents.length / filteredStudents.length) * 100;
    }

    // Needs Attention
    const needsAttentionCount = ratedStudents.filter(s => (s.rating as number) < 3).length;

    // Overall Feeling
    let feeling = 'No Data';
    if (ratedStudents.length > 0) {
       if (avgScore >= 4) feeling = 'Positive';
       else if (avgScore >= 3) feeling = 'Neutral';
       else feeling = 'Struggling';
    }

    return [
      { label: 'Avg Feedback Stars', value: avgScore.toFixed(1), total: '/5.0', trend: '', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
      { label: 'Evaluation Rate', value: `${Math.round(evalRate)}%`, total: '', trend: '', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/5' },
      { label: 'Needs Attention', value: String(needsAttentionCount), total: 'Students', trend: '', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50', actionLabel: 'View Detail', onAction: () => navigate('/teacher/attention') },
      { label: 'Overall Feeling', value: feeling, total: '', trend: '', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];
  }, [filteredStudents]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TeacherMobileNav />
        {/* Header */}
        <header className="h-auto min-h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-2 md:py-0 flex items-center justify-between shrink-0 z-10">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">Teacher Overview</h1>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate">Monitor student well-being.</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-2">
            <div className="flex items-center gap-1 md:gap-2 bg-slate-100 p-1 rounded-xl relative scale-90 md:scale-100 origin-right">
              {/* GEN Filter */}
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'gen' ? null : 'gen')}
                  className={cn(
                    "px-2 md:px-3 py-1 md:py-1.5 rounded-lg shadow-sm text-[10px] md:text-xs font-bold transition-all whitespace-nowrap",
                    activeDropdown === 'gen' ? "bg-primary text-white" : "bg-white text-primary"
                  )}
                >
                  {selectedGen.includes('All') ? 'All Gen' : selectedGen.replace('Gen ', 'GEN ')}
                </button>
                <AnimatePresence>
                  {activeDropdown === 'gen' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 md:left-0 mt-2 w-36 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                    >
                      {gens.map(gen => (
                        <button 
                          key={gen}
                          onClick={() => { setSelectedGen(gen); setActiveDropdown(null); }}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                        >
                          {gen}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CLASS Filter */}
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'class' ? null : 'class')}
                  className={cn(
                    "px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap",
                    activeDropdown === 'class' ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:bg-white/50"
                  )}
                >
                  {selectedClass === 'All Classes' ? 'All Class' : selectedClass}
                </button>
                <AnimatePresence>
                  {activeDropdown === 'class' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 md:left-0 mt-2 w-32 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                    >
                      {classes.map(cls => (
                        <button 
                          key={cls}
                          onClick={() => { setSelectedClass(cls); setActiveDropdown(null); }}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                        >
                          {cls}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
            {/* Stats Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                 {[1,2,3,4].map((i) => (
                   <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-32 animate-pulse" />
                 ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                {STATS.map((stat, idx) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn("p-2 rounded-xl", stat.bg, stat.color)}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      {'actionLabel' in stat && stat.actionLabel ? (
                        <button 
                          onClick={(stat as any).onAction}
                          className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-bold text-rose-600 hover:text-white hover:border-rose-500 hover:bg-rose-500 transition-all shadow-sm"
                        >
                          {(stat as any).actionLabel}
                        </button>
                      ) : (
                        <span className={cn("text-xs font-bold", stat.color)}>{stat.trend}</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-black text-slate-900">
                      {stat.value}
                      {stat.total && <span className="text-sm font-medium text-slate-400 ml-1">{stat.total}</span>}
                    </h3>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Urgent Alert */}
            {!isLoading && STATS[2].value !== '0' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-50 border border-rose-100 p-4 lg:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 md:size-12 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-200 shrink-0">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-900 text-sm lg:text-base">Urgent Alerts</h4>
                    <p className="text-xs lg:text-sm text-rose-700 leading-tight">
                      {STATS[2].value} students have an average score below 3 stars. Intervention is recommended.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/teacher/students')}
                  className="bg-rose-500 text-white px-6 py-2 lg:py-2.5 rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all text-sm shrink-0 lg:w-auto w-full"
                >
                  Review Students
                </button>
              </motion.div>
            )}

            {/* Student Performance List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-base md:text-lg font-bold text-slate-900">Student Performance List</h3>
                <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search students..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none w-full sm:w-64"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Avg Rating</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Last Evaluation</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-slate-400">
                          Loading students data...
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-slate-400">
                          No students matching your search criteria.
                        </td>
                      </tr>
                    ) : filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full overflow-hidden shrink-0">
                              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{student.name}</p>
                              <p className="text-[10px] text-slate-400">ID: {student.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {student.rating !== null ? (
                            <div className="flex flex-col">
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={cn("w-3 h-3 fill-current", i >= Math.floor(student.rating) && "text-slate-200 fill-slate-200")} />
                                ))}
                              </div>
                              <span className="text-xs font-bold text-slate-900 mt-1">{Number(student.rating).toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 font-bold">--</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                            student.status === 'Healthy' ? "bg-emerald-100 text-emerald-600" : 
                            student.status === 'Action Needed' ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
                          )}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">{student.lastEval}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                navigate(`/teacher/students/${student.id}`);
                              }}
                              className="px-4 py-1.5 text-xs font-bold text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
                            >
                              View Profile
                            </button>
                            <button 
                              onClick={() => navigate('/teacher/messages', { state: { selectedContactId: student.id } })}
                              className={cn(
                                "px-4 py-1.5 text-xs font-bold text-white rounded-lg shadow-sm transition-all",
                                student.status === 'Action Needed' ? "bg-rose-500 hover:bg-rose-600 shadow-rose-100" : "bg-slate-800 hover:bg-slate-900"
                              )}
                            >
                              Message
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!isLoading && filteredStudents.length > 0 && (
                <div className="p-4 md:p-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-500">Showing {filteredStudents.length} students</p>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-[10px] font-bold text-slate-400 hover:bg-slate-100 rounded-lg px-3 transition-colors">
                      Previous
                    </button>
                    <button className="p-2 text-[10px] font-bold text-slate-400 hover:bg-slate-100 rounded-lg px-3 transition-colors">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


