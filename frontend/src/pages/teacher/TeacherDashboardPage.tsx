import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTeacherIdentity } from '../../hooks/useTeacherIdentity';
import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import TeacherHeader from '../../components/teacher/TeacherHeader';
import DashboardStats from '../../components/teacher/dashboard/DashboardStats';
import StudentTable from '../../components/teacher/dashboard/StudentTable';
import { useTeacherNotifications } from '../../hooks/useTeacherNotifications';
import { useTeacherDashboardData } from '../../hooks/useTeacherDashboardData';
import { useStudentFilters } from '../../hooks/useStudentFilters';
import ErrorBoundary from '../../components/common/ErrorBoundary';

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const { teacherId, isLoading: identityLoading } = useTeacherIdentity();
  const { students, evaluations, loading: dashboardLoading } =
    useTeacherDashboardData(teacherId);
  const filters = useStudentFilters({ students });
  const { unreadCount: unreadNotificationCount } =
    useTeacherNotifications(teacherId);

  useEffect(() => {
    if (identityLoading) return;
    if (!teacherId) {
      navigate('/', { replace: true });
    }
  }, [teacherId, identityLoading, navigate]);

  if (identityLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

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
          <ErrorBoundary>
            <div className="space-y-6 md:space-y-8 max-w-[1600px] mx-auto">
              <DashboardStats 
                filteredStudents={filters.filteredStudents}
                evaluations={evaluations}
                loading={dashboardLoading}
                onAttentionClick={handleAttention}
              />
              <StudentTable
                students={filters.filteredStudents}
                paginatedStudents={filters.paginatedStudents}
                currentPage={filters.currentPage}
                totalPages={filters.totalPages}
                loading={dashboardLoading}
                onProfile={handleProfile}
                onMessage={handleMessage}
                goToPage={filters.goToPage}
              />
            </div>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

