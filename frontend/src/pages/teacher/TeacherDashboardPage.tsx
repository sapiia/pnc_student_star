import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Star, TrendingUp, AlertCircle, Smile, Search } from 'lucide-react';

import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import TeacherHeader from '../../components/teacher/TeacherHeader';
import StatsCard from '../../components/teacher/StatsCard';

import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { getRealtimeSocket, type NotificationRealtimePayload } from '../../lib/realtime';
import { 
  API_BASE_URL, 
  toDisplayName, 
  extractGeneration, 
  extractClassNameLegacy,
  getEvaluationSortValue,
  formatShortDateWithTime,
  getStudentStatus,
  getTeacherIdFromStorage
} from '../../lib/teacher/utils';
import type { GenderOption } from '../../lib/teacher/types';

interface StudentData {
  id: number;
  studentId: string;
  name: string;
  avatar: string;
  generation: string;
  class: string;
  gender: string | null;
  rating: number | null;
  status: 'Healthy' | 'Action Needed' | 'No Data';
  lastEval: string;
}

interface NotificationRecord {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at?: string;
}

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const [selectedGen, setSelectedGen] = useState('All Generations');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedGender, setSelectedGender] = useState<GenderOption>('All Genders');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'gen' | 'class' | 'gender' | null>(null);

  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  useEffect(() => {
    const id = getTeacherIdFromStorage();
    setTeacherId(id);
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

      const latestEvaluationByUser = new Map<number, any>();
      if (Array.isArray(evaluationsData)) {
        [...evaluationsData]
          .sort((left, right) => getEvaluationSortValue(right) - getEvaluationSortValue(left))
          .forEach((evaluation: any) => {
            const userId = Number(evaluation.user_id);
            if (Number.isInteger(userId) && userId > 0 && !latestEvaluationByUser.has(userId)) {
              latestEvaluationByUser.set(userId, evaluation);
            }
          });
      }

      const mappedStudents: StudentData[] = Array.isArray(usersData)
        ? (usersData as any[])
            .filter((user) => String(user.role || '').trim().toLowerCase() === 'student')
            .map((user) => {
              const latestEvaluation = latestEvaluationByUser.get(Number(user.id)) || null;
              const averageScore = latestEvaluation && Number.isFinite(Number(latestEvaluation.average_score))
                ? Number(latestEvaluation.average_score)
                : null;
              
              const status = getStudentStatus(averageScore);

              return {
                id: Number(user.id),
                studentId: String(user.student_id || user.resolved_student_id || '').trim() || `STU-${user.id}`,
                name: toDisplayName(user),
                avatar: String(user.profile_image || '').trim() || 'http://localhost:3001/uploads/logo/star_gmail_logo.jpg',
                generation: extractGeneration(user),
                class: extractClassNameLegacy(user),
                gender: String(user.gender || '').trim().toLowerCase() || null,
                rating: averageScore,
                status: status,
                lastEval: latestEvaluation ? formatShortDateWithTime(latestEvaluation.submitted_at || latestEvaluation.created_at) : 'No Data',
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
    return students
      .filter(student => {
        const matchesGen = selectedGen === 'All Generations' || student.generation === selectedGen;
        const matchesClass = selectedClass === 'All Classes' || student.class === selectedClass;
        const matchesGender = selectedGender === 'All Genders' || 
          (selectedGender === 'Male' && student.gender === 'male') ||
          (selectedGender === 'Female' && student.gender === 'female');
        const matchesSearch = !normalizedQuery || 
                           student.name.toLowerCase().includes(normalizedQuery) || 
                           student.studentId.toLowerCase().includes(normalizedQuery);
        return matchesGen && matchesClass && matchesGender && matchesSearch;
      })
      .sort((a, b) => {
        const aNeedsAttention = a.rating !== null && a.rating < 3;
        const bNeedsAttention = b.rating !== null && b.rating < 3;
        
        if (aNeedsAttention && !bNeedsAttention) return -1;
        if (!aNeedsAttention && bNeedsAttention) return 1;
        
        return a.name.localeCompare(b.name);
      });
  }, [students, selectedGen, selectedClass, selectedGender, searchQuery]);

  const unreadNotificationCount = notifications.filter(n => Number(n.is_read) !== 1).length;

  const STATS = useMemo(() => {
    const ratedStudents = filteredStudents.filter(s => s.rating !== null);
    
    let avgScore = 0;
    if (ratedStudents.length > 0) {
      const sum = ratedStudents.reduce((acc, curr) => acc + (curr.rating as number), 0);
      avgScore = sum / ratedStudents.length;
    }

    let evalRate = 0;
    if (filteredStudents.length > 0) {
      evalRate = (ratedStudents.length / filteredStudents.length) * 100;
    }

    const needsAttentionCount = ratedStudents.filter(s => (s.rating as number) < 3).length;

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
  }, [filteredStudents, navigate]);

  const renderTopBar = () => (
    <header className="h-auto min-h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-2 md:py-0 flex items-center justify-between shrink-0 z-10">
      <div className="min-w-0">
        <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">Teacher Overview</h1>
        <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate">Monitor student well-being.</p>
      </div>
      <div className="flex items-center gap-2 md:gap-4 ml-2">
        <div className="flex items-center gap-1 md:gap-2 bg-slate-100 p-1 rounded-xl relative scale-90 md:scale-100 origin-right">
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'gen' ? null : 'gen')}
              className={cn(
                'px-2 md:px-3 py-1 md:py-1.5 rounded-lg shadow-sm text-[10px] md:text-xs font-bold transition-all whitespace-nowrap',
                activeDropdown === 'gen' ? 'bg-primary text-white' : 'bg-white text-primary'
              )}
            >
              {selectedGen.includes('All') ? 'All Gen' : selectedGen.replace('Gen ', 'GEN ')}
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'class' ? null : 'class')}
              className={cn(
                'px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap',
                activeDropdown === 'class' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-white/50'
              )}
            >
              {selectedClass === 'All Classes' ? 'All Class' : selectedClass}
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'gender' ? null : 'gender')}
              className={cn(
                'px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap',
                activeDropdown === 'gender' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-white/50'
              )}
            >
              {selectedGender === 'All Genders' ? 'All Gender' : selectedGender}
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TeacherMobileNav />
        {renderTopBar()}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-[1200px] mx-auto space-y-6 md:space-y-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                 {[1,2,3,4].map((i) => (
                   <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-32 animate-pulse" />
                 ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                {STATS.map((stat, idx) => (
                  <StatsCard key={stat.label} {...stat} index={idx} />
                ))}
              </div>
            )}

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

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-base md:text-lg font-bold text-slate-900">Student Performance List</h3>
                <div className="relative flex-1 sm:flex-none w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search students..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none w-full"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Gender</th>
                      <th className="px-6 py-4">Avg Rating</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Last Evaluation</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm font-bold text-slate-400">
                          Loading students data...
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm font-bold text-slate-400">
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
                          <span className={cn(
                            "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                            student.gender === 'male' ? "bg-blue-100 text-blue-600" : 
                            student.gender === 'female' ? "bg-pink-100 text-pink-600" : "bg-slate-100 text-slate-500"
                          )}>
                            {student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : '--'}
                          </span>
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
                              onClick={() => navigate(`/teacher/students/${student.id}`)}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

