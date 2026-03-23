import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getRealtimeSocket, type FeedbackRealtimePayload } from '../lib/realtime';
import type {
  ChatEntry,
  DeleteTarget,
  FeedbackItem,
  StudentReplyItem,
} from '../components/student/feedback/types';
import {
  API_BASE_URL,
  getHiddenMessagesStorageKey,
  getSeenByTeacherStorageKey,
  parseStoredStudentUser,
  readStoredHiddenMessageIds,
  readStoredSeenByTeacher,
  sortByDateAsc,
  toQuarterLabel,
} from '../components/student/feedback/utils';

export function useStudentFeedback() {
  const [studentId, setStudentId] = useState(null as number | null);
  const [studentName, setStudentName] = useState('Student');
  const [selectedTeacherId, setSelectedTeacherId] = useState(
    null as number | null,
  );
  const [feedbackList, setFeedbackList] = useState([] as FeedbackItem[]);
  const [teacherReplies, setTeacherReplies] = useState([] as StudentReplyItem[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [canViewTeacherFeedback, setCanViewTeacherFeedback] = useState(true);
  const [replyDraft, setReplyDraft] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyStatus, setReplyStatus] = useState('');
  const [replyToMessage, setReplyToMessage] = useState(null as ChatEntry | null);
  const [replyToFeedbackId, setReplyToFeedbackId] = useState(
    null as number | null,
  );
  const [hiddenMessageIds, setHiddenMessageIds] = useState([] as string[]);
  const [deleteTarget, setDeleteTarget] = useState(null as DeleteTarget | null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [seenByTeacher, setSeenByTeacher] = useState(
    {} as Record<string, string>,
  );
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const chatContainerRef = useRef(null as HTMLDivElement | null);

  const loadFeedbacks = useCallback(async () => {
    if (!studentId) {
      setIsLoading(false);
      setFeedbackList([]);
      return;
    }

    setIsLoading(true);
    setLoadError('');

    try {
      const [visibilityResponse, feedbackResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/settings/key/student_can_view_teacher_feedback`),
        fetch(`${API_BASE_URL}/feedbacks/student/${studentId}`),
      ]);

      const visibilityData = await visibilityResponse.json().catch(() => ({}));
      const feedbackData = await feedbackResponse.json().catch(() => []);
      const visibilityValue = String(visibilityData?.value || 'true')
        .trim()
        .toLowerCase();
      const isVisible = visibilityValue !== 'false' && visibilityValue !== '0';

      setCanViewTeacherFeedback(isVisible);

      if (!isVisible) {
        setFeedbackList([]);
        setSelectedTeacherId(null);
        return;
      }

      if (!feedbackResponse.ok) {
        throw new Error(feedbackData?.error || 'Failed to load feedback.');
      }

      setFeedbackList(Array.isArray(feedbackData) ? feedbackData : []);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'Failed to load feedback.',
      );
      setFeedbackList([]);
      setSelectedTeacherId(null);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  const loadTeacherReplies = useCallback(async () => {
    if (!studentId || !selectedTeacherId) {
      setTeacherReplies([]);
      return;
    }

    setIsLoadingReplies(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/thread/student/${studentId}/teacher/${selectedTeacherId}`,
      );
      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load replies.');
      }

      setTeacherReplies(Array.isArray(data) ? data : []);
    } catch {
      setTeacherReplies([]);
    } finally {
      setIsLoadingReplies(false);
    }
  }, [selectedTeacherId, studentId]);

  useEffect(() => {
    const storedUser = parseStoredStudentUser();
    setStudentId(storedUser.id);
    setStudentName(storedUser.name);
  }, []);

  useEffect(() => {
    if (!studentId) return;

    setHiddenMessageIds(readStoredHiddenMessageIds(studentId));
    setSeenByTeacher(readStoredSeenByTeacher(studentId));
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;

    localStorage.setItem(
      getHiddenMessagesStorageKey(studentId),
      JSON.stringify(hiddenMessageIds),
    );
  }, [hiddenMessageIds, studentId]);

  useEffect(() => {
    if (!studentId) return;

    localStorage.setItem(
      getSeenByTeacherStorageKey(studentId),
      JSON.stringify(seenByTeacher),
    );
  }, [seenByTeacher, studentId]);

  useEffect(() => {
    void loadFeedbacks();
  }, [loadFeedbacks]);

  useEffect(() => {
    void loadTeacherReplies();
  }, [loadTeacherReplies]);

  useEffect(() => {
    if (!studentId) return;

    const socket = getRealtimeSocket();
    const subscription = { studentId };
    const handleFeedbackEvent = (payload: FeedbackRealtimePayload = {}) => {
      if (Number(payload.studentId) !== studentId) return;
      void loadFeedbacks();
    };

    socket.emit('feedback:subscribe', subscription);
    socket.on('feedback:created', handleFeedbackEvent);
    socket.on('feedback:updated', handleFeedbackEvent);
    socket.on('feedback:deleted', handleFeedbackEvent);

    return () => {
      socket.emit('feedback:unsubscribe', subscription);
      socket.off('feedback:created', handleFeedbackEvent);
      socket.off('feedback:updated', handleFeedbackEvent);
      socket.off('feedback:deleted', handleFeedbackEvent);
    };
  }, [loadFeedbacks, studentId]);

  const selectedTeacherFeedbacks = useMemo(
    () =>
      feedbackList
        .filter((item) => Number(item.teacher_id) === Number(selectedTeacherId))
        .sort((left, right) => sortByDateAsc(left.created_at, right.created_at)),
    [feedbackList, selectedTeacherId],
  );

  const chatEntriesRaw = useMemo(() => {
    const teacherMessages = selectedTeacherFeedbacks.map((item) => ({
      id: `feedback-${item.id}`,
      kind: 'teacher' as const,
      text: String(item.comment || ''),
      createdAt: item.created_at,
      quarterLabel: toQuarterLabel(item.evaluation_period),
      feedbackId: Number(item.id),
    }));

    const studentMessages = teacherReplies.map((item) => ({
      id: `reply-${item.id}`,
      kind: 'student' as const,
      text: String(item.reply_message || ''),
      createdAt: item.created_at,
      replyId: Number(item.id),
      feedbackId: Number(item.feedback_id),
    }));

    return [...teacherMessages, ...studentMessages].sort((left, right) =>
      sortByDateAsc(left.createdAt, right.createdAt),
    );
  }, [selectedTeacherFeedbacks, teacherReplies]);

  const chatEntries = useMemo(
    () => chatEntriesRaw.filter((entry) => !hiddenMessageIds.includes(entry.id)),
    [chatEntriesRaw, hiddenMessageIds],
  );

  useEffect(() => {
    if (!selectedTeacherId) return;

    const latestTime = chatEntriesRaw
      .filter((entry) => entry.kind === 'teacher')
      .reduce((max, entry) => {
        const value = new Date(String(entry.createdAt || '')).getTime();
        return Number.isNaN(value) ? max : Math.max(max, value);
      }, 0);

    if (latestTime <= 0) return;

    setSeenByTeacher((current) => ({
      ...current,
      [String(selectedTeacherId)]: new Date(latestTime).toISOString(),
    }));
  }, [chatEntriesRaw, selectedTeacherId]);

  const teacherSummaries = useMemo(() => {
    const grouped = new Map<number, FeedbackItem[]>();

    feedbackList.forEach((item) => {
      const teacherId = Number(item.teacher_id);
      if (!Number.isInteger(teacherId) || teacherId <= 0) return;

      const currentItems = grouped.get(teacherId) || [];
      currentItems.push(item);
      grouped.set(teacherId, currentItems);
    });

    return Array.from(grouped.entries())
      .map(([teacherId, items]) => {
        const sorted = [...items].sort(
          (left, right) =>
            new Date(String(right.created_at || '')).getTime() -
            new Date(String(left.created_at || '')).getTime(),
        );
        const latest = sorted[0];
        const seenAt = new Date(
          String(seenByTeacher[String(teacherId)] || ''),
        ).getTime();
        const unreadCount = sorted.filter((feedback) => {
          const createdAt = new Date(String(feedback.created_at || '')).getTime();
          return !Number.isNaN(createdAt) && createdAt > seenAt;
        }).length;

        return {
          teacherId,
          teacherName: String(latest?.teacher_name || `Teacher #${teacherId}`),
          teacherProfileImage: latest?.teacher_profile_image || null,
          latestAt: latest?.created_at,
          latestSnippet: String(latest?.comment || '').trim(),
          totalFeedbacks: items.length,
          unreadCount,
        };
      })
      .sort(
        (left, right) =>
          new Date(String(right.latestAt || '')).getTime() -
          new Date(String(left.latestAt || '')).getTime(),
      );
  }, [feedbackList, seenByTeacher]);

  const filteredTeachers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return teacherSummaries;

    return teacherSummaries.filter(
      (teacher) =>
        teacher.teacherName.toLowerCase().includes(normalizedQuery) ||
        teacher.latestSnippet.toLowerCase().includes(normalizedQuery),
    );
  }, [searchQuery, teacherSummaries]);

  useEffect(() => {
    if (!filteredTeachers.length) {
      setSelectedTeacherId(null);
      return;
    }

    const hasSelection = filteredTeachers.some(
      (teacher) => teacher.teacherId === selectedTeacherId,
    );
    if (!hasSelection) {
      setSelectedTeacherId(filteredTeachers[0].teacherId);
    }
  }, [filteredTeachers, selectedTeacherId]);

  const selectedTeacher =
    filteredTeachers.find((teacher) => teacher.teacherId === selectedTeacherId) ||
    null;

  useEffect(() => {
    setReplyDraft('');
    setReplyStatus('');
    setReplyToMessage(null);
    setReplyToFeedbackId(null);
  }, [selectedTeacherId]);

  const handleSelectTeacher = useCallback((teacherId: number) => {
    setSelectedTeacherId(teacherId);
    setIsMobileChatOpen(true);
  }, []);

  const handleBackToTeacherList = useCallback(() => {
    setIsMobileChatOpen(false);
  }, []);

  const handleReplyTarget = useCallback((entry: ChatEntry) => {
    setReplyToMessage(entry);
    setReplyToFeedbackId(entry.kind === 'teacher' ? entry.feedbackId ?? null : null);
  }, []);

  const handleClearReplyTarget = useCallback(() => {
    setReplyToMessage(null);
    setReplyToFeedbackId(null);
  }, []);

  const handleHideMessage = useCallback((messageId: string) => {
    setHiddenMessageIds((current) =>
      current.includes(messageId) ? current : [messageId, ...current],
    );
  }, []);

  const handleRequestDelete = useCallback((entry: ChatEntry) => {
    const targetId = Number(
      entry.kind === 'teacher' ? entry.feedbackId : entry.replyId,
    );

    if (!Number.isInteger(targetId) || targetId <= 0) return;

    setDeleteTarget({
      kind: entry.kind === 'teacher' ? 'feedback' : 'reply',
      id: targetId,
    });
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleQuickReply = useCallback(async () => {
    if (!studentId || !selectedTeacherId) return;

    const trimmedReply = replyDraft.trim();
    if (!trimmedReply) {
      setReplyStatus('Please write your message first.');
      return;
    }

    const targetFeedbackId =
      replyToFeedbackId ??
      Number(selectedTeacherFeedbacks[selectedTeacherFeedbacks.length - 1]?.id || 0);

    if (!Number.isInteger(targetFeedbackId) || targetFeedbackId <= 0) {
      setReplyStatus('No teacher feedback found for this conversation.');
      return;
    }

    setIsSubmittingReply(true);
    setReplyStatus('');

    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedTeacherId,
          is_read: 0,
          message: `[StudentReply] feedback_id=${targetFeedbackId}; student_id=${studentId}; student_name=${studentName}; message=${trimmedReply}`,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to send reply.');
      }

      setReplyDraft('');
      setReplyToMessage(null);
      setReplyToFeedbackId(null);
      setReplyStatus('Sent.');

      const optimisticReply: StudentReplyItem = {
        id: Date.now(),
        feedback_id: targetFeedbackId,
        student_id: studentId,
        student_name: studentName,
        reply_message: trimmedReply,
        created_at: new Date().toISOString(),
        is_read: 0,
      };

      setTeacherReplies((current) => [...current, optimisticReply]);
      void loadTeacherReplies();

      requestAnimationFrame(() => {
        setTimeout(() => {
          if (!chatContainerRef.current) return;
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
        }, 50);
      });
    } catch (error) {
      setReplyStatus(
        error instanceof Error ? error.message : 'Failed to send reply.',
      );
    } finally {
      setIsSubmittingReply(false);
    }
  }, [
    loadTeacherReplies,
    replyDraft,
    replyToFeedbackId,
    selectedTeacherFeedbacks,
    selectedTeacherId,
    studentId,
    studentName,
  ]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeletingMessage(true);
    setReplyStatus('');

    try {
      if (deleteTarget.kind === 'feedback') {
        const response = await fetch(`${API_BASE_URL}/feedbacks/${deleteTarget.id}`, {
          method: 'DELETE',
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to delete feedback message.');
        }

        setFeedbackList((current) =>
          current.filter((item) => Number(item.id) !== deleteTarget.id),
        );
      } else {
        const response = await fetch(
          `${API_BASE_URL}/notifications/${deleteTarget.id}`,
          { method: 'DELETE' },
        );
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to delete reply message.');
        }

        setTeacherReplies((current) =>
          current.filter((item) => Number(item.id) !== deleteTarget.id),
        );
      }

      const deletedMessageId = `${deleteTarget.kind}-${deleteTarget.id}`;
      setHiddenMessageIds((current) =>
        current.filter((messageId) => messageId !== deletedMessageId),
      );
      setReplyStatus('Message deleted.');
      setDeleteTarget(null);
    } catch (error) {
      setReplyStatus(
        error instanceof Error ? error.message : 'Failed to delete message.',
      );
    } finally {
      setIsDeletingMessage(false);
    }
  }, [deleteTarget]);

  return {
    canViewTeacherFeedback,
    chatContainerRef,
    chatEntries,
    deleteTarget,
    filteredTeachers,
    handleBackToTeacherList,
    handleClearReplyTarget,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleHideMessage,
    handleQuickReply,
    handleReplyTarget,
    handleRequestDelete,
    handleSelectTeacher,
    isDeletingMessage,
    isLoading,
    isLoadingReplies,
    isMobileChatOpen,
    isSubmittingReply,
    loadError,
    replyDraft,
    replyStatus,
    replyToMessage,
    searchQuery,
    selectedTeacher,
    selectedTeacherId,
    setReplyDraft,
    setSearchQuery,
  };
}
