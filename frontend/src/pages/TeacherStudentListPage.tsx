import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Brain,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Heart,
  Home,
  MessageCircle,
  Search,
  Send,
  Smile,
  Star,
  Trash2,
  Users,
  Users2,
  Wrench,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import TeacherSidebar from '../components/TeacherSidebar';
import TeacherMobileNav from '../components/TeacherMobileNav';
import RadarChart from '../components/RadarChart';
import { cn } from '../lib/utils';
import {
  getRealtimeSocket,
  type FeedbackRealtimePayload,
  type NotificationRealtimePayload,
} from '../lib/realtime';

type ApiUser = {
  id: number;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  role?: string | null;
  class?: string | null;
  gender?: string | null;
  student_id?: string | null;
  resolved_student_id?: string | null;
  profile_image?: string | null;
};

type EvaluationResponse = {
  criterion_key: string;
  criterion_name?: string;
  criterion_icon?: string | null;
  star_value: number;
  reflection?: string;
  tip_snapshot?: string;
};

type EvaluationRecord = {
  id: number;
  user_id?: number;
  average_score?: number;
  rating_scale?: number;
  submitted_at?: string;
  created_at?: string;
  responses?: EvaluationResponse[];
};

type FeedbackRecord = {
  id: number;
  teacher_id: number;
  student_id: number;
  evaluation_id?: number | null;
  comment: string;
  created_at?: string;
  updated_at?: string;
  teacher_name?: string;
};

type CriterionDetail = {
  key: string;
  label: string;
  icon: string;
  score: number;
  reflection: string;
  tip: string;
};

type StudentRecord = {
  id: number;
  name: string;
  email: string;
  studentId: string;
  generation: string;
  className: string;
  gender: 'male' | 'female' | 'unknown';
  avatar: string;
  averageScore: number | null;
  ratingScale: number;
  latestEvaluation: EvaluationRecord | null;
};

type NotificationRecord = {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at?: string;
};

type StudentReplyRecord = {
  notificationId: number;
  studentId: number;
  studentName: string;
  feedbackId: number;
  message: string;
  createdAt?: string;
  isRead: boolean;
};

