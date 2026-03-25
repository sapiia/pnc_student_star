import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import CriterionDetailDrawer from '../../components/teacher/students/CriterionDetailDrawer';
import DeleteFeedbackModal from '../../components/teacher/students/DeleteFeedbackModal';
import StudentFiltersBar from '../../components/teacher/students/StudentFiltersBar';
import StudentListPageHeader from '../../components/teacher/students/StudentListPageHeader';
import StudentListTopBar from '../../components/teacher/students/StudentListTopBar';
import StudentPerformancePanel from '../../components/teacher/students/StudentPerformancePanel';
import StudentTable from '../../components/teacher/students/StudentTable';
import { useTeacherIdentity } from '../../hooks/useTeacherIdentity';
import { useTeacherStudentConversation } from '../../hooks/useTeacherStudentConversation';
import { useTeacherStudentListData } from '../../hooks/useTeacherStudentListData';
import type { CriterionDetail } from '../../lib/teacher/types';

type StudentListRouteState = {
  selectedStudentId?: number;
  openPerformance?: boolean;
};

export default function TeacherStudentListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCriterion, setActiveCriterion] = useState<CriterionDetail | null>(null);
  const { teacherId } = useTeacherIdentity({ defaultName: 'Your teacher' });
  const {
    students,
    filteredStudents,
    selectedStudent,
    selectedCriteria,
    radarData,
    generationOptions,
    classOptions,
    selectedGeneration,
    selectedClass,
    selectedGender,
    searchQuery,
    isLoading,
    loadError,
    isPerformanceOpen,
    teacherMaxFeedbackCharacters,
    globalRatingScale,
    setSelectedId,
    setSelectedClass,
    setSelectedGender,
    setSearchQuery,
    setIsPerformanceOpen,
    clearFilters,
    updateGeneration,
    openPerformanceForStudent,
  } = useTeacherStudentListData();
  const {
    unreadNotificationCount,
    unreadReplyCountByStudent,
    conversationMessages,
    feedbackDraft,
    feedbackError,
    feedbackSuccess,
    isSubmittingFeedback,
    isMarkingReplyReadId,
    replyToMessage,
    latestTeacherFeedback,
    isDeletingFeedbackId,
    pendingDeleteFeedbackId,
    setFeedbackDraft,
    setReplyToMessage,
    setPendingDeleteFeedbackId,
    handleSubmitFeedback,
    handleHideFeedbackForMe,
    handleDeleteFeedbackForEveryone,
    confirmDeleteFeedbackForEveryone,
    handleMarkReplyAsRead,
  } = useTeacherStudentConversation({
    teacherId,
    selectedStudent,
    teacherMaxFeedbackCharacters,
  });

  const passedState = location.state as StudentListRouteState | null;

  useEffect(() => {
    if (students.length === 0 || !passedState?.selectedStudentId) {
      return;
    }

    setSelectedId(passedState.selectedStudentId);
    if (passedState.openPerformance) {
      setIsPerformanceOpen(true);
    }

    navigate(location.pathname, { replace: true, state: {} });
  }, [
    students.length,
    passedState?.selectedStudentId,
    passedState?.openPerformance,
    navigate,
    location.pathname,
    setSelectedId,
    setIsPerformanceOpen,
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <TeacherMobileNav />
        <StudentListTopBar
          searchQuery={searchQuery}
          unreadNotificationCount={unreadNotificationCount}
          onSearchChange={setSearchQuery}
          onNavigateHome={() => navigate('/teacher/dashboard')}
          onOpenNotifications={() => navigate('/teacher/notifications')}
        />

        <div className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8">
          <div className="mx-auto max-w-[1600px]">
            <StudentListPageHeader />

            <div className="flex flex-col items-start gap-8 lg:flex-row">
              <div className="w-full flex-1 space-y-6 overflow-hidden">
                <StudentFiltersBar
                  selectedGeneration={selectedGeneration}
                  selectedClass={selectedClass}
                  selectedGender={selectedGender}
                  generationOptions={generationOptions}
                  classOptions={classOptions}
                  onGenerationChange={updateGeneration}
                  onClassChange={setSelectedClass}
                  onGenderChange={setSelectedGender}
                  onClearFilters={clearFilters}
                />

                <StudentTable
                  filteredStudents={filteredStudents}
                  selectedStudentId={selectedStudent?.id ?? null}
                  unreadReplyCountByStudent={unreadReplyCountByStudent}
                  isLoading={isLoading}
                  loadError={loadError}
                  onOpenOverview={openPerformanceForStudent}
                  onViewProfile={(studentId) => navigate(`/teacher/students/${studentId}`)}
                  onMessageStudent={(student) =>
                    navigate('/teacher/messages', {
                      state: {
                        selectedContactId: student.id,
                        selectedContactName: student.name,
                        selectedContactAvatar: student.avatar,
                        selectedContactRole: 'Student',
                        selectedContactType: 'Student',
                        selectedContactStudentId: student.studentId,
                      },
                    })
                  }
                />
              </div>

              <StudentPerformancePanel
                isOpen={isPerformanceOpen}
                selectedStudent={selectedStudent}
                radarData={radarData}
                selectedCriteria={selectedCriteria}
                globalRatingScale={globalRatingScale}
                conversationMessages={conversationMessages}
                replyToMessage={replyToMessage}
                feedbackDraft={feedbackDraft}
                teacherMaxFeedbackCharacters={teacherMaxFeedbackCharacters}
                latestTeacherFeedback={latestTeacherFeedback}
                feedbackError={feedbackError}
                feedbackSuccess={feedbackSuccess}
                isSubmittingFeedback={isSubmittingFeedback}
                canSubmitFeedback={Boolean(selectedStudent) && Boolean(teacherId) && !isSubmittingFeedback}
                isDeletingFeedbackId={isDeletingFeedbackId}
                isMarkingReplyReadId={isMarkingReplyReadId}
                onClose={() => setIsPerformanceOpen(false)}
                onSelectCriterion={setActiveCriterion}
                onReplyToMessage={setReplyToMessage}
                onCancelReply={() => setReplyToMessage(null)}
                onHideFeedback={handleHideFeedbackForMe}
                onDeleteFeedback={handleDeleteFeedbackForEveryone}
                onMarkReplyRead={handleMarkReplyAsRead}
                onDraftChange={setFeedbackDraft}
                onSubmitFeedback={handleSubmitFeedback}
              />
            </div>
          </div>
        </div>
      </main>

      <DeleteFeedbackModal
        pendingDeleteFeedbackId={pendingDeleteFeedbackId}
        isDeletingFeedbackId={isDeletingFeedbackId}
        onCancel={() => setPendingDeleteFeedbackId(null)}
        onConfirm={confirmDeleteFeedbackForEveryone}
      />

      <CriterionDetailDrawer
        activeCriterion={activeCriterion}
        maxStars={globalRatingScale}
        onClose={() => setActiveCriterion(null)}
      />
    </div>
  );
}
