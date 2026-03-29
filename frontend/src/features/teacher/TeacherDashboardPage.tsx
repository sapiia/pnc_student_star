import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  TrendingUp, 
  AlertCircle,
  MessageSquare,
  User
} from 'lucide-react';

import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import StatsCard from '../../components/teacher/StatsCard';
import TeacherHeader from '../../components/teacher/TeacherHeader';

import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useTeacherIdentity } from '../../hooks/useTeacherIdentity';
import { useTeacherNotifications } from '../../hooks/useTeacherNotifications';
import { 
  API_BASE_URL, 
  DEFAULT_AVATAR,
  toDisplayName, 
  extractGeneration, 
  extractClassNameLegacy,
  getEvaluationSortValue,
  formatShortDateWithTime,
  getStudentStatus,
  normalizeGender,
  resolveAvatarUrl,
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

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const [selectedGen, setSelectedGen] = useState('All Generations');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedGender, setSelectedGender] = useState<GenderOption>('All Genders');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'rating' | 'generation' | 'class' | 'gender' | 'status'>('status');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const { teacherId } = useTeacherIdentity();
  const { unreadCount: unreadNotificationCount } = useTeacherNotifications(teacherId);

  const loadDashboardData = useCallback(async () => {
    if (!teacherId) {
      setStudents([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [usersResponse, evaluationsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/users/teachers/students/${teacherId}`),
        fetch(`${API_BASE_URL}/evaluations`)
      ]);

      let usersData = [];
      if (usersResponse.ok) {
        usersData = await usersResponse.json().catch(() => []);
      } else {
        const fallbackResponse = await fetch(`${API_BASE_URL}/users`);
        usersData = await fallbackResponse.json().catch(() => []);
      }

      const evaluationsData = evaluationsResponse.ok
        ? await evaluationsResponse.json().catch(() => [])
        : [];
      setEvaluations(Array.isArray(evaluationsData) ? evaluationsData : []);

      const studentIdSet = new Set(
        Array.isArray(usersData)
          ? usersData
              .filter((user) => String(user.role || '').trim().toLowerCase() === 'student')
              .map((user) => Number(user.id))
              .filter((id) => Number.isInteger(id) && id > 0)
          : []
      );

      const latestEvaluationByUser = new Map<number, any>();
      if (Array.isArray(evaluationsData)) {
        [...evaluationsData]
          .sort((left, right) => getEvaluationSortValue(right) - getEvaluationSortValue(left))
          .forEach((evaluation: any) => {
            const userId = Number(evaluation.user_id);
            if (
              Number.isInteger(userId) &&
              userId > 0 &&
              studentIdSet.has(userId) &&
              !latestEvaluationByUser.has(userId)
            ) {
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
                avatar: resolveAvatarUrl(String(user.profile_image || '').trim(), DEFAULT_AVATAR),
                generation: extractGeneration(user),
                class: extractClassNameLegacy(user),
                gender: (() => {
                  const normalized = normalizeGender(user.gender);
                  return normalized === 'unknown' ? null : normalized;
                })(),
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
  }, [teacherId]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const gens = useMemo(
    () => Array.from(new Set(students.map(s => s.generation))).filter(Boolean).sort(),
    [students]
  );
  const classes = useMemo(() => {
    const scopedStudents = selectedGen === 'All Generations' ? students : students.filter(s => s.generation === selectedGen);
    return Array.from(new Set(scopedStudents.map(s => s.class))).filter(Boolean).sort();
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
      });
  }, [students, selectedGen, selectedClass, selectedGender, searchQuery]);

  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let aVal, bVal;
      switch (sortKey) {
        case 'name': aVal = a.name; bVal = b.name; break;
        case 'rating': aVal = a.rating ?? -Infinity; bVal = b.rating ?? -Infinity; break;
        case 'generation': aVal = a.generation; bVal = b.generation; break;
        case 'class': aVal = a.class; bVal = b.class; break;
        case 'gender': aVal = a.gender ?? ''; bVal = b.gender ?? ''; break;
        case 'status':
          const statusOrder = { 'Action Needed': 0, 'Healthy': 1, 'No Data': 2 };
          aVal = statusOrder[a.status] ?? 3;
          bVal = statusOrder[b.status] ?? 3;
          break;
        default: return 0;
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredStudents, sortKey, sortDirection]);

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(sortedStudents.length / pageSize);
  const paginatedStudents = sortedStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortedStudents.length, selectedGen, selectedClass, selectedGender, searchQuery]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  const STATS = useMemo(() => {
    const filteredStudentIds = new Set(filteredStudents.map((s) => s.id));
    const scopedEvaluations = evaluations.filter((evaluation) =>
      filteredStudentIds.has(Number(evaluation.user_id))
    );

    const avgScore = scopedEvaluations.length > 0
      ? scopedEvaluations.reduce((sum, evaluation) => sum + Number(evaluation.average_score || 0), 0) / scopedEvaluations.length
      : 0;

    const evaluatedStudents = new Set(scopedEvaluations.map((evaluation) => Number(evaluation.user_id))).size;
    const evalRate = filteredStudents.length > 0 ? (evaluatedStudents / filteredStudents.length) * 100 : 0;

    const ratedStudents = filteredStudents.filter(s => s.rating !== null);
    const needsAttentionCount = ratedStudents.filter(s => (s.rating as number) < 2.5).length;

    return [
      { label: 'Avg Feedback Stars', value: avgScore.toFixed(1), total: '/5.0', trend: '', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
      { label: 'Evaluation Rate', value: `${Math.round(evalRate)}%`, total: '', trend: '', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/5' },
      { label: 'Needs Attention', value: String(needsAttentionCount), total: 'Students', trend: '', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50', actionLabel: 'View Detail', onAction: () => navigate('/teacher/attention') },
    ];
  }, [evaluations, filteredStudents, navigate]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TeacherMobileNav />
        <TeacherHeader
          title="Teacher Overview"
          subtitle="Monitor student well-being"
          showFilters={true}
          showSearch={true}
          searchPlaceholder="Search students..."
          selectedGen={selectedGen}
          selectedClass={selectedClass}
          selectedGender={selectedGender}
          generations={gens}
          classes={classes}
          onGenChange={setSelectedGen}
          onClassChange={setSelectedClass}
          onGenderChange={setSelectedGender}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notificationCount={unreadNotificationCount}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="space-y-6 md:space-y-8 max-w-[1600px] mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 lg:gap-6">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-32 animate-pulse" />
                ))
              ) : (
                STATS.map((stat, idx) => (
                  <StatsCard key={stat.label} {...stat} index={idx} />
                ))
              )}
            </div>

            {/* Alert Banner */}
            {!isLoading && STATS[2].value !== '0' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border border-rose-100 p-4 lg:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 md:size-12 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-200 shrink-0">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-900 text-sm lg:text-base">Urgent Alerts</h4>
                    <p className="text-xs lg:text-sm text-rose-700 leading-tight">
                      {STATS[2].value} students have an average score below 2.5 stars. Intervention is recommended.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/teacher/students')}
                  className="bg-rose-500 text-white px-6 py-2 lg:py-2.5 rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all text-sm shrink-0 lg:w-auto w-full active:scale-95"
                >
                  Review Students
                </button>
              </motion.div>
            )}

            {/* Main Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-slate-100">
                <h3 className="text-base md:text-lg font-bold text-slate-900">Student Performance List</h3>
              </div>
              
              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Gender</th>
                      <th className="px-6 py-4">Cohort</th>
                      <th className="px-6 py-4">Avg Rating</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Last Evaluation</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-20 text-center text-sm font-bold text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            Loading students data...
                          </div>
                        </td>
                      </tr>
                    ) : paginatedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-20 text-center text-sm font-bold text-slate-400">
                          No students matching your search criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-full overflow-hidden border border-slate-100 shrink-0">
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
                              {student.gender || '--'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col leading-tight">
                              <span className="text-xs font-bold text-slate-900">{student.generation || '—'}</span>
                              <span className="text-[10px] text-slate-500">{student.class || 'Unassigned'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {student.rating !== null ? (
                              <div className="flex flex-col">
                                <div className="flex text-amber-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={cn("w-3 h-3 fill-current", i >= Math.floor(student.rating!) && "text-slate-200 fill-slate-200")} />
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
                          <td className="px-6 py-4 text-xs text-slate-500 font-medium">{student.lastEval}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => navigate(`/teacher/students/${student.id}`)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
                              >
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                Profile
                              </button>
                              <button 
                                onClick={() => navigate(`/teacher/messages?contactId=${student.id}`)}
                                className={cn(
                                  "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white rounded-lg shadow-sm transition-all active:scale-95",
                                  student.status === 'Action Needed' ? "bg-rose-500 hover:bg-rose-600 shadow-rose-100" : "bg-slate-800 hover:bg-slate-900"
                                )}
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Message
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Improved Pagination Footer */}
              {!isLoading && filteredStudents.length > 0 && (
                <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs font-medium text-slate-500">
                    Showing <span className="text-slate-900 font-bold">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                    <span className="text-slate-900 font-bold">{Math.min(currentPage * pageSize, filteredStudents.length)}</span> of{" "}
                    <span className="text-slate-900 font-bold">{filteredStudents.length}</span> students
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(pageNum => 
                          pageNum === 1 || 
                          pageNum === totalPages || 
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        )
                        .map((pageNum, idx, array) => (
                          <div key={pageNum} className="flex items-center gap-1">
                            {idx > 0 && array[idx - 1] !== pageNum - 1 && (
                              <span className="text-slate-300 text-xs px-1">...</span>
                            )}
                            <button
                              onClick={() => goToPage(pageNum)}
                              className={cn(
                                "size-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all",
                                currentPage === pageNum 
                                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-110" 
                                  : "text-slate-500 hover:bg-white hover:text-primary border border-transparent hover:border-slate-200"
                              )}
                            >
                              {pageNum}
                            </button>
                          </div>
                        ))}
                    </div>

                    <button 
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 disabled:opacity-30 disabled:cursor-not-allowed bg-white text-primary border border-slate-200 shadow-sm hover:bg-primary hover:text-white rounded-lg transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
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
