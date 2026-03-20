import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTeacherFeedbacks } from './useTeacherFeedbacks';
import { useTeacherIdentity } from './useTeacherIdentity';
import { useTeacherNotifications } from './useTeacherNotifications';
import {
  API_BASE_URL,
  buildCriteriaBreakdown,
  buildRadarData,
  getEvaluationSortValue,
  getHiddenFeedbackIds,
  parseStudentReplyNotification,
  setHiddenFeedbackIds,
} from '../lib/teacher/utils';
import type {
  ApiUser,
  EvaluationRecord,
  FeedbackRecord,
  StudentReplyRecord,
} from '../lib/teacher/types';

const DEFAULT_MAX_FEEDBACK_CHARACTERS = 1000;

export function useTeacherStudentProfile(studentIdParam?: string) {
  const { teacherId } = useTeacherIdentity();
  const {
    feedbacks: feedbackHistory,
    setFeedbacks: setFeedbackHistory,
    reload: reloadTeacherFeedbacks,
  } = useTeacherFeedbacks(teacherId);
  const {
    notifications: teacherNotifications,
  } = useTeacherNotifications(teacherId);

  const [student, setStudent] = useState(null as ApiUser | null);
  const [evaluations, setEvaluations] = useState([] as EvaluationRecord[]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEvaluationList, setShowEvaluationList] = useState(false);
  const [teacherMaxFeedbackCharacters, setTeacherMaxFeedbackCharacters] = useState(
    DEFAULT_MAX_FEEDBACK_CHARACTERS,
  );
  const [globalRatingScale, setGlobalRatingScale] = useState(5);
  const [globalCriteria, setGlobalCriteria] = useState([] as Array<{
    id?: number | string;
    name?: string;
    status?: string;
    icon?: string | null;
    color?: string | null;
  }>);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState(null as number | null);
  const [evaluationFeedback, setEvaluationFeedback] = useState([] as FeedbackRecord[]);
  const [hiddenFeedbackIds, setHiddenFeedbackIdsState] = useState([] as number[]);
  const [pendingDeleteFeedbackId, setPendingDeleteFeedbackId] = useState(null as number | null);
  const [isDeletingFeedbackId, setIsDeletingFeedbackId] = useState(null as number | null);
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null as number | null);
  const [editDraft, setEditDraft] = useState('');
  const [isUpdatingFeedback, setIsUpdatingFeedback] = useState(false);

  useEffect(() => {
    if (!teacherId) {
      setHiddenFeedbackIdsState([]);
      return;
    }

    setHiddenFeedbackIdsState(getHiddenFeedbackIds(teacherId));
  }, [teacherId]);

  useEffect(() => {
    if (!teacherId) {
      return;
    }

    setHiddenFeedbackIds(teacherId, hiddenFeedbackIds);
  }, [hiddenFeedbackIds, teacherId]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!studentIdParam) {
        setStudent(null);
        setEvaluations([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const [userResponse, evaluationsResponse, feedbackLimitResponse, criteriaResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/users/${studentIdParam}`),
            fetch(`${API_BASE_URL}/evaluations/user/${studentIdParam}`),
            fetch(`${API_BASE_URL}/settings/key/teacher_max_feedback_characters`),
            fetch(`${API_BASE_URL}/settings/evaluation-criteria`),
          ]);

        const userData = await userResponse.json().catch(() => null);
        const evaluationData = await evaluationsResponse.json().catch(() => []);
        const feedbackLimitData = await feedbackLimitResponse.json().catch(() => ({}));
        const criteriaData = await criteriaResponse.json().catch(() => ({}));

        setStudent(userResponse.ok ? userData : null);
        setEvaluations(
          Array.isArray(evaluationData)
            ? [...evaluationData].sort(
                (left, right) => getEvaluationSortValue(right) - getEvaluationSortValue(left),
              )
            : [],
        );

        const configuredLimit = Number(feedbackLimitData?.value);
        setTeacherMaxFeedbackCharacters(
          Number.isFinite(configuredLimit) && configuredLimit > 0
            ? configuredLimit
            : DEFAULT_MAX_FEEDBACK_CHARACTERS,
        );

        setGlobalRatingScale(Math.max(1, Number(criteriaData?.ratingScale || 5)));
        setGlobalCriteria(Array.isArray(criteriaData?.criteria) ? criteriaData.criteria : []);
      } catch (error) {
        console.error('Failed to load student profile', error);
        setStudent(null);
        setEvaluations([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, [studentIdParam]);

  useEffect(() => {
    if (evaluations.length === 0) {
      setSelectedEvaluationId(null);
      return;
    }

    setSelectedEvaluationId((currentSelectedEvaluationId) => {
      if (
        currentSelectedEvaluationId &&
        evaluations.some((evaluation) => Number(evaluation.id) === currentSelectedEvaluationId)
      ) {
        return currentSelectedEvaluationId;
      }

      return Number(evaluations[0].id);
    });
  }, [evaluations]);

  const latestEvaluation = evaluations[0] || null;

  const selectedEvaluation = useMemo(
    () =>
      evaluations.find((evaluation) => Number(evaluation.id) === Number(selectedEvaluationId)) ||
      null,
    [evaluations, selectedEvaluationId],
  );

  const activeEvaluation = selectedEvaluation || latestEvaluation;

  const loadEvaluationFeedback = useCallback(async (evaluationId: number) => {
    if (!student?.id) {
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/student/${student.id}`);
      const data = await response.json().catch(() => []);

      if (!response.ok || !Array.isArray(data)) {
        return [];
      }

      return data.filter(
        (feedback): feedback is FeedbackRecord =>
          Number(feedback.evaluation_id) === Number(evaluationId),
      );
    } catch {
      return [];
    }
  }, [student?.id]);

  const refreshEvaluationFeedback = useCallback(async (evaluationId: number) => {
    const nextFeedback = await loadEvaluationFeedback(evaluationId);
    setEvaluationFeedback(nextFeedback);
  }, [loadEvaluationFeedback]);

  useEffect(() => {
    if (!student?.id || !activeEvaluation?.id) {
      setEvaluationFeedback([]);
      return;
    }

    void refreshEvaluationFeedback(Number(activeEvaluation.id));
  }, [activeEvaluation?.id, refreshEvaluationFeedback, student?.id]);

  const studentReplyHistory = useMemo(() => {
    if (!student) {
      return [];
    }

    return teacherNotifications
      .map((notification) => parseStudentReplyNotification(notification))
      .filter(
        (item): item is StudentReplyRecord =>
          item !== null && Number(item.studentId) === Number(student.id),
      )
      .sort(
        (left, right) =>
          new Date(String(left.createdAt || '')).getTime() -
          new Date(String(right.createdAt || '')).getTime(),
      );
  }, [student, teacherNotifications]);

  const evaluationStudentReplies = useMemo(() => {
    if (evaluationFeedback.length === 0) {
      return [];
    }

    const feedbackIds = new Set(evaluationFeedback.map((feedback) => Number(feedback.id)));
    return studentReplyHistory.filter((reply) => feedbackIds.has(Number(reply.feedbackId)));
  }, [evaluationFeedback, studentReplyHistory]);

  const radarData = useMemo(
    () =>
      buildRadarData(
        activeEvaluation
          ? {
              latestEvaluation: {
                responses: activeEvaluation.responses,
                rating_scale: activeEvaluation.rating_scale,
              },
            }
          : null,
        globalCriteria,
        globalRatingScale,
      ),
    [activeEvaluation, globalCriteria, globalRatingScale],
  );

  const selectedCriteria = useMemo(
    () => buildCriteriaBreakdown(activeEvaluation, globalCriteria),
    [activeEvaluation, globalCriteria],
  );

  const visibleStudentFeedbackHistory = useMemo(() => {
    if (!student || !teacherId) {
      return [];
    }

    return feedbackHistory.filter(
      (feedback) =>
        Number(feedback.teacher_id) === teacherId &&
        Number(feedback.student_id) === Number(student.id) &&
        !hiddenFeedbackIds.includes(Number(feedback.id)),
    );
  }, [feedbackHistory, hiddenFeedbackIds, student, teacherId]);

  const latestTeacherFeedback = visibleStudentFeedbackHistory[0] || null;

  useEffect(() => {
    if (!feedbackSuccess) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedbackSuccess('');
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [feedbackSuccess]);

  const handleSelectEvaluation = useCallback((evaluationId: number) => {
    setSelectedEvaluationId(evaluationId);
  }, []);

  const handleSubmitFeedback = useCallback(async () => {
    if (!teacherId || !student) {
      setFeedbackError('Teacher account or student record is missing.');
      return;
    }

    const trimmedFeedback = feedbackDraft.trim();
    if (!trimmedFeedback) {
      setFeedbackError('Feedback cannot be empty.');
      return;
    }

    if (trimmedFeedback.length > teacherMaxFeedbackCharacters) {
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
        body: JSON.stringify({
          teacher_id: teacherId,
          student_id: student.id,
          evaluation_id: activeEvaluation?.id || null,
          comment: trimmedFeedback,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save feedback');
      }

      setFeedbackDraft('');
      setFeedbackSuccess('Feedback submitted successfully!');
      void reloadTeacherFeedbacks();

      if (activeEvaluation?.id) {
        await refreshEvaluationFeedback(Number(activeEvaluation.id));
      }
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'Error saving feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  }, [
    activeEvaluation?.id,
    feedbackDraft,
    reloadTeacherFeedbacks,
    refreshEvaluationFeedback,
    student,
    teacherId,
    teacherMaxFeedbackCharacters,
  ]);

  const handleHideFeedbackForMe = useCallback((feedbackId: number) => {
    setHiddenFeedbackIdsState((currentHiddenFeedbackIds) => (
      currentHiddenFeedbackIds.includes(feedbackId)
        ? currentHiddenFeedbackIds
        : [feedbackId, ...currentHiddenFeedbackIds]
    ));
  }, []);

  const handleStartEdit = useCallback((feedback: FeedbackRecord) => {
    setEditingFeedbackId(Number(feedback.id));
    setEditDraft(String(feedback.comment || ''));
    setFeedbackError('');
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingFeedbackId(null);
    setEditDraft('');
  }, []);

  const handleSaveEdit = useCallback(async (feedbackId: number) => {
    const trimmedEdit = editDraft.trim();
    if (!trimmedEdit) {
      setFeedbackError('Feedback cannot be empty.');
      return;
    }

    if (trimmedEdit.length > teacherMaxFeedbackCharacters) {
      setFeedbackError(`Feedback must be ${teacherMaxFeedbackCharacters} characters or fewer.`);
      return;
    }

    setIsUpdatingFeedback(true);
    setFeedbackError('');
    setFeedbackSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/${feedbackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: trimmedEdit }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update feedback');
      }

      setFeedbackHistory((currentFeedbackHistory) =>
        currentFeedbackHistory.map((feedback) =>
          Number(feedback.id) === Number(feedbackId)
            ? { ...feedback, comment: trimmedEdit }
            : feedback,
        ),
      );
      setEvaluationFeedback((currentEvaluationFeedback) =>
        currentEvaluationFeedback.map((feedback) =>
          Number(feedback.id) === Number(feedbackId)
            ? { ...feedback, comment: trimmedEdit }
            : feedback,
        ),
      );
      setEditingFeedbackId(null);
      setEditDraft('');
      setFeedbackSuccess('Feedback updated successfully!');
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'Error updating feedback');
    } finally {
      setIsUpdatingFeedback(false);
    }
  }, [editDraft, setFeedbackHistory, teacherMaxFeedbackCharacters]);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDeleteFeedbackId) {
      return;
    }

    const feedbackId = Number(pendingDeleteFeedbackId);
    setIsDeletingFeedbackId(feedbackId);
    setFeedbackError('');
    setFeedbackSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/${feedbackId}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete feedback');
      }

      setFeedbackHistory((currentFeedbackHistory) =>
        currentFeedbackHistory.filter((feedback) => Number(feedback.id) !== feedbackId),
      );
      setEvaluationFeedback((currentEvaluationFeedback) =>
        currentEvaluationFeedback.filter((feedback) => Number(feedback.id) !== feedbackId),
      );
      setHiddenFeedbackIdsState((currentHiddenFeedbackIds) =>
        currentHiddenFeedbackIds.filter((hiddenId) => hiddenId !== feedbackId),
      );
      setPendingDeleteFeedbackId(null);
      setFeedbackSuccess('Feedback deleted successfully!');
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'Error deleting feedback');
      setPendingDeleteFeedbackId(null);
    } finally {
      setIsDeletingFeedbackId(null);
    }
  }, [pendingDeleteFeedbackId, setFeedbackHistory]);

  return {
    teacherId,
    student,
    evaluations,
    latestEvaluation,
    selectedEvaluation: activeEvaluation,
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
  };
}