type ConversationMessage = {
  id: string;
  source: 'teacher' | 'student';
  text: string;
  createdAt?: string;
  feedbackId?: number;
  notificationId?: number;
  isRead?: boolean;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const RADAR_COLORS = [
  { key: 'score', name: 'Performance', color: '#5d5fef', fill: '#5d5fef' },
];
const CRITERIA_COLOR_STYLES = [
  { iconBg: 'bg-blue-100', iconText: 'text-blue-600', detailText: 'text-blue-600', stars: 'text-blue-500', hover: 'hover:border-blue-300' },
  { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', detailText: 'text-emerald-600', stars: 'text-emerald-500', hover: 'hover:border-emerald-300' },
  { iconBg: 'bg-amber-100', iconText: 'text-amber-600', detailText: 'text-amber-600', stars: 'text-amber-500', hover: 'hover:border-amber-300' },
  { iconBg: 'bg-rose-100', iconText: 'text-rose-600', detailText: 'text-rose-600', stars: 'text-rose-500', hover: 'hover:border-rose-300' },
  { iconBg: 'bg-cyan-100', iconText: 'text-cyan-600', detailText: 'text-cyan-600', stars: 'text-cyan-500', hover: 'hover:border-cyan-300' },
  { iconBg: 'bg-fuchsia-100', iconText: 'text-fuchsia-600', detailText: 'text-fuchsia-600', stars: 'text-fuchsia-500', hover: 'hover:border-fuchsia-300' },
  { iconBg: 'bg-indigo-100', iconText: 'text-indigo-600', detailText: 'text-indigo-600', stars: 'text-indigo-500', hover: 'hover:border-indigo-300' },
  { iconBg: 'bg-orange-100', iconText: 'text-orange-600', detailText: 'text-orange-600', stars: 'text-orange-500', hover: 'hover:border-orange-300' },
  { iconBg: 'bg-sky-100', iconText: 'text-sky-600', detailText: 'text-sky-600', stars: 'text-sky-500', hover: 'hover:border-sky-300' },
] as const;

const toDisplayName = (user: ApiUser) => {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return String(user.name || '').trim() || fullName || String(user.email || 'Student').trim();
};

const normalizeGender = (gender?: string | null): StudentRecord['gender'] => {
  const value = String(gender || '').trim().toLowerCase();
  if (value === 'male' || value === 'female') return value;
  return 'unknown';
};

const extractGeneration = (user: ApiUser) => {
  const classText = String(user.class || '').trim();
  const classMatch = classText.match(/gen\s*(\d{4})/i);
  if (classMatch) return `Gen ${classMatch[1]}`;

  const studentId = String(user.student_id || user.resolved_student_id || '').trim();
  const studentIdMatch = studentId.match(/^(\d{4})-/);
  if (studentIdMatch) return `Gen ${studentIdMatch[1]}`;

  return 'Unknown Gen';
};

const extractClassName = (user: ApiUser) => {
  const classText = String(user.class || '').trim();
  if (!classText) return 'Unassigned';

  const explicitClassMatch = classText.match(/class\s+([a-z0-9-]+)/i);
  if (explicitClassMatch) return explicitClassMatch[1].toUpperCase();

  const trimmedSegments = classText
    .split('-')
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (trimmedSegments.length > 1) {
    return trimmedSegments[trimmedSegments.length - 1];
  }

  return classText;
};

const getEvaluationSortValue = (evaluation: EvaluationRecord) => {
  const submittedValue = new Date(String(evaluation.submitted_at || evaluation.created_at || '')).getTime();
  return Number.isNaN(submittedValue) ? Number.MIN_SAFE_INTEGER : submittedValue;
};

const formatScore = (averageScore: number | null, ratingScale: number) => {
  if (averageScore === null) return 'N/A';
  return `${averageScore.toFixed(1)} / ${ratingScale.toFixed(1)}`;
};

const formatShortDate = (value?: string) => {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const getIcon = (iconName?: string | null, className = 'w-5 h-5') => {
  switch (String(iconName || '').trim()) {
    case 'Home': return <Home className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Users2': return <Users2 className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Smile': return <Smile className={className} />;
    case 'Brain': return <Brain className={className} />;
    case 'CreditCard': return <CreditCard className={className} />;
    case 'Wrench': return <Wrench className={className} />;
    case 'MessageCircle': return <MessageCircle className={className} />;
    default: return <Star className={className} />;
  }
};

const buildRadarData = (student: StudentRecord | null) => {
  if (!student?.latestEvaluation?.responses?.length) return [];

  const ratingScale = Math.max(1, Number(student.latestEvaluation.rating_scale || student.ratingScale || 5));
  return student.latestEvaluation.responses.map((response) => ({
    subject: String(response.criterion_name || response.criterion_key || 'Criterion'),
    score: Math.max(0, Number(response.star_value || 0) * (100 / ratingScale)),
  }));
};

const parseStudentReplyNotification = (notification: NotificationRecord): StudentReplyRecord | null => {
  const text = String(notification.message || '').trim();
  const match = text.match(/^\[StudentReply\]\s+feedback_id=(\d+);\s*student_id=(\d+);\s*student_name=(.*?);\s*message=(.*)$/);
  if (!match) return null;

  return {
    notificationId: Number(notification.id),
    feedbackId: Number(match[1]),
    studentId: Number(match[2]),
    studentName: String(match[3] || 'Student').trim() || 'Student',
    message: String(match[4] || '').trim(),
    createdAt: notification.created_at,
    isRead: Number(notification.is_read) === 1,
  };
};

export default function TeacherStudentListPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
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
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [teacherName, setTeacherName] = useState('Your teacher');
  const [teacherMaxFeedbackCharacters, setTeacherMaxFeedbackCharacters] = useState(1000);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackRecord[]>([]);
  const [teacherNotifications, setTeacherNotifications] = useState<NotificationRecord[]>([]);
  const [isMarkingReplyReadId, setIsMarkingReplyReadId] = useState<number | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<ConversationMessage | null>(null);
  const [hiddenFeedbackIds, setHiddenFeedbackIds] = useState<number[]>([]);
  const [isDeletingFeedbackId, setIsDeletingFeedbackId] = useState<number | null>(null);
  const [pendingDeleteFeedbackId, setPendingDeleteFeedbackId] = useState<number | null>(null);
  const [activeCriterion, setActiveCriterion] = useState<CriterionDetail | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return;
      const authUser = JSON.parse(raw);
      const resolvedTeacherId = Number(authUser?.id);
      if (Number.isInteger(resolvedTeacherId) && resolvedTeacherId > 0) {
        setTeacherId(resolvedTeacherId);
      }
      const resolvedTeacherName =
        String(authUser?.name || '').trim() ||
        [authUser?.first_name, authUser?.last_name].filter(Boolean).join(' ').trim();
      if (resolvedTeacherName) {
        setTeacherName(resolvedTeacherName);
      }
    } catch {
      setTeacherId(null);
      setTeacherName('Your teacher');
    }
  }, []);

  useEffect(() => {
    if (!teacherId) {
      setHiddenFeedbackIds([]);
      return;
    }

    try {
      const raw = localStorage.getItem(`teacher_hidden_feedback_${teacherId}`);
      const parsed = raw ? JSON.parse(raw) : [];
      setHiddenFeedbackIds(Array.isArray(parsed) ? parsed.map((item) => Number(item)).filter(Number.isFinite) : []);
    } catch {
      setHiddenFeedbackIds([]);
    }
  }, [teacherId]);

  useEffect(() => {
    if (!teacherId) return;
    localStorage.setItem(`teacher_hidden_feedback_${teacherId}`, JSON.stringify(hiddenFeedbackIds));
  }, [hiddenFeedbackIds, teacherId]);

  useEffect(() => {
    const loadStudents = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const [usersResponse, evaluationsResponse, feedbackLimitResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/users`),
          fetch(`${API_BASE_URL}/evaluations`),
          fetch(`${API_BASE_URL}/settings/key/teacher_max_feedback_characters`),
        ]);

        const usersData = await usersResponse.json().catch(() => []);
        const evaluationsData = await evaluationsResponse.json().catch(() => []);
        const feedbackLimitData = await feedbackLimitResponse.json().catch(() => ({}));

        if (!usersResponse.ok) {
          throw new Error(usersData?.error || 'Failed to load students.');
        }
        if (!evaluationsResponse.ok) {
          throw new Error(evaluationsData?.error || 'Failed to load student evaluations.');
        }

        const configuredLimit = Number(feedbackLimitData?.value);
        setTeacherMaxFeedbackCharacters(
          Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 1000
        );

        const latestEvaluationByUser = new Map<number, EvaluationRecord>();
        if (Array.isArray(evaluationsData)) {
          [...evaluationsData as EvaluationRecord[]]
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
                const ratingScale = Math.max(1, Number(latestEvaluation?.rating_scale || 5));

                return {
                  id: Number(user.id),
                  name: toDisplayName(user),
                  email: String(user.email || '').trim(),
                  studentId: String(user.student_id || user.resolved_student_id || '').trim() || `STU-${user.id}`,
                  generation: extractGeneration(user),
                  className: extractClassName(user),
                  gender: normalizeGender(user.gender),
                  avatar: String(user.profile_image || '').trim() || `https://picsum.photos/seed/student-${user.id}/100/100`,
                  averageScore,
                  ratingScale,
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

  const loadTeacherFeedbacks = useCallback(async () => {
    if (!teacherId) {
      setFeedbackHistory([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/teacher/${teacherId}`);
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load teacher feedback.');
      }
      setFeedbackHistory(Array.isArray(data) ? data : []);
    } catch {
      setFeedbackHistory([]);
    }
  }, [teacherId]);

  useEffect(() => {
    void loadTeacherFeedbacks();
  }, [loadTeacherFeedbacks]);

  useEffect(() => {
    if (!teacherId) return;

    const socket = getRealtimeSocket();
    const subscription = { teacherId };
    const handleFeedbackEvent = (payload: FeedbackRealtimePayload = {}) => {
      if (Number(payload.teacherId) !== teacherId) return;
      void loadTeacherFeedbacks();
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
  }, [loadTeacherFeedbacks, teacherId]);

  const loadTeacherNotifications = useCallback(async () => {
    if (!teacherId) {
      setTeacherNotifications([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/user/${teacherId}`);
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load notifications.');
      }
      setTeacherNotifications(Array.isArray(data) ? data : []);
    } catch {
      setTeacherNotifications([]);
    }
  }, [teacherId]);

  useEffect(() => {
    void loadTeacherNotifications();
  }, [loadTeacherNotifications]);

  useEffect(() => {
    if (!teacherId) return;

    const socket = getRealtimeSocket();
    const subscription = { userId: teacherId };
    const handleNotificationEvent = (payload: NotificationRealtimePayload = {}) => {
      if (Number(payload.userId) !== teacherId) return;
      void loadTeacherNotifications();
    };

    socket.emit('notification:subscribe', subscription);
    socket.on('notification:created', handleNotificationEvent);
    socket.on('notification:updated', handleNotificationEvent);
    socket.on('notification:deleted', handleNotificationEvent);

    return () => {
      socket.emit('notification:unsubscribe', subscription);
      socket.off('notification:created', handleNotificationEvent);
      socket.off('notification:updated', handleNotificationEvent);
      socket.off('notification:deleted', handleNotificationEvent);
    };
  }, [loadTeacherNotifications, teacherId]);

  const generationOptions = useMemo(() => (
    ['All Generations', ...Array.from(new Set(students.map((student) => student.generation))).sort()]
  ), [students]);

  const classOptions = useMemo(() => {
    const scopedStudents = selectedGeneration === 'All Generations'
      ? students
      : students.filter((student) => student.generation === selectedGeneration);

    return ['All Classes', ...Array.from(new Set(scopedStudents.map((student) => student.className))).sort()];
  }, [selectedGeneration, students]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return students.filter((student) => {
      const matchesGeneration = selectedGeneration === 'All Generations' || student.generation === selectedGeneration;
      const matchesClass = selectedClass === 'All Classes' || student.className === selectedClass;
      const matchesGender =
        selectedGender === 'All Gender' ||
        (selectedGender === 'Male' && student.gender === 'male') ||
        (selectedGender === 'Female' && student.gender === 'female');
      const matchesSearch =
        !normalizedQuery ||
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

    const hasSelectedStudent = filteredStudents.some((student) => student.id === selectedId);
    if (!hasSelectedStudent) {
      setSelectedId(filteredStudents[0].id);
    }
  }, [filteredStudents, selectedId]);

  const selectedStudent = filteredStudents.find((student) => student.id === selectedId) || filteredStudents[0] || null;
  const radarData = buildRadarData(selectedStudent);
  const selectedCriteria = selectedStudent?.latestEvaluation?.responses || [];
  const latestTeacherFeedback = useMemo(() => {
    if (!selectedStudent || !teacherId) return null;

    return feedbackHistory.find((feedback) => (
      Number(feedback.teacher_id) === teacherId &&
      Number(feedback.student_id) === selectedStudent.id
    )) || null;
  }, [feedbackHistory, selectedStudent, teacherId]);
  const visibleStudentFeedbackHistory = useMemo(() => {
    if (!selectedStudent || !teacherId) return [];

    return feedbackHistory.filter((feedback) => (
      Number(feedback.teacher_id) === teacherId &&
      Number(feedback.student_id) === selectedStudent.id &&
      !hiddenFeedbackIds.includes(Number(feedback.id))
    ));
  }, [feedbackHistory, hiddenFeedbackIds, selectedStudent, teacherId]);
  const studentReplyHistory = useMemo(() => {
    if (!selectedStudent) return [];

    return teacherNotifications
      .map((notification) => parseStudentReplyNotification(notification))
      .filter((item): item is StudentReplyRecord => (
        Boolean(item) && Number(item.studentId) === Number(selectedStudent.id)
      ))
      .sort((left, right) => (
        new Date(String(right.createdAt || '')).getTime() - new Date(String(left.createdAt || '')).getTime()
      ));
  }, [selectedStudent, teacherNotifications]);
  const unreadReplyCountByStudent = useMemo(() => {
    return teacherNotifications
      .map((notification) => parseStudentReplyNotification(notification))
      .filter((item): item is StudentReplyRecord => Boolean(item) && !item.isRead)
      .reduce<Record<number, number>>((accumulator, item) => {
        const key = Number(item.studentId);
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
      }, {});
  }, [teacherNotifications]);
  const unreadNotificationCount = useMemo(
    () => teacherNotifications.filter((n) => Number(n.is_read) !== 1).length,
    [teacherNotifications]
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

    return [...teacherMessages, ...studentMessages].sort((left, right) => (
      new Date(String(left.createdAt || '')).getTime() - new Date(String(right.createdAt || '')).getTime()
    ));
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
      `${selectedStudent.name} shows ${selectedStudent.averageScore !== null ? `an average score of ${selectedStudent.averageScore.toFixed(1)}` : 'no submitted evaluation yet'}. Add your guidance here.`
    );
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
        headers: {
          'Content-Type': 'application/json',
        },
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

      const teacherFeedbackResponse = await fetch(`${API_BASE_URL}/feedbacks/teacher/${teacherId}`);
      const teacherFeedbackData = await teacherFeedbackResponse.json().catch(() => []);
      if (teacherFeedbackResponse.ok && Array.isArray(teacherFeedbackData)) {
        setFeedbackHistory(teacherFeedbackData);
      }
      setReplyToMessage(null);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'Failed to save feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleHideFeedbackForMe = (feedbackId: number) => {
    setHiddenFeedbackIds((prev) => prev.includes(feedbackId) ? prev : [feedbackId, ...prev]);
  };

  const handleDeleteFeedbackForEveryone = async (feedbackId: number) => {
    setPendingDeleteFeedbackId(feedbackId);
  };

  const confirmDeleteFeedbackForEveryone = async () => {
    if (!pendingDeleteFeedbackId) return;

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
        throw new Error(data?.error || 'Failed to delete feedback.');
      }

      setFeedbackHistory((prev) => prev.filter((feedback) => Number(feedback.id) !== feedbackId));
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
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to mark reply as read.');
      }

      setTeacherNotifications((current) => current.map((notification) => (
        Number(notification.id) === notificationId
          ? { ...notification, is_read: 1 }
          : notification
      )));
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
        <header className="h-auto min-h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-2 md:py-0 flex items-center justify-between shrink-0 z-10">
          <nav className="flex items-center gap-2 text-[10px] md:text-sm text-slate-500">
            <button onClick={() => navigate('/teacher/dashboard')} className="hover:text-primary transition-colors">Home</button>
            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="font-semibold text-slate-900 truncate">Students</span>
          </nav>
          <div className="flex items-center gap-2 md:gap-4 ml-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-32 sm:w-48 md:w-72 pl-8 md:pl-10 pr-4 py-1.5 md:py-2 bg-slate-100 border-none rounded-full text-xs md:text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => navigate('/teacher/notifications')}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative shrink-0"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 min-w-4 md:min-w-5 h-4 md:h-5 px-1 rounded-full bg-rose-500 text-white text-[8px] md:text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              ) : null}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-[1400px] mx-auto">
            <header className="mb-6 md:mb-8">
              <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Student Performance List</h1>
              <p className="text-xs md:text-base text-slate-500 mt-1 md:mt-2">Review performance and provide guidance.</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                  <div className="relative">
                    <select
                      value={selectedGeneration}
                      onChange={(e) => {
                        setSelectedGeneration(e.target.value);
                        setSelectedClass('All Classes');
                      }}
                      className="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-primary/10"
                    >
                      {generationOptions.map((generation) => (
                        <option key={generation} value={generation}>{generation}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-primary/10"
                    >
                      {classOptions.map((className) => (
                        <option key={className} value={className}>{className}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                      className="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="All Gender">All Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <button onClick={clearFilters} className="text-sm font-bold text-primary hover:underline xl:ml-auto">
                    Clear all filters
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                        <th className="px-6 py-4">Student ID</th>
                        <th className="px-6 py-4">Full Name</th>
                        <th className="px-6 py-4">Gender</th>
                        <th className="px-6 py-4">Avg Score</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                            Loading students...
                          </td>
                        </tr>
                      ) : loadError ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-rose-600 font-medium">
                            {loadError}
                          </td>
                        </tr>
                      ) : filteredStudents.map((student) => (
                        <tr
                          key={student.id}
                          className={cn(
                            'group transition-all cursor-pointer',
                            selectedStudent?.id === student.id ? 'bg-primary/5' : 'hover:bg-slate-50/50'
                          )}
                          onClick={() => setSelectedId(student.id)}
                        >
                          <td className="px-6 py-5 text-sm font-medium text-slate-500">{student.studentId}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full overflow-hidden shrink-0 bg-slate-100">
                                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900">{student.name}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                  {student.generation} | {student.className}
                                </span>
                                {(unreadReplyCountByStudent[student.id] || 0) > 0 ? (
                                  <span className="mt-1 inline-flex w-fit items-center rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                                    {unreadReplyCountByStudent[student.id]} new reply{(unreadReplyCountByStudent[student.id] || 0) > 1 ? 'ies' : ''}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={cn(
                              'text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg',
                              student.gender === 'male'
                                ? 'bg-sky-50 text-sky-600'
                                : student.gender === 'female'
                                  ? 'bg-rose-50 text-rose-600'
                                  : 'bg-slate-100 text-slate-500'
                            )}>
                              {student.gender}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={cn(
                              'text-xs font-bold px-2.5 py-1 rounded-lg',
                              student.averageScore === null
                                ? 'bg-slate-100 text-slate-500'
                                : student.averageScore >= 4
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : student.averageScore >= 3
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-rose-50 text-rose-600'
                            )}>
                              {formatScore(student.averageScore, student.ratingScale)}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <button className={cn(
                              'text-xs font-bold transition-colors',
                              selectedStudent?.id === student.id ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'
                            )}>
                              {selectedStudent?.id === student.id ? 'Selected' : 'View'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!isLoading && !loadError && filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                            No students found matching the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="p-4 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400">
                      Showing {filteredStudents.length} of {students.length} students
                    </p>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg" disabled>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 bg-primary text-white rounded-lg" disabled>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[470px] shrink-0">
                <motion.div
                  layout
                  key={selectedStudent?.id || 'empty'}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden sticky top-8"
                >
                  <div className="p-8 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black text-slate-900">Performance Overview</h3>
                      <div className="size-12 rounded-2xl overflow-hidden border-2 border-primary/20 bg-slate-100">
                        {selectedStudent ? (
                          <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Selected Student</p>
                    <h4 className="text-lg font-bold text-slate-900">
                      {selectedStudent ? `${selectedStudent.name} (${selectedStudent.studentId})` : 'No student selected'}
                    </h4>
                    {selectedStudent ? (
                      <p className="text-sm text-slate-500 mt-2">
                        {selectedStudent.generation} | {selectedStudent.className} | {selectedStudent.gender}
                      </p>
                    ) : null}
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="h-64 flex items-center justify-center">
                      {selectedStudent && radarData.length > 0 ? (
                        <RadarChart data={radarData} dataKeys={RADAR_COLORS} />
                      ) : (
                        <div className="w-full h-full rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-sm font-medium text-slate-400 text-center px-6">
                          No evaluation data is available for this student yet.
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">Criteria Breakdown</h4>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Click a criterion for details
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedCriteria.length > 0 ? selectedCriteria.map((response, criterionIndex) => {
                          const style = CRITERIA_COLOR_STYLES[criterionIndex % CRITERIA_COLOR_STYLES.length];

                          return (
                            <button
                              key={response.criterion_key}
                              type="button"
                              onClick={() => setActiveCriterion({
                                key: response.criterion_key,
                                label: String(response.criterion_name || response.criterion_key),
                                icon: String(response.criterion_icon || 'Star'),
                                score: Number(response.star_value || 0),
                                reflection: String(response.reflection || '').trim(),
                                tip: String(response.tip_snapshot || '').trim(),
                              })}
                              className={cn(
                                'p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left hover:bg-white transition-all',
                                style.hover
                              )}
                            >
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className={cn('size-10 rounded-2xl flex items-center justify-center', style.iconBg, style.iconText)}>
                                  {getIcon(response.criterion_icon)}
                                </div>
                                <span className={cn('text-[10px] font-black uppercase tracking-widest', style.detailText)}>Details</span>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                {response.criterion_name || response.criterion_key}
                              </p>
                              <div className={cn('flex', style.stars)}>
                                {Array.from({ length: Math.max(1, selectedStudent?.ratingScale || 5) }).map((_, index) => (
                                  <Star
                                    key={`${response.criterion_key}-${index}`}
                                    className={cn(
                                      'w-3 h-3 fill-current',
                                      index >= Math.floor(Number(response.star_value || 0)) && 'text-slate-200 fill-slate-200'
                                    )}
                                  />
                                ))}
                              </div>
                            </button>
                          );
                        }) : Array.from({ length: 4 }).map((_, index) => (
                          <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">No Data</p>
                            <div className="flex text-slate-200">
                              {Array.from({ length: 5 }).map((__, starIndex) => (
                                <Star key={starIndex} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-sm font-bold text-slate-900">Teacher's Qualitative Feedback Chat</h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {conversationMessages.length} messages
                        </span>
                      </div>
                      <div className="max-h-80 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        {conversationMessages.length > 0 ? (
                          conversationMessages.map((message) => (
                            <div key={message.id} className={cn('flex', message.source === 'teacher' ? 'justify-end' : 'justify-start')}>
                              <div
                                className={cn(
                                  'max-w-[85%] rounded-2xl border px-3 py-2',
                                  message.source === 'teacher'
                                    ? 'bg-primary text-white border-primary/40'
                                    : 'bg-white text-slate-700 border-slate-200'
                                )}
                              >
                                <p className={cn('text-[10px] font-black uppercase tracking-widest', message.source === 'teacher' ? 'text-white/80' : 'text-slate-400')}>
                                  {message.source === 'teacher' ? 'Teacher' : 'Student'} • {formatShortDate(message.createdAt)}
                                  {message.source === 'student' ? ` • ${message.isRead ? 'Read' : 'Unread'}` : ''}
                                </p>
                                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setReplyToMessage(message)}
                                    className={cn(
                                      'rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-colors',
                                      message.source === 'teacher'
                                        ? 'border border-white/30 bg-white/15 text-white hover:bg-white/25'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                                    )}
                                  >
                                    Reply
                                  </button>
                                  {message.source === 'teacher' && message.feedbackId ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleHideFeedbackForMe(Number(message.feedbackId))}
                                        className="rounded-lg border border-white/30 bg-white/15 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/25 transition-colors"
                                      >
                                        Hide
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteFeedbackForEveryone(Number(message.feedbackId))}
                                        disabled={isDeletingFeedbackId === Number(message.feedbackId)}
                                        className="rounded-lg border border-white/30 bg-rose-500/85 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white hover:bg-rose-500 transition-colors disabled:opacity-60 inline-flex items-center gap-1"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        {isDeletingFeedbackId === Number(message.feedbackId) ? 'Deleting...' : 'Delete'}
                                      </button>
                                    </>
                                  ) : null}
                                  {message.source === 'student' && !message.isRead && message.notificationId ? (
                                    <button
                                      type="button"
                                      onClick={() => handleMarkReplyAsRead(Number(message.notificationId))}
                                      disabled={isMarkingReplyReadId === Number(message.notificationId)}
                                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60"
                                    >
                                      {isMarkingReplyReadId === Number(message.notificationId) ? 'Saving...' : 'Mark Read'}
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm font-medium text-slate-400">
                            No messages yet. Write the first feedback below.
                          </div>
                        )}
                      </div>

                      {replyToMessage ? (
                        <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[11px] font-bold text-primary">
                              Replying to {replyToMessage.source === 'student' ? 'student' : 'teacher'}: "{replyToMessage.text.slice(0, 120)}"
                            </p>
                            <button type="button" onClick={() => setReplyToMessage(null)} className="text-slate-400 hover:text-slate-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between gap-4">
                        <span className={cn(
                          'text-[10px] font-black uppercase tracking-widest',
                          feedbackDraft.length > teacherMaxFeedbackCharacters ? 'text-rose-600' : 'text-slate-400'
                        )}>
                          {feedbackDraft.length}/{teacherMaxFeedbackCharacters}
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        placeholder="Write your message..."
                        maxLength={teacherMaxFeedbackCharacters}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none"
                        value={feedbackDraft}
                        onChange={(e) => setFeedbackDraft(e.target.value)}
                      />
                      {latestTeacherFeedback ? (
                        <p className="text-[11px] font-bold text-slate-400">
                          Your latest sent message was posted on {formatShortDate(latestTeacherFeedback.created_at)}.
                        </p>
                      ) : null}
                      {feedbackError ? (
                        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                          {feedbackError}
                        </div>
                      ) : null}
                      {feedbackSuccess ? (
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                          {feedbackSuccess}
                        </div>
                      ) : null}
                    </div>

                    <button
                      onClick={handleSubmitFeedback}
                      disabled={!selectedStudent || isSubmittingFeedback || !teacherId}
                      className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <Send className="w-5 h-5" />
                      {isSubmittingFeedback ? 'Sending Message...' : 'Send Message'}
                    </button>
                    <p className="text-center text-[10px] text-slate-400">
                      {selectedStudent?.latestEvaluation?.submitted_at
                        ? `Latest evaluation submitted on ${formatShortDate(selectedStudent.latestEvaluation.submitted_at)}`
                        : 'No submitted evaluation yet'}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {pendingDeleteFeedbackId ? (
        <div className="fixed inset-0 z-[118] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setPendingDeleteFeedbackId(null)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-black text-slate-900">Delete Message?</h3>
            <p className="mt-2 text-sm text-slate-500">
              This will delete the selected feedback message for both teacher and student.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteFeedbackId(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFeedbackForEveryone}
                disabled={isDeletingFeedbackId === Number(pendingDeleteFeedbackId)}
                className="flex-1 rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white hover:bg-rose-600 disabled:opacity-60"
              >
                {isDeletingFeedbackId === Number(pendingDeleteFeedbackId) ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {activeCriterion ? (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCriterion(null)}
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full md:w-[480px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col z-[100]"
            >
              <div className="p-8 border-b border-slate-100 flex items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="size-14 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
                    {getIcon(activeCriterion.icon, 'w-7 h-7')}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-widest text-primary">Criterion Detail</p>
                    <h3 className="text-2xl font-black text-slate-900">{activeCriterion.label}</h3>
                    <div className="flex items-center gap-3 text-primary">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={cn(
                            'w-4 h-4 fill-current',
                            index >= Math.floor(activeCriterion.score) && 'text-slate-200 fill-slate-200'
                          )}
                        />
                      ))}
                      <span className="text-sm font-black text-slate-900">{activeCriterion.score}/5 Stars</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCriterion(null)}
                  className="size-10 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                  <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-2">Assigned Tip</p>
                  <p className="text-sm font-medium leading-relaxed text-slate-700">
                    {activeCriterion.tip || 'No admin tip was saved for this criterion.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Student Reflection</p>
                  <p className="text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {activeCriterion.reflection || 'No student reflection was submitted for this criterion.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}


