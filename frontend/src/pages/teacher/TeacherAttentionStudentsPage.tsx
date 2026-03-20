import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import { useTeacherIdentity } from '../../hooks/useTeacherIdentity';
import { useTeacherNotifications } from '../../hooks/useTeacherNotifications';
import { useAttentionStudents } from '../../components/teacher/attention/useAttentionStudents';
import AttentionPageHeader from '../../components/teacher/attention/AttentionPageHeader';
import AttentionBanner from '../../components/teacher/attention/AttentionBanner';
import StudentGrid from '../../components/teacher/attention/StudentGrid';

export default function TeacherAttentionStudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { teacherId } = useTeacherIdentity();
  const { students, isLoading } = useAttentionStudents(teacherId);
  const { unreadCount: unreadNotificationCount } = useTeacherNotifications(teacherId);

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

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TeacherMobileNav />
        <AttentionPageHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          unreadNotificationCount={unreadNotificationCount}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-[1200px] mx-auto space-y-6 md:space-y-8">
            <AttentionBanner studentCount={students.length} />

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

            <StudentGrid isLoading={isLoading} students={filteredStudents} />
          </div>
        </div>
      </main>
    </div>
  );
}
