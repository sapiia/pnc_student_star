import { useEffect, useMemo, useState } from 'react';
import { useTeacherFeedbacks } from './useTeacherFeedbacks';
import { useTeacherNotifications } from './useTeacherNotifications';
import {
  API_BASE_URL,
  formatShortDate,
  getHiddenFeedbackIds,
  parseStudentReplyNotification,
  setHiddenFeedbackIds as saveHiddenFeedbackIds,
} from '../lib/teacher/utils';
import type { ConversationMessage, StudentRecord } from '../lib/teacher/types';

type UseTeacherStudentConversationProps = {
  teacherId: number | null;
  selectedStudent: StudentRecord | null;
  teacherMaxFeedbackCharacters: number;
};

export function useTeacherStudentConversation({
  teacherId,
  selectedStudent,
  teacherMaxFeedbackCharacters,
}: UseTeacherStudentConversationProps) {
  const {
    feedbacks: feedbackHistory,
    setFeedbacks: setFeedbackHistory,
    reload: reloadTeacherFeedbacks,
  } = useTeacherFeedbacks(teacherId);
  const {
    notifications: teacherNotifications,
    unreadCount: unreadNotificationCount,
    setNotifications: setTeacherNotifications,
  } = useTeacherNotifications(teacherId);

  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isMarkingReplyReadId, setIsMarkingReplyReadId] = useState<number | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<ConversationMessage | null>(null);
  const [hiddenFeedbackIds, setHiddenFeedbackIds] = useState<number[]>([]);
  const [isDeletingFeedbackId, setIsDeletingFeedbackId] = useState<number | null>(null);
  const [pendingDeleteFeedbackId, setPendingDeleteFeedbackId] = useState<number | null>(null);

  useEffect(() => {
    if (!teacherId) {
      setHiddenFeedbackIds([]);
      return;
    }

    setHiddenFeedbackIds(getHiddenFeedbackIds(teacherId));
  }, [teacherId]);

  useEffect(() => {
    if (!teacherId) {
      return;
    }

    saveHiddenFeedbackIds(teacherId, hiddenFeedbackIds);
  }, [hiddenFeedbackIds, teacherId]);

  const latestTeacherFeedback = useMemo(() => {
    if (!selectedStudent || !teacherId) {
      return null;
    }

    return feedbackHistory.find(
      (feedback) =>
        Number(feedback.teacher_id) === teacherId &&
        Number(feedback.student_id) === selectedStudent.id,
    ) || null;
  }, [feedbackHistory, selectedStudent, teacherId]);

  const visibleStudentFeedbackHistory = useMemo(() => {
    if (!selectedStudent || !teacherId) {
      return [];
    }

    return feedbackHistory.filter(
      (feedback) =>
        Number(feedback.teacher_id) === teacherId &&
        Number(feedback.student_id) === selectedStudent.id &&
        !hiddenFeedbackIds.includes(Number(feedback.id)),
    );
  }, [feedbackHistory, hiddenFeedbackIds, selectedStudent, teacherId]);

  const parsedStudentReplies = useMemo(
    () =>
      teacherNotifications
        .map((notification) => parseStudentReplyNotification(notification))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [teacherNotifications],
  );

  const studentReplyHistory = useMemo(() => {
    if (!selectedStudent) {
      return [];
    }

    return parsedStudentReplies
      .filter((item) => Number(item.studentId) === Number(selectedStudent.id))
      .sort(
        (left, right) =>
          new Date(String(right.createdAt || '')).getTime() -
          new Date(String(left.createdAt || '')).getTime(),
      );
  }, [parsedStudentReplies, selectedStudent]);

  const unreadReplyCountByStudent = useMemo(
    () =>
      parsedStudentReplies
        .filter((item) => !item.isRead)
        .reduce<Record<number, number>>((accumulator, item) => {
          const key = Number(item.studentId);
          accumulator[key] = (accumulator[key] || 0) + 1;
          return accumulator;
        }, {}),
    [parsedStudentReplies],
  );

  const conversationMessages = useMemo<ConversationMessage[]>(() => {
    const teacherMessages: ConversationMessage[] = visibleStudentFeedbackHistory.map((feedback) => ({
      id: `teacher-${feedback.id}`,
      source: 'teacher',
      text: String(feedback.comment || '').trim(),
      createdAt: feedback.created_at,
      feedbackId: Number(feedback.id),
    }));
    const studentMessages: ConversationMessage[] = studentReplyHistory.map((reply) => ({
      id: `student-${reply.notificationId}`,
      source: 'student',
      text: String(reply.message || '').trim(),
      createdAt: reply.createdAt,
      feedbackId: Number(reply.feedbackId),
      notificationId: Number(reply.notificationId),
      isRead: reply.isRead,
    }));

    return [...teacherMessages, ...studentMessages].sort(
      (left, right) =>
        new Date(String(left.createdAt || '')).getTime() -
        new Date(String(right.createdAt || '')).getTime(),
    );
  }, [studentReplyHistory, visibleStudentFeedbackHistory]);

  useEffect(() => {
    if (!selectedStudent) {
      setFeedbackDraft('');
      setFeedbackError('');
      setFeedbackSuccess('');
      setReplyToMessage(null);
      return;
    }

    setFeedbackDraft(
      latestTeacherFeedback?.comment ||
        `${selectedStudent.name} shows ${
          selectedStudent.averageScore !== null
            ? `an average score of ${selectedStudent.averageScore.toFixed(1)}`
            : 'no submitted evaluation yet'
        }. Add your guidance here.`,
    );
    setFeedbackError('');
    setFeedbackSuccess('');
    setReplyToMessage(null);
  }, [latestTeacherFeedback, selectedStudent]);

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
      ? `Replying to ${
          replyToMessage.source === 'student' ? 'student' : 'teacher'
        } (${formatShortDate(replyToMessage.createdAt)}): "${replyToMessage.text.slice(0, 120)}"\n\n`
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
        body: JSON.stringify({
          teacher_id: teacherId,
          student_id: selectedStudent.id,
          evaluation_id: selectedStudent.latestEvaluation?.id || null,
          comment: finalComment,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save feedback.');
      }

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
    setHiddenFeedbackIds((current) => (
      current.includes(feedbackId) ? current : [feedbackId, ...current]
    ));
  };

  const handleDeleteFeedbackForEveryone = (feedbackId: number) => {
    setPendingDeleteFeedbackId(feedbackId);
  };

  const confirmDeleteFeedbackForEveryone = async () => {
    if (!pendingDeleteFeedbackId) {
      return;
    }

    const feedbackId = Number(pendingDeleteFeedbackId);
    setIsDeletingFeedbackId(feedbackId);
    setFeedbackError('');
    setFeedbackSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/${feedbackId}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete feedback.');
      }

      setFeedbackHistory((current) => current.filter((feedback) => Number(feedback.id) !== feedbackId));
      setHiddenFeedbackIds((current) => current.filter((id) => id !== feedbackId));
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
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to mark reply as read.');
      }

      setTeacherNotifications((current) =>
        current.map((notification) =>
          Number(notification.id) === notificationId
            ? { ...notification, is_read: 1 }
            : notification,
        ),
      );
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'Failed to mark reply as read.');
    } finally {
      setIsMarkingReplyReadId(null);
    }
  };

  return {
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
  };
}
