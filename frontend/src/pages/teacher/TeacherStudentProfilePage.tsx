import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import CriterionDetailDrawer from '../../components/teacher/students/CriterionDetailDrawer';
import DeleteFeedbackModal from '../../components/teacher/students/DeleteFeedbackModal';
import StudentCriteriaBreakdownCard from '../../components/teacher/students/profile/StudentCriteriaBreakdownCard';
import StudentEvaluationFeedbackCard from '../../components/teacher/students/profile/StudentEvaluationFeedbackCard';
import StudentEvaluationHistoryCard from '../../components/teacher/students/profile/StudentEvaluationHistoryCard';
import StudentPerformanceRadarCard from '../../components/teacher/students/profile/StudentPerformanceRadarCard';
import StudentProfileSummaryCard from '../../components/teacher/students/profile/StudentProfileSummaryCard';
import TeacherStudentProfileTopBar from '../../components/teacher/students/profile/TeacherStudentProfileTopBar';
import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import { useTeacherStudentProfile } from '../../hooks/useTeacherStudentProfile';
import {
  DEFAULT_AVATAR,
  resolveAvatarUrl,
  toDisplayName,
} from '../../lib/teacher/utils';
import type { CriterionDetail } from '../../lib/teacher/types';

function TeacherStudentProfilePageState({
  children,
}: {
  children: any;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      <main className="relative flex flex-1 flex-col overflow-hidden">
        <TeacherMobileNav />
        {children}
      </main>
    </div>
  );
}

export default function TeacherStudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeCriterion, setActiveCriterion] = useState(null as CriterionDetail | null);
  const {
    teacherId,
    student,
    evaluations,
    selectedEvaluation,
    isLoading,
    showEvaluationList,
    teacherMaxFeedbackCharacters,
    globalRatingScale,
    selectedCriteria,
    radarData,
    evaluationFeedback,
    evaluationStudentReplies,
    hiddenFeedbackIds,
    pendingDeleteFeedbackId,
    isDeletingFeedbackId,
    feedbackDraft,
    feedbackError,
    feedbackSuccess,
    isSubmittingFeedback,
    editingFeedbackId,
    editDraft,
    isUpdatingFeedback,
    latestTeacherFeedback,
    setShowEvaluationList,
    setPendingDeleteFeedbackId,
    setFeedbackDraft,
    setEditDraft,
    handleSelectEvaluation,
    handleSubmitFeedback,
    handleHideFeedbackForMe,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleConfirmDelete,
  } = useTeacherStudentProfile(id);

  if (isLoading) {
    return (
      <TeacherStudentProfilePageState>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      </TeacherStudentProfilePageState>
    );
  }

  if (!student) {
    return (
      <TeacherStudentProfilePageState>
        <div className="flex flex-1 flex-col items-center justify-center">
          <AlertCircle className="mb-4 h-16 w-16 text-slate-300" />
          <h2 className="text-xl font-bold text-slate-700">Student Not Found</h2>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 font-bold text-primary hover:underline"
          >
            Go Back
          </button>
        </div>
      </TeacherStudentProfilePageState>
    );
  }

  const studentName = toDisplayName(student);
  const avatarUrl = resolveAvatarUrl(student.profile_image, DEFAULT_AVATAR);
  const studentIdDisplay =
    student.student_id || student.resolved_student_id || `STU-${student.id}`;

  return (
    <TeacherStudentProfilePageState>
      <TeacherStudentProfileTopBar
        studentName={studentName}
        avatarUrl={avatarUrl}
        onBack={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="mx-auto max-w-[1000px] space-y-8">
          <StudentProfileSummaryCard
            student={student}
            studentName={studentName}
            avatarUrl={avatarUrl}
            studentIdDisplay={studentIdDisplay}
            showEvaluationList={showEvaluationList}
            onMessageStudent={() =>
              navigate('/teacher/messages', { state: { selectedContactId: Number(student.id) } })
            }
            onToggleEvaluationList={() => setShowEvaluationList((currentValue) => !currentValue)}
          />

          {showEvaluationList && (
            <StudentEvaluationHistoryCard
              evaluations={evaluations}
              selectedEvaluationId={selectedEvaluation?.id ?? null}
              globalRatingScale={globalRatingScale}
              onSelectEvaluation={handleSelectEvaluation}
            />
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-8 lg:col-span-1">
              <StudentPerformanceRadarCard
                radarData={radarData}
                selectedEvaluation={selectedEvaluation}
                globalRatingScale={globalRatingScale}
              />

              <StudentEvaluationFeedbackCard
                evaluationLabel={selectedEvaluation?.period || 'Evaluation'}
                evaluationFeedback={evaluationFeedback}
                evaluationStudentReplies={evaluationStudentReplies}
                hiddenFeedbackIds={hiddenFeedbackIds}
                teacherId={teacherId}
                teacherMaxFeedbackCharacters={teacherMaxFeedbackCharacters}
                feedbackDraft={feedbackDraft}
                feedbackError={feedbackError}
                feedbackSuccess={feedbackSuccess}
                isSubmittingFeedback={isSubmittingFeedback}
                editingFeedbackId={editingFeedbackId}
                editDraft={editDraft}
                isUpdatingFeedback={isUpdatingFeedback}
                latestTeacherFeedback={latestTeacherFeedback}
                onDraftChange={setFeedbackDraft}
                onEditDraftChange={setEditDraft}
                onSubmitFeedback={handleSubmitFeedback}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onDeleteFeedback={setPendingDeleteFeedbackId}
                onHideFeedback={handleHideFeedbackForMe}
              />
            </div>

            <div className="space-y-8 lg:col-span-1">
              <StudentCriteriaBreakdownCard
                selectedCriteria={selectedCriteria}
                globalRatingScale={globalRatingScale}
                selectedEvaluation={selectedEvaluation}
                onSelectCriterion={setActiveCriterion}
              />
            </div>
          </div>
        </div>
      </div>

      <DeleteFeedbackModal
        pendingDeleteFeedbackId={pendingDeleteFeedbackId}
        isDeletingFeedbackId={isDeletingFeedbackId}
        onCancel={() => setPendingDeleteFeedbackId(null)}
        onConfirm={handleConfirmDelete}
      />

      <CriterionDetailDrawer
        activeCriterion={activeCriterion}
        maxStars={globalRatingScale}
        onClose={() => setActiveCriterion(null)}
      />
    </TeacherStudentProfilePageState>
  );
}
