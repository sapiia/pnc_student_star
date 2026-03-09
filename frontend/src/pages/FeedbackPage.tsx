import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Search, Send, Settings, Trash2, Users, X } from 'lucide-react';
import Sidebar from '../components/layout/sidebar/Sidebar';
import { cn } from '../lib/utils';
import { getRealtimeSocket, type FeedbackRealtimePayload } from '../lib/realtime';

type FeedbackItem = {
  id: number;
  teacher_id?: number;
  student_id?: number;
  evaluation_id?: number | null;
  evaluation_period?: string | null;
  teacher_name?: string;
  teacher_profile_image?: string | null;
  comment: string;
  created_at?: string;
};

type StudentReplyItem = {
  id: number;
  feedback_id: number;
  student_id: number;
  student_name: string;
  reply_message: string;
  created_at?: string;
  is_read?: number;
};

type TeacherSummary = {
  teacherId: number;
  teacherName: string;
  teacherProfileImage: string | null;
  latestAt?: string;
  latestSnippet: string;
  totalFeedbacks: number;
  unreadCount: number;
};

type ChatEntry = {
  id: string;
  kind: 'teacher' | 'student';
  text: string;
  createdAt?: string;
  quarterLabel?: string;
  feedbackId?: number;
  replyId?: number;
};

