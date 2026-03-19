import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertCircle, Search, ArrowLeft, Bell } from 'lucide-react';

import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import StudentCard from '../../components/teacher/StudentCard';

import { motion } from 'motion/react';
import { useTeacherIdentity } from '../../hooks/useTeacherIdentity';
import { useTeacherNotifications } from '../../hooks/useTeacherNotifications';
import { 
  API_BASE_URL, 
  DEFAULT_AVATAR,
  toDisplayName, 
  extractGeneration, 
  extractClassNameLegacy,
  formatShortDateWithTime,
  getEvaluationSortValue,
  getStudentStatus,
  normalizeGender,
  resolveAvatarUrl
} from '../../lib/teacher/utils';
import type { Gender } from '../../lib/teacher/types';

interface StudentData {
  id: number;
  studentId: string;
  name: string;
  avatar: string;
  generation: string;
  className: string;
  gender: Gender;
  rating: number | null;
  status: 'Healthy' | 'Action Needed' | 'No Data';
  lastEval: string;
}

export default function TeacherAttentionStudentsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<StudentData[]>([]);
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

      const studentIdSet = new Set(
        Array.isArray(usersData)
          ? usersData
              .filter((user: any) => String(user.role || '').trim().toLowerCase() === 'student')
              .map((user: any) => Number(user.id))
              .filter((id: number) => Number.isInteger(id) && id > 0)
          : []
      );

      const latestEvaluationByUser = new Map<number, any>();
      if (Array.isArray(evaluationsData)) {
        [...evaluationsData]
          .sort((left: any, right: any) => getEvaluationSortValue(right) - getEvaluationSortValue(left))
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
            .filter((user: any) => String(user.role || '').trim().toLowerCase() === 'student')
            .map((user: any) => {
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
                className: extractClassNameLegacy(user),
                gender: (normalizeGender(user.gender) as Gender) || 'unknown',
                rating: averageScore,
                status: status,
                lastEval: latestEvaluation ? formatShortDateWithTime(latestEvaluation.submitted_at || latestEvaluation.created_at) : 'No Data',
              };
            })
            .filter((student) => student.status === 'Action Needed')
            .sort((a, b) => {
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
  }, [teacherId]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch = !normalizedQuery || 
                           student.name.toLowerCase().includes(normalizedQuery) || 
                           student.studentId.toLowerCase().includes(normalizedQuery) ||
                           student.className.toLowerCase().includes(normalizedQuery);
      return matchesSearch;
    });
  }, [students, searchQuery]);

  const renderTopBar = () => (
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
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TeacherMobileNav />
        {renderTopBar()}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-[1200px] mx-auto space-y-6 md:space-y-8">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-rose-900 mb-2">Priority Intervention List</h2>
                <p className="text-sm text-rose-700 font-medium">
                  Students with an average self-evaluation rating below 2.5 stars. Prompt coaching and direct messaging is strongly recommended.
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 text-center shrink-0 min-w-32">
                <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Total</p>
                <p className="text-3xl font-black text-rose-700">{students.length}</p>
              </div>
            </div>

            <div className="relative sm:hidden w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, ID or class..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white shadow-sm border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 outline-none w-full transition-all block"
              />
            </div>

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
                <StudentCard
                  key={student.id}
                  id={student.id}
                  name={student.name}
                  avatar={student.avatar}
                  studentId={student.studentId}
                  generation={student.generation}
                  className={student.className}
                  gender={student.gender}
                  rating={student.rating}
                  status={student.status}
                  lastEval={student.lastEval}
                  index={idx}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

