import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import StudentListTopBar from '../../components/teacher/students/StudentListTopBar';
import StudentFiltersBar from '../../components/teacher/students/StudentFiltersBar';
import StudentTable from '../../components/teacher/students/StudentTable';
import StudentPerformancePanel from '../../components/teacher/students/StudentPerformancePanel';
import DeleteFeedbackModal from '../../components/teacher/students/DeleteFeedbackModal';
import CriterionDetailDrawer from '../../components/teacher/students/CriterionDetailDrawer';
import { useTeacherIdentity } from '../../hooks/useTeacherIdentity';
import { useTeacherFeedbacks } from '../../hooks/useTeacherFeedbacks';
import { useTeacherNotifications } from '../../hooks/useTeacherNotifications';
import {
  API_BASE_URL,
  DEFAULT_AVATAR,
  toDisplayName,
  normalizeGender,
  extractGeneration,
  extractClassName,
  getEvaluationSortValue,
  formatShortDate,
  buildRadarData,
  parseStudentReplyNotification,
  getHiddenFeedbackIds,
  setHiddenFeedbackIds as saveHiddenFeedbackIds,
} from '../../lib/teacher/utils';
import type {
  ApiUser,
  StudentRecord,
  EvaluationRecord,
  ConversationMessage,
  CriterionDetail,
} from '../../lib/teacher/types';

const GENERATION_HINTS = ['Gen 2026', 'Gen 2027'];