type DeleteTarget = {
  kind: 'feedback' | 'reply';
  id: number;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const formatDateLabel = (value?: string) => {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const toQuarterLabel = (period?: string | null) => {
  const text = String(period || '').trim();
  const match = text.match(/^(\d{4})-Q([1-4])$/i);
  if (match) return `Q${match[2]} ${match[1]}`;
  return text || 'Unknown Quarter';
};

const sortByDateAsc = (left?: string, right?: string) => (
  new Date(String(left || '')).getTime() - new Date(String(right || '')).getTime()
);

export default function FeedbackPage() {
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState('Student');
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [teacherReplies, setTeacherReplies] = useState<StudentReplyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [canViewTeacherFeedback, setCanViewTeacherFeedback] = useState(true);
  const [replyDraft, setReplyDraft] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyStatus, setReplyStatus] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<ChatEntry | null>(null);
  const [hiddenMessageIds, setHiddenMessageIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [seenByTeacher, setSeenByTeacher] = useState<Record<string, string>>({});

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

      const visibilityValue = String(visibilityData?.value || 'true').trim().toLowerCase();
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

      const normalizedFeedbacks = Array.isArray(feedbackData) ? feedbackData : [];
      setFeedbackList(normalizedFeedbacks);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load feedback.');
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
      const response = await fetch(`${API_BASE_URL}/notifications/thread/student/${studentId}/teacher/${selectedTeacherId}`);
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
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return;
      const authUser = JSON.parse(raw);
      const resolvedStudentId = Number(authUser?.id);
      if (Number.isInteger(resolvedStudentId) && resolvedStudentId > 0) {
        setStudentId(resolvedStudentId);
      }
      const resolvedStudentName =
        String(authUser?.name || '').trim() ||
        [authUser?.first_name, authUser?.last_name].filter(Boolean).join(' ').trim();
      if (resolvedStudentName) {
        setStudentName(resolvedStudentName);
      }
    } catch {
      setStudentId(null);
    }
  }, []);

  useEffect(() => {
    if (!studentId) return;

    try {
      const rawHidden = localStorage.getItem(`student_hidden_messages_${studentId}`);
      const parsedHidden = rawHidden ? JSON.parse(rawHidden) : [];
      setHiddenMessageIds(Array.isArray(parsedHidden) ? parsedHidden.map((item) => String(item)) : []);
    } catch {
      setHiddenMessageIds([]);
    }

    try {
      const rawSeen = localStorage.getItem(`student_seen_by_teacher_${studentId}`);
      const parsedSeen = rawSeen ? JSON.parse(rawSeen) : {};
      setSeenByTeacher(parsedSeen && typeof parsedSeen === 'object' ? parsedSeen : {});
    } catch {
      setSeenByTeacher({});
    }
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;
    localStorage.setItem(`student_hidden_messages_${studentId}`, JSON.stringify(hiddenMessageIds));
  }, [hiddenMessageIds, studentId]);

  useEffect(() => {
    if (!studentId) return;
    localStorage.setItem(`student_seen_by_teacher_${studentId}`, JSON.stringify(seenByTeacher));
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

  const selectedTeacherFeedbacks = useMemo(() => (
    feedbackList
      .filter((item) => Number(item.teacher_id) === Number(selectedTeacherId))
      .sort((left, right) => sortByDateAsc(left.created_at, right.created_at))
  ), [feedbackList, selectedTeacherId]);

  const chatEntriesRaw = useMemo<ChatEntry[]>(() => {
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

    return [...teacherMessages, ...studentMessages].sort((left, right) => sortByDateAsc(left.createdAt, right.createdAt));
  }, [selectedTeacherFeedbacks, teacherReplies]);

  const chatEntries = useMemo(() => (
    chatEntriesRaw.filter((entry) => !hiddenMessageIds.includes(entry.id))
  ), [chatEntriesRaw, hiddenMessageIds]);

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

      const current = grouped.get(teacherId) || [];
      current.push(item);
      grouped.set(teacherId, current);
    });

    const summaries: TeacherSummary[] = Array.from(grouped.entries()).map(([teacherId, items]) => {
      const sorted = [...items].sort((left, right) => (
        new Date(String(right.created_at || '')).getTime() - new Date(String(left.created_at || '')).getTime()
      ));
      const latest = sorted[0];
      const seenAt = new Date(String(seenByTeacher[String(teacherId)] || '')).getTime();
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
    });

    return summaries.sort((left, right) => (
      new Date(String(right.latestAt || '')).getTime() - new Date(String(left.latestAt || '')).getTime()
    ));
  }, [feedbackList, seenByTeacher]);

  const filteredTeachers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return teacherSummaries;

    return teacherSummaries.filter((teacher) => (
      teacher.teacherName.toLowerCase().includes(normalizedQuery) ||
      teacher.latestSnippet.toLowerCase().includes(normalizedQuery)
    ));
  }, [searchQuery, teacherSummaries]);

  useEffect(() => {
    if (!filteredTeachers.length) {
      setSelectedTeacherId(null);
      return;
    }

    const hasSelection = filteredTeachers.some((teacher) => teacher.teacherId === selectedTeacherId);
    if (!hasSelection) {
      setSelectedTeacherId(filteredTeachers[0].teacherId);
    }
  }, [filteredTeachers, selectedTeacherId]);

  const selectedTeacher = filteredTeachers.find((teacher) => teacher.teacherId === selectedTeacherId) || null;

  useEffect(() => {
    setReplyDraft('');
    setReplyStatus('');
    setReplyToMessage(null);
  }, [selectedTeacherId]);

  const handleHideMessage = (messageId: string) => {
    setHiddenMessageIds((current) => (current.includes(messageId) ? current : [messageId, ...current]));
  };

  const handleQuickReply = async () => {
    if (!studentId || !selectedTeacherId) return;

    const trimmedReply = replyDraft.trim();
    if (!trimmedReply) {
      setReplyStatus('Please write your message first.');
      return;
    }

    const latestFeedbackId = Number(selectedTeacherFeedbacks[selectedTeacherFeedbacks.length - 1]?.id || 0);
    if (!Number.isInteger(latestFeedbackId) || latestFeedbackId <= 0) {
      setReplyStatus('No teacher feedback found for this conversation.');
      return;
    }

    const replyPrefix = replyToMessage
      ? `Replying to ${replyToMessage.kind === 'teacher' ? 'teacher' : 'my message'} (${formatDateLabel(replyToMessage.createdAt)}): "${replyToMessage.text.slice(0, 120)}"\n\n`
      : '';
    const finalReply = `${replyPrefix}${trimmedReply}`;

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
          message: `[StudentReply] feedback_id=${latestFeedbackId}; student_id=${studentId}; student_name=${studentName}; message=${finalReply}`,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to send reply.');
      }

      setReplyDraft('');
      setReplyToMessage(null);
      setReplyStatus('Sent.');
      void loadTeacherReplies();
    } catch (error) {
      setReplyStatus(error instanceof Error ? error.message : 'Failed to send reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeletingMessage(true);
    setReplyStatus('');
    try {
      if (deleteTarget.kind === 'feedback') {
        const response = await fetch(`${API_BASE_URL}/feedbacks/${deleteTarget.id}`, { method: 'DELETE' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || 'Failed to delete feedback message.');
        setFeedbackList((current) => current.filter((item) => Number(item.id) !== deleteTarget.id));
      } else {
        const response = await fetch(`${API_BASE_URL}/notifications/${deleteTarget.id}`, { method: 'DELETE' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || 'Failed to delete reply message.');
        setTeacherReplies((current) => current.filter((item) => Number(item.id) !== deleteTarget.id));
      }
      setReplyStatus('Message deleted.');
      setDeleteTarget(null);
    } catch (error) {
      setReplyStatus(error instanceof Error ? error.message : 'Failed to delete message.');
    } finally {
      setIsDeletingMessage(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <aside className="w-96 border-r border-slate-200 bg-white flex flex-col shrink-0">
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Teachers</h2>
              <p className="text-xs text-slate-500 mt-1">{filteredTeachers.length} profiles</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-sm font-medium text-slate-500">Loading feedback...</div>
              ) : !canViewTeacherFeedback ? (
                <div className="p-6 text-sm font-medium text-slate-500">Teacher feedback is currently hidden by admin settings.</div>
              ) : loadError ? (
                <div className="p-6 text-sm font-medium text-rose-600">{loadError}</div>
              ) : filteredTeachers.length === 0 ? (
                <div className="p-6 text-sm font-medium text-slate-500">No teacher feedback yet.</div>
              ) : filteredTeachers.map((teacher) => (
                <button
                  key={teacher.teacherId}
                  onClick={() => setSelectedTeacherId(teacher.teacherId)}
                  className={cn(
                    'w-full p-6 flex gap-4 text-left border-b border-slate-50 transition-all hover:bg-slate-50 group relative',
                    selectedTeacherId === teacher.teacherId && 'bg-slate-50'
                  )}
                >
                  {selectedTeacherId === teacher.teacherId ? (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  ) : null}
                  <div className="size-12 rounded-full overflow-hidden shrink-0 bg-primary/10 text-primary flex items-center justify-center">
                    {teacher.teacherProfileImage ? (
                      <img src={teacher.teacherProfileImage} alt={teacher.teacherName} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-4">
                      <p className="text-sm font-bold text-slate-900 truncate">{teacher.teacherName}</p>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">{formatDateLabel(teacher.latestAt)}</span>
                        {teacher.unreadCount > 0 ? (
                          <span className="inline-flex min-w-5 h-5 px-1 mt-1 rounded-full bg-rose-500 text-white text-[10px] font-black items-center justify-center">
                            {teacher.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                      {teacher.totalFeedbacks} feedback{teacher.totalFeedbacks > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {teacher.latestSnippet || 'No content'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="flex-1 flex flex-col bg-white overflow-hidden">
            {selectedTeacher ? (
              <>
                <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-4">
                  <div className="size-12 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center">
                    {selectedTeacher.teacherProfileImage ? (
                      <img src={selectedTeacher.teacherProfileImage} alt={selectedTeacher.teacherName} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{selectedTeacher.teacherName}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">All feedback from this teacher</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 bg-slate-50">
                  {isLoadingReplies ? (
                    <div className="text-sm font-medium text-slate-500">Loading conversation...</div>
                  ) : chatEntries.length > 0 ? chatEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={cn('flex', entry.kind === 'student' ? 'justify-end' : 'justify-start')}
                    >
                      <div className={cn(
                        'max-w-[78%] rounded-2xl px-4 py-3 shadow-sm border',
                        entry.kind === 'student'
                          ? 'bg-primary text-white border-primary/30'
                          : 'bg-white text-slate-700 border-slate-200'
                      )}>
                        {entry.kind === 'teacher' ? (
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                            Feedback from {entry.quarterLabel}
                          </p>
                        ) : (
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-1">
                            You replied
                          </p>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                        <p className={cn(
                          'mt-2 text-[10px] font-bold',
                          entry.kind === 'student' ? 'text-white/80' : 'text-slate-400'
                        )}>
                          {formatDateLabel(entry.createdAt)}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyToMessage(entry)}
                            className={cn(
                              'rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-colors',
                              entry.kind === 'student'
                                ? 'border border-white/30 bg-white/15 text-white hover:bg-white/25'
                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                            )}
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => handleHideMessage(entry.id)}
                            className={cn(
                              'rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-colors',
                              entry.kind === 'student'
                                ? 'border border-white/30 bg-white/15 text-white hover:bg-white/25'
                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                            )}
                          >
                            Hide
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ kind: entry.kind === 'teacher' ? 'feedback' : 'reply', id: Number(entry.kind === 'teacher' ? entry.feedbackId : entry.replyId) })}
                            className={cn(
                              'rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1 transition-colors',
                              entry.kind === 'student'
                                ? 'border border-white/30 bg-rose-500/85 text-white hover:bg-rose-500'
                                : 'border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                            )}
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <Users className="w-14 h-14 mb-3 opacity-20" />
                      <p className="text-sm">No conversation yet for this teacher.</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 bg-white p-6 space-y-3">
                  {replyToMessage ? (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[11px] font-bold text-primary">
                          Replying to {replyToMessage.kind === 'teacher' ? 'teacher' : 'my message'}: "{replyToMessage.text.slice(0, 120)}"
                        </p>
                        <button type="button" onClick={() => setReplyToMessage(null)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <textarea
                    rows={3}
                    value={replyDraft}
                    onChange={(event) => setReplyDraft(event.target.value)}
                    placeholder="Reply to this teacher..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40"
                  />
                  <div className="flex items-center justify-between gap-4">
                    <p className={cn(
                      'text-xs font-bold',
                      replyStatus.toLowerCase().includes('failed') || replyStatus.toLowerCase().includes('no ')
                        ? 'text-rose-600'
                        : 'text-emerald-600'
                    )}>
                      {replyStatus || ' '}
                    </p>
                    <button
                      type="button"
                      onClick={handleQuickReply}
                      disabled={isSubmittingReply || !selectedTeacher}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-60"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmittingReply ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Users className="w-16 h-16 mb-4 opacity-20" />
                <p>{isLoading ? 'Loading feedback...' : 'Select a teacher profile to see all feedback.'}</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {deleteTarget ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-black text-slate-900">Delete Message?</h3>
            <p className="mt-2 text-sm text-slate-500">
              This will delete the selected {deleteTarget.kind === 'feedback' ? 'feedback' : 'reply'} message for both sides.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingMessage}
                className="flex-1 rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white hover:bg-rose-600 disabled:opacity-60"
              >
                {isDeletingMessage ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
