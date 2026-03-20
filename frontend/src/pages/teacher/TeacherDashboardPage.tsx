import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import TeacherHeader from '../../components/teacher/TeacherHeader';
import DashboardStats from '../../components/teacher/dashboard/DashboardStats';
import StudentTable from '../../components/teacher/dashboard/StudentTable';
import { useTeacherNotifications } from '../../hooks/useTeacherNotifications';
import { useTeacherDashboardData } from '../../hooks/useTeacherDashboardData';
import { useStudentFilters } from '../../hooks/useStudentFilters';
import type { GenderOption } from '../../lib/teacher/types';

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const { students, evaluations, loading: isLoading } = useTeacherDashboardData();
  const filters = useStudentFilters({ students });
  const { unreadCount: unreadNotificationCount } = useTeacherNotifications();

  const handleProfile = (id: number) => navigate(`/teacher/students/${id}`);
  const handleMessage = (id: number) => navigate(`/teacher/messages?contactId=${id}`);
  const handleAttention = () => navigate('/teacher/attention');

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
          selectedGen={filters.selectedGen}
          selectedClass={filters.selectedClass}
          selectedGender={filters.selectedGender}
          generations={filters.gens}
          classes={filters.classes}
          onGenChange={filters.setSelectedGen}
          onClassChange={filters.setSelectedClass}
          onGenderChange={filters.setSelectedGender}
          searchQuery={filters.searchQuery}
          onSearchChange={filters.setSearchQuery}
          notificationCount={unreadNotificationCount}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="space-y-6 md:space-y-8 max-w-[1600px] mx-auto">
            <DashboardStats 
              filteredStudents={filters.filteredStudents}
              evaluations={evaluations}
              loading={isLoading}
              onAttentionClick={handleAttention}
            />
            <StudentTable
              students={filters.filteredStudents}
              paginatedStudents={filters.paginatedStudents}
              currentPage={filters.currentPage}
              totalPages={filters.totalPages}
              loading={isLoading}
              onProfile={handleProfile}
              onMessage={handleMessage}
              goToPage={filters.goToPage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