export default function TeacherStudentListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState('All Generations');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedGender, setSelectedGender] = useState('All Gender');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const { teacherId } = useTeacherIdentity({ defaultName: 'Your teacher' });
  const [teacherMaxFeedbackCharacters, setTeacherMaxFeedbackCharacters] = useState(1000);
  const { feedbacks: feedbackHistory, setFeedbacks: setFeedbackHistory, reload: reloadTeacherFeedbacks } = useTeacherFeedbacks(teacherId);
  const {
    notifications: teacherNotifications,
    unreadCount: unreadNotificationCount,
    setNotifications: setTeacherNotifications,
  } = useTeacherNotifications(teacherId);
  const [isMarkingReplyReadId, setIsMarkingReplyReadId] = useState<number | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<ConversationMessage | null>(null);
  const [hiddenFeedbackIds, setHiddenFeedbackIds] = useState<number[]>([]);
  const [isDeletingFeedbackId, setIsDeletingFeedbackId] = useState<number | null>(null);
  const [pendingDeleteFeedbackId, setPendingDeleteFeedbackId] = useState<number | null>(null);
  const [activeCriterion, setActiveCriterion] = useState<CriterionDetail | null>(null);
  const [globalRatingScale, setGlobalRatingScale] = useState(5);
  const [globalCriteria, setGlobalCriteria] = useState<{ id?: number | string; name?: string; status?: string }[]>([]);

  useEffect(() => {
    if (!teacherId) {
      setHiddenFeedbackIds([]);
      return;
    }
    setHiddenFeedbackIds(getHiddenFeedbackIds(teacherId));
  }, [teacherId]);

  useEffect(() => {
    if (!teacherId) return;
    saveHiddenFeedbackIds(teacherId, hiddenFeedbackIds);
  }, [hiddenFeedbackIds, teacherId]);

  useEffect(() => {
    const loadStudents = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const [usersResponse, evaluationsResponse, feedbackLimitResponse, criteriaConfigResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/users`),
          fetch(`${API_BASE_URL}/evaluations`),
          fetch(`${API_BASE_URL}/settings/key/teacher_max_feedback_characters`),
          fetch(`${API_BASE_URL}/settings/evaluation-criteria`),
        ]);

        const usersData = await usersResponse.json().catch(() => []);
        const evaluationsData = await evaluationsResponse.json().catch(() => []);
        const feedbackLimitData = await feedbackLimitResponse.json().catch(() => ({}));
        const criteriaConfigData = await criteriaConfigResponse.json().catch(() => ({}));

        if (!usersResponse.ok) throw new Error(usersData?.error || 'Failed to load students.');
        if (!evaluationsResponse.ok) throw new Error(evaluationsData?.error || 'Failed to load student evaluations.');

        const configuredLimit = Number(feedbackLimitData?.value);
        setTeacherMaxFeedbackCharacters(Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 1000);

        const nextRatingScale = Math.max(1, Number(criteriaConfigData?.ratingScale || 5));
        setGlobalRatingScale(nextRatingScale);
        setGlobalCriteria(Array.isArray(criteriaConfigData?.criteria) ? criteriaConfigData.criteria : []);

        const latestEvaluationByUser = new Map<number, EvaluationRecord>();
        if (Array.isArray(evaluationsData)) {
          [...(evaluationsData as EvaluationRecord[])]
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
                return {
                  id: Number(user.id),
                  name: toDisplayName(user),
                  email: String(user.email || '').trim(),
                  studentId: String(user.student_id || user.resolved_student_id || '').trim() || `STU-${user.id}`,
                  generation: extractGeneration(user),
                  className: extractClassName(user),
                  gender: normalizeGender(user.gender),
                  avatar: String(user.profile_image || '').trim() || DEFAULT_AVATAR,
                  averageScore,
                  ratingScale: nextRatingScale,
                  latestEvaluation,
                } satisfies StudentRecord;
              })
          : [];

        setStudents(mappedStudents);
        setSelectedId((currentSelectedId) => currentSelectedId ?? mappedStudents[0]?.id ?? null);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to load students.');
        setStudents([]);
        setSelectedId(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadStudents();
  }, []);

  const passedState = location.state as { selectedStudentId?: number; openPerformance?: boolean } | null;

  useEffect(() => {
    if (students.length > 0 && passedState?.selectedStudentId) {
      setSelectedId(passedState.selectedStudentId);
      if (passedState.openPerformance) setIsPerformanceOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [students, passedState, navigate, location.pathname]);

  const generationOptions = useMemo(() => {
    const derivedGenerations = students.map((s) => s.generation).filter(Boolean);
    const uniqueGenerations = new Set([...derivedGenerations, ...GENERATION_HINTS]);
    return ['All Generations', ...Array.from(uniqueGenerations).sort()];
  }, [students]);

  const classOptions = useMemo(() => {
    const scopedStudents = selectedGeneration === 'All Generations'
      ? students
      : students.filter((s) => s.generation === selectedGeneration);
    return ['All Classes', ...Array.from(new Set(scopedStudents.map((s) => s.className))).sort()];
  }, [selectedGeneration, students]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return students.filter((student) => {
      const matchesGeneration = selectedGeneration === 'All Generations' || student.generation === selectedGeneration;
      const matchesClass = selectedClass === 'All Classes' || student.className === selectedClass;
      const matchesGender = selectedGender === 'All Gender' ||
        (selectedGender === 'Male' && student.gender === 'male') ||
        (selectedGender === 'Female' && student.gender === 'female');
      const matchesSearch = !normalizedQuery ||
        student.name.toLowerCase().includes(normalizedQuery) ||
        student.studentId.toLowerCase().includes(normalizedQuery) ||
        student.email.toLowerCase().includes(normalizedQuery);
      return matchesGeneration && matchesClass && matchesGender && matchesSearch;
    });
  }, [searchQuery, selectedClass, selectedGender, selectedGeneration, students]);

  useEffect(() => {
    if (filteredStudents.length === 0) {
      setSelectedId(null);
      return;
    }
    const hasSelectedStudent = filteredStudents.some((s) => s.id === selectedId);
    if (!hasSelectedStudent) setSelectedId(filteredStudents[0].id);
  }, [filteredStudents, selectedId]);

  const selectedStudent = filteredStudents.find((s) => s.id === selectedId) || filteredStudents[0] || null;
  const radarData = useMemo(() => buildRadarData(selectedStudent, globalCriteria, globalRatingScale), [selectedStudent, globalCriteria, globalRatingScale]);
  const selectedCriteria = selectedStudent?.latestEvaluation?.responses || [];
  const latestTeacherFeedback = useMemo(() => {
    if (!selectedStudent || !teacherId) return null;
    return feedbackHistory.find((f) => Number(f.teacher_id) === teacherId && Number(f.student_id) === selectedStudent.id) || null;
  }, [feedbackHistory, selectedStudent, teacherId]);
  const visibleStudentFeedbackHistory = useMemo(() => {
    if (!selectedStudent || !teacherId) return [];
    return feedbackHistory.filter((f) => Number(f.teacher_id) === teacherId && Number(f.student_id) === selectedStudent.id && !hiddenFeedbackIds.includes(Number(f.id)));
  }, [feedbackHistory, hiddenFeedbackIds, selectedStudent, teacherId]);
  const studentReplyHistory = useMemo(() => {
    if (!selectedStudent) return [];
    return teacherNotifications
      .map((n) => parseStudentReplyNotification(n))
      .filter((item): item is NonNullable<typeof item> => Boolean(item) && Number(item.studentId) === Number(selectedStudent.id))
      .sort((left, right) => new Date(String(right.createdAt || '')).getTime() - new Date(String(left.createdAt || '')).getTime());
  }, [selectedStudent, teacherNotifications]);
  const unreadReplyCountByStudent = useMemo(() => {
    return teacherNotifications
      .map((n) => parseStudentReplyNotification(n))
      .filter((item): item is NonNullable<typeof item> => Boolean(item) && !item.isRead)
      .reduce<Record<number, number>>((acc, item) => {
        const key = Number(item.studentId);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
  }, [teacherNotifications]);
  const conversationMessages = useMemo<ConversationMessage[]>(() => {
    const teacherMessages: ConversationMessage[] = visibleStudentFeedbackHistory.map((f) => ({
      id: `teacher-${f.id}`, source: 'teacher', text: String(f.comment || '').trim(), createdAt: f.created_at, feedbackId: Number(f.id),
    }));
    const studentMessages: ConversationMessage[] = studentReplyHistory.map((r) => ({
      id: `student-${r.notificationId}`, source: 'student', text: String(r.message || '').trim(), createdAt: r.createdAt, feedbackId: Number(r.feedbackId), notificationId: Number(r.notificationId), isRead: r.isRead,
    }));
    return [...teacherMessages, ...studentMessages].sort((left, right) => new Date(String(left.createdAt || '')).getTime() - new Date(String(right.createdAt || '')).getTime());
  }, [studentReplyHistory, visibleStudentFeedbackHistory]);

  useEffect(() => {
    if (!selectedStudent) {
      setFeedbackDraft('');
      setFeedbackError('');
      setFeedbackSuccess('');
      setReplyToMessage(null);
      return;
    }
    setFeedbackDraft(latestTeacherFeedback?.comment ||
      `${selectedStudent.name} shows ${selectedStudent.averageScore !== null ? `an average score of ${selectedStudent.averageScore.toFixed(1)}` : 'no submitted evaluation yet'}. Add your guidance here.`);
    setFeedbackError('');
    setFeedbackSuccess('');
    setReplyToMessage(null);
  }, [latestTeacherFeedback, selectedStudent]);

  const clearFilters = () => {
    setSelectedGeneration('All Generations');
    setSelectedClass('All Classes');
    setSelectedGender('All Gender');
    setSearchQuery('');
  };

  const handleSubmitFeedback = async () => {
    if (!teacherId || !selectedStudent) {
      setFeedbackError('Teacher account or selected student is missing.');
      return;
    }
    const trimmedFeedback = feedbackDraft.trim();
    if (!trimmedFeedback) {
      setFeedbackError('Feedback cannot be empty.');
      return;
    }
    const replyPrefix = replyToMessage
      ? `Replying to ${replyToMessage.source === 'student' ? 'student' : 'teacher'} (${formatShortDate(replyToMessage.createdAt)}): "${replyToMessage.text.slice(0, 120)}"\n\n`
      : '';
    const finalComment = `${replyPrefix}${trimmedFeedback}`;
    if (finalComment.length > teacherMaxFeedbackCharacters) {
      setFeedbackError(`Feedback must be ${teacherMaxFeedbackCharacters} characters or fewer.`);
      return;
    }
    setIsSubmittingFeedback(true);
    setFeedbackError('');
    setFeedbackSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: teacherId, student_id: selectedStudent.id, evaluation_id: selectedStudent.latestEvaluation?.id || null, comment: finalComment }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Failed to save feedback.');
      setFeedbackSuccess('Feedback saved and available to the student.');
      void reloadTeacherFeedbacks();
      setReplyToMessage(null);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'Failed to save feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleHideFeedbackForMe = (feedbackId: number) => {
    setHiddenFeedbackIds((prev) => (prev.includes(feedbackId) ? prev : [feedbackId, ...prev]));
  };

  const handleDeleteFeedbackForEveryone = (feedbackId: number) => setPendingDeleteFeedbackId(feedbackId);

  const confirmDeleteFeedbackForEveryone = async () => {
    if (!pendingDeleteFeedbackId) return;
    const feedbackId = Number(pendingDeleteFeedbackId);
    setIsDeletingFeedbackId(feedbackId);
    setFeedbackError('');
    setFeedbackSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/${feedbackId}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Failed to delete feedback.');
      setFeedbackHistory((prev) => prev.filter((f) => Number(f.id) !== feedbackId));
      setHiddenFeedbackIds((prev) => prev.filter((id) => id !== feedbackId));
      setFeedbackSuccess('Feedback deleted for everyone.');
      setPendingDeleteFeedbackId(null);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'Failed to delete feedback.');
    } finally {
      setIsDeletingFeedbackId(null);
    }
  };

  const handleMarkReplyAsRead = async (notificationId: number) => {
    setIsMarkingReplyReadId(notificationId);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, { method: 'PUT' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Failed to mark reply as read.');
      setTeacherNotifications((current) => current.map((n) => Number(n.id) === notificationId ? { ...n, is_read: 1 } : n));
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'Failed to mark reply as read.');
    } finally {
      setIsMarkingReplyReadId(null);
    }
  };


  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TeacherMobileNav />
        <StudentListTopBar
          searchQuery={searchQuery}
          unreadNotificationCount={unreadNotificationCount}
          onSearchChange={setSearchQuery}
          onNavigateHome={() => navigate('/teacher/dashboard')}
          onOpenNotifications={() => navigate('/teacher/notifications')}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-[1600px] mx-auto">
            <header className="mb-6 md:mb-8">
              <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Student Performance List</h1>
              <p className="text-xs md:text-base text-slate-500 mt-1 md:mt-2">Review performance and provide guidance.</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 w-full space-y-6 overflow-hidden">
                <StudentFiltersBar
                  selectedGeneration={selectedGeneration}
                  selectedClass={selectedClass}
                  selectedGender={selectedGender}
                  generationOptions={generationOptions}
                  classOptions={classOptions}
                  onGenerationChange={(value) => {
                    setSelectedGeneration(value);
                    setSelectedClass('All Classes');
                  }}
                  onClassChange={setSelectedClass}
                  onGenderChange={setSelectedGender}
                  onClearFilters={clearFilters}
                />

                <StudentTable
                  students={students}
                  filteredStudents={filteredStudents}
                  selectedStudentId={selectedStudent?.id ?? null}
                  unreadReplyCountByStudent={unreadReplyCountByStudent}
                  isLoading={isLoading}
                  loadError={loadError}
                  onOpenOverview={(studentId) => {
                    setSelectedId(studentId);
                    setIsPerformanceOpen(true);
                  }}
                  onViewProfile={(studentId) => navigate(`/teacher/students/${studentId}`)}
                  onMessageStudent={(studentId) => {
                    const params = new URLSearchParams({ contactId: String(studentId) });
                    const selectedStudent = students.find((s) => s.id === studentId);
                    navigate(
                      { pathname: '/teacher/messages', search: `?${params.toString()}` },
                      { state: { selectedContactId: studentId, selectedContactName: selectedStudent?.name, isMobileChatOpen: true } }
                    );
                  }}
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

