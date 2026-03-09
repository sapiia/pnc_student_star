import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Bell, 
  HelpCircle, 
  PlusCircle,
  Home,
  Briefcase,
  Users,
  Heart,
  Smile,
  Brain,
  CreditCard,
  Wrench,
  Clock,
  AlertTriangle,
  ArrowRight,
  X,
  Users2,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import StarRating from '../components/StarRating';
import RadarChart from '../components/RadarChart';
import Sidebar from '../components/Sidebar';
import { getRealtimeSocket, type FeedbackRealtimePayload } from '../lib/realtime';

type EvaluationResponse = {
  criterion_key: string;
  criterion_name?: string;
  criterion_icon?: string;
  star_value: number;
  reflection?: string;
  tip_snapshot?: string;
};

type EvaluationRecord = {
  period: string;
  rating_scale?: number;
  submitted_at?: string;
  created_at?: string;
  responses?: EvaluationResponse[];
};

type FeedbackItem = {
  id: number;
  teacher_name?: string;
  teacher_profile_image?: string | null;
  comment: string;
  created_at?: string;
};

type NotificationItem = {
  id: number;
  message: string;
  is_read: number;
  created_at?: string;
};

type CriterionDetail = {
  key: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  score: number;
  reflection: string;
  tip: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const STATUS_CARD_STYLES = [
  { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { color: 'text-violet-600', bgColor: 'bg-violet-100' },
  { color: 'text-rose-600', bgColor: 'bg-rose-100' },
  { color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { color: 'text-sky-600', bgColor: 'bg-sky-100' },
] as const;

const formatPeriodLabel = (period: string) => {
  const trimmed = String(period || '').trim();
  const quarterMatch = trimmed.match(/^(\d{4})-Q([1-4])$/i);
  if (quarterMatch) {
    return `Q${quarterMatch[2]} ${quarterMatch[1]}`;
  }
  return trimmed || 'Current';
};

const formatShortDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No evaluation yet';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const formatLongDate = (value: Date) => (
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value)
);

const getCurrentPeriodLabel = () => {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `Q${quarter} ${now.getFullYear()}`;
};

const getPeriodSortValue = (period: string) => {
  const trimmed = String(period || '').trim();
  const quarterMatch = trimmed.match(/^(\d{4})-Q([1-4])$/i);
  if (quarterMatch) {
    return Number(quarterMatch[1]) * 10 + Number(quarterMatch[2]);
  }
  return Number.MIN_SAFE_INTEGER;
};

const getEvaluationSortValue = (evaluation: EvaluationRecord) => {
  const periodSortValue = getPeriodSortValue(evaluation.period);
  if (periodSortValue !== Number.MIN_SAFE_INTEGER) {
    return periodSortValue;
  }

  const dateValue = new Date(
    String(evaluation.submitted_at || evaluation.created_at || '')
  ).getTime();
  return Number.isNaN(dateValue) ? Number.MIN_SAFE_INTEGER : dateValue;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const currentPeriodLabel = getCurrentPeriodLabel();
  const [daysLeft, setDaysLeft] = useState(0);
  const [cycleDays, setCycleDays] = useState(90);
  const [showUrgentNotification, setShowUrgentNotification] = useState(false);
  const [studentName, setStudentName] = useState('Student');
  const [studentId, setStudentId] = useState('');
  const [studentUserId, setStudentUserId] = useState<number | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<FeedbackItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [latestEvaluation, setLatestEvaluation] = useState<EvaluationRecord | null>(null);
  const [activeCriterion, setActiveCriterion] = useState<CriterionDetail | null>(null);
  const [assessmentWindow, setAssessmentWindow] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const canStartEvaluation = !latestEvaluation || daysLeft === 0;

  const currentStatusCriteria = useMemo(() => (
    (latestEvaluation?.responses || []).map((response, index) => ({
      key: response.criterion_key,
      label: String(response.criterion_name || response.criterion_key || `Criterion ${index + 1}`),
      icon: String(response.criterion_icon || 'Star'),
      score: Number(response.star_value || 0),
      reflection: String(response.reflection || '').trim(),
      tip: String(response.tip_snapshot || '').trim(),
      ...STATUS_CARD_STYLES[index % STATUS_CARD_STYLES.length],
    }))
  ), [latestEvaluation]);

  const historicalComparison = useMemo(() => {
    const sortedEvaluations = [...evaluations].sort((left, right) => (
      getEvaluationSortValue(left) - getEvaluationSortValue(right)
    ));

    if (sortedEvaluations.length === 0) {
      return { data: [], dataKeys: [] as { key: string; name: string; color: string; fill: string }[] };
    }

    const comparedEvaluations = sortedEvaluations.length === 1
      ? [sortedEvaluations[0]]
      : sortedEvaluations.slice(-2);

    const criteriaOrder = comparedEvaluations.reduce<string[]>((accumulator, evaluation) => {
      (evaluation.responses || []).forEach((response, index) => {
        const fallbackKey = `criterion-${index + 1}`;
        const key = String(response.criterion_key || response.criterion_name || fallbackKey).trim() || fallbackKey;
        if (!accumulator.includes(key)) {
          accumulator.push(key);
        }
      });
      return accumulator;
    }, []);

    const data = criteriaOrder.map((criterionKey, index) => {
      const subject =
        comparedEvaluations
          .flatMap((evaluation) => evaluation.responses || [])
          .find((response) => String(response.criterion_key || '').trim() === criterionKey)?.criterion_name ||
        criterionKey;

      const row: Record<string, string | number> = {
        subject: String(subject || `Criterion ${index + 1}`),
      };

      comparedEvaluations.forEach((evaluation, evaluationIndex) => {
        const chartKey = comparedEvaluations.length === 1
          ? 'current'
          : evaluationIndex === 0
            ? 'previous'
            : 'current';
        const response = (evaluation.responses || []).find((item) => String(item.criterion_key || '').trim() === criterionKey);
        const ratingScale = Math.max(1, Number(evaluation.rating_scale || 5));
        row[chartKey] = response ? Math.max(0, Number(response.star_value || 0) * (100 / ratingScale)) : 0;
      });

      return row;
    });

    const dataKeys = comparedEvaluations.map((evaluation, index) => ({
      key: comparedEvaluations.length === 1 ? 'current' : index === 0 ? 'previous' : 'current',
      name: formatPeriodLabel(evaluation.period),
      color: comparedEvaluations.length === 1 || index === comparedEvaluations.length - 1 ? '#5d5fef' : '#94a3b8',
      fill: comparedEvaluations.length === 1 || index === comparedEvaluations.length - 1 ? '#5d5fef' : '#94a3b8',
    }));

    return { data, dataKeys };
  }, [evaluations]);

  useEffect(() => {
    if (daysLeft <= 3) {
      setShowUrgentNotification(true);
    } else {
      setShowUrgentNotification(false);
    }
  }, [daysLeft]);

  useEffect(() => {
    const loadEvaluationWindow = async () => {
      try {
        const [startResponse, endResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/settings/key/next_assessment_start`),
          fetch(`${API_BASE_URL}/settings/key/next_assessment_end`),
        ]);
        const startData = await startResponse.json().catch(() => ({}));
        const endData = await endResponse.json().catch(() => ({}));

        setAssessmentWindow({
          start: startResponse.ok ? String(startData?.value || '').slice(0, 10) : '',
          end: endResponse.ok ? String(endData?.value || '').slice(0, 10) : '',
        });
      } catch {
        setAssessmentWindow({ start: '', end: '' });
      }
    };

    void loadEvaluationWindow();
    window.addEventListener('evaluation-window-updated', loadEvaluationWindow);
    return () => window.removeEventListener('evaluation-window-updated', loadEvaluationWindow);
  }, []);

  const loadRecentFeedback = useCallback(async () => {
    if (!studentUserId) {
      setRecentFeedback([]);
      return;
    }

    try {
      const [studentFeedbackVisibilityResponse, feedbackResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/settings/key/student_can_view_teacher_feedback`),
        fetch(`${API_BASE_URL}/feedbacks/student/${studentUserId}`),
      ]);

      const studentFeedbackVisibilityData = await studentFeedbackVisibilityResponse.json().catch(() => ({}));
      const feedbackData = await feedbackResponse.json().catch(() => []);

      const canViewTeacherFeedback = !['false', '0'].includes(
        String(studentFeedbackVisibilityData?.value || 'true').trim().toLowerCase()
      );

      if (!canViewTeacherFeedback || !feedbackResponse.ok || !Array.isArray(feedbackData)) {
        setRecentFeedback([]);
        return;
      }

      const normalizedFeedback = [...(feedbackData as FeedbackItem[])]
        .sort((left, right) => (
          new Date(String(right.created_at || '')).getTime() - new Date(String(left.created_at || '')).getTime()
        ))
        .slice(0, 3);

      setRecentFeedback(normalizedFeedback);
    } catch {
      setRecentFeedback([]);
    }
  }, [studentUserId]);

  const loadIdentity = useCallback(async () => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return;
      const authUser = JSON.parse(raw);
      const userId = Number(authUser?.id);
      if (!Number.isInteger(userId) || userId <= 0) return;

      setStudentUserId(userId);

      const localName = String(authUser?.name || '').trim();
      const localStudentId = String(authUser?.student_id || '').trim();
      if (localName) setStudentName(localName);
      if (localStudentId) setStudentId(localStudentId);

      const studentPrefsRaw = localStorage.getItem(`student_notify_${userId}`);
      const studentPrefs = studentPrefsRaw ? JSON.parse(studentPrefsRaw) : null;
      const remindersEnabled = studentPrefs?.remindersEnabled !== false;

      const [
        response,
        intervalResponse,
        evaluationsResponse,
        studentFeedbackVisibilityResponse,
        reminderNotificationsResponse,
        feedbackResponse,
        notificationsResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/users/${userId}`),
        fetch(`${API_BASE_URL}/settings/key/evaluation_interval_days`),
        fetch(`${API_BASE_URL}/evaluations/user/${userId}`),
        fetch(`${API_BASE_URL}/settings/key/student_can_view_teacher_feedback`),
        fetch(`${API_BASE_URL}/settings/key/student_receives_reminder_notifications`),
        fetch(`${API_BASE_URL}/feedbacks/student/${userId}`),
        fetch(`${API_BASE_URL}/notifications/user/${userId}`)
      ]);

      const data = await response.json().catch(() => ({}));
      const intervalData = await intervalResponse.json().catch(() => ({}));
      const evaluations = await evaluationsResponse.json().catch(() => []);
      const studentFeedbackVisibilityData = await studentFeedbackVisibilityResponse.json().catch(() => ({}));
      const reminderNotificationsData = await reminderNotificationsResponse.json().catch(() => ({}));
      const feedbackData = await feedbackResponse.json().catch(() => []);
      const notificationsData = await notificationsResponse.json().catch(() => []);
      const sortedEvaluations = Array.isArray(evaluations)
        ? [...evaluations as EvaluationRecord[]].sort((left, right) => (
            getEvaluationSortValue(right) - getEvaluationSortValue(left)
          ))
        : [];
      const latestEvaluationRecord = sortedEvaluations.length > 0 ? sortedEvaluations[0] : null;

      const resolvedName =
        String(data?.name || '').trim() ||
        [data?.first_name, data?.last_name].filter(Boolean).join(' ').trim() ||
        localName ||
        'Student';
      const resolvedStudentId = String(data?.student_id || data?.resolved_student_id || localStudentId || '').trim();

      setStudentName(resolvedName);
      setStudentId(resolvedStudentId);
      setEvaluations(sortedEvaluations);

      const canViewTeacherFeedback = !['false', '0'].includes(
        String(studentFeedbackVisibilityData?.value || 'true').trim().toLowerCase()
      );
      const normalizedFeedback = canViewTeacherFeedback && Array.isArray(feedbackData)
        ? [...(feedbackData as FeedbackItem[])]
          .sort((left, right) => (
            new Date(String(right.created_at || '')).getTime() - new Date(String(left.created_at || '')).getTime()
          ))
          .slice(0, 3)
        : [];
      setRecentFeedback(normalizedFeedback);
      const userNotifications = Array.isArray(notificationsData)
        ? notificationsData as NotificationItem[]
        : [];
      setUnreadNotificationCount(
        userNotifications.filter((notification) => Number(notification.is_read) !== 1).length
      );

      const resolvedCycleDays = Math.min(365, Math.max(30, Number(intervalData?.value || 90)));
      setCycleDays(resolvedCycleDays);

      const localEvaluationKey = `last_evaluation_submitted_at_${userId}`;
      const latestEvaluationDateRaw =
        String(latestEvaluationRecord?.submitted_at || latestEvaluationRecord?.created_at || '').trim() ||
        String(localStorage.getItem(localEvaluationKey) || '').trim();

      setLatestEvaluation(latestEvaluationRecord);

      if (!latestEvaluationDateRaw) {
        setDaysLeft(0);
        return;
      }

      const latestEvaluationDate = new Date(latestEvaluationDateRaw);
      if (Number.isNaN(latestEvaluationDate.getTime())) {
        setDaysLeft(0);
        return;
      }

      const nextEvaluationDate = new Date(latestEvaluationDate);
      nextEvaluationDate.setDate(nextEvaluationDate.getDate() + resolvedCycleDays);

      const remainingMilliseconds = nextEvaluationDate.getTime() - Date.now();
      const resolvedDaysLeft = Math.max(0, Math.ceil(remainingMilliseconds / (1000 * 60 * 60 * 24)));
      setDaysLeft(resolvedDaysLeft);

      const adminAllowsReminders = !['false', '0'].includes(
        String(reminderNotificationsData?.value || 'true').trim().toLowerCase()
      );

      if (adminAllowsReminders && remindersEnabled && resolvedDaysLeft === 3) {
        const reminderMessage = `Reminder: your next evaluation opens in 3 days on ${formatLongDate(nextEvaluationDate)}.`;
        const hasExistingReminder = userNotifications.some((notification) => (
          String(notification.message || '').trim() === reminderMessage
        ));

        if (!hasExistingReminder) {
          const createReminderResponse = await fetch(`${API_BASE_URL}/notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              message: reminderMessage,
              is_read: 0,
            }),
          });

          if (createReminderResponse.ok) {
            setUnreadNotificationCount((current) => current + 1);
            window.dispatchEvent(new Event('student-notifications-updated'));
          }
        }
      }
    } catch {
      setStudentUserId(null);
      setCycleDays(90);
      setDaysLeft(0);
      setEvaluations([]);
      setRecentFeedback([]);
      setUnreadNotificationCount(0);
      setLatestEvaluation(null);
    }
  }, []);

  useEffect(() => {
    void loadIdentity();
  }, [loadIdentity]);

  useEffect(() => {
    void loadRecentFeedback();
  }, [loadRecentFeedback]);

  useEffect(() => {
    if (!studentUserId) return;

    const socket = getRealtimeSocket();
    const subscription = { studentId: studentUserId };
    const handleFeedbackEvent = (payload: FeedbackRealtimePayload = {}) => {
      if (Number(payload.studentId) !== studentUserId) return;
      void loadRecentFeedback();
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
  }, [loadRecentFeedback, studentUserId]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <Home className="w-6 h-6" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6" />;
      case 'Users': return <Users className="w-6 h-6" />;
      case 'Users2': return <Users2 className="w-6 h-6" />;
      case 'Heart': return <Heart className="w-6 h-6" />;
      case 'Smile': return <Smile className="w-6 h-6" />;
      case 'Brain': return <Brain className="w-6 h-6" />;
      case 'CreditCard': return <CreditCard className="w-6 h-6" />;
      case 'Wrench': return <Wrench className="w-6 h-6" />;
      case 'MessageCircle': return <MessageCircle className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Home className="w-4 h-4" />
            <span>/</span>
            <span className="font-medium text-slate-900">Student Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/notifications')}
              title="Notifications"
              className="size-10 rounded-full flex items-center justify-center hover:bg-slate-100 relative text-slate-600"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 min-w-5 h-5 px-1 bg-red-500 rounded-full ring-2 ring-white text-white text-[10px] font-black flex items-center justify-center">
                  {Math.min(unreadNotificationCount, 9)}
                </span>
              ) : null}
            </button>
            <button 
              onClick={() => navigate('/help')}
              title="Help Center"
              className="size-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {assessmentWindow.start && assessmentWindow.end ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Evaluation Window</p>
              <p className="text-sm font-bold text-slate-700 mt-1">{assessmentWindow.start} to {assessmentWindow.end}</p>
            </div>
          ) : null}
          {/* Urgent Notification */}
          <AnimatePresence>
            {showUrgentNotification && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-4 text-rose-800"
              >
                <div className="size-10 bg-rose-500 text-white rounded-lg flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{daysLeft === 0 ? 'Action Required: Evaluation Is Due Now' : 'Action Required: Evaluation Window Opening Soon!'}</p>
                  <p className="text-xs opacity-80">
                    {daysLeft === 0
                      ? 'Your self-evaluation is due now. Please complete it as soon as possible.'
                      : `Your next self-evaluation is scheduled in ${daysLeft} days. Please prepare your self-reflection.`}
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/evaluate')}
                  className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition-colors"
                >
                  View Schedule
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary Welcome Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row items-center h-full">
                <div className="p-8 flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Hello, {studentName}! Ready for your {currentPeriodLabel} Evaluation?</h2>
                  {studentId && (
                    <p className="text-xs font-bold text-slate-500 mb-2">Student ID: {studentId}</p>
                  )}
                  <p className="text-slate-600 mb-6 max-w-xl">Track your progress across 8 key areas of development. Regular self-reflection helps you stay focused on your personal and professional growth goals.</p>
                  {!canStartEvaluation ? (
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-4">
                      Next evaluation unlocks in {daysLeft} day{daysLeft === 1 ? '' : 's'}
                    </p>
                  ) : null}
                  <button 
                    onClick={() => canStartEvaluation && navigate('/evaluate')}
                    disabled={!canStartEvaluation}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
                  >
                    <PlusCircle className="w-5 h-5" />
                    {canStartEvaluation ? 'Start New Evaluation' : `Available In ${daysLeft} Days`}
                  </button>
                </div>
                <div className="w-full md:w-64 h-48 md:h-auto bg-primary/5 flex items-center justify-center">
                  <div className="relative">
                    <div className="size-32 bg-primary/20 rounded-full animate-pulse flex items-center justify-center">
                      <Star className="w-12 h-12 text-primary fill-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Countdown Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden flex flex-col justify-center"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Clock className="w-32 h-32 -mr-8 -mt-8" />
              </div>
              <div className="relative z-10">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Next Evaluation In</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-6xl font-black">{daysLeft}</span>
                  <span className="text-xl font-bold text-slate-400">Days</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, (daysLeft / cycleDays) * 100))}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Cycle: {cycleDays} Days</span>
                    <span>{Math.round(Math.min(100, Math.max(0, (daysLeft / cycleDays) * 100)))}% Remaining</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Star Rating Grid */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Current Status ({formatPeriodLabel(latestEvaluation?.period || '')})</h3>
                <span className="text-sm text-slate-500">
                  Last updated: {formatShortDate(String(latestEvaluation?.submitted_at || latestEvaluation?.created_at || ''))}
                </span>
              </div>
              {currentStatusCriteria.length === 0 ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-dashed border-slate-200 text-sm font-bold text-slate-400">
                  No submitted evaluation is available yet for the current status section.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentStatusCriteria.map((criterion, idx) => (
                    <motion.button
                      type="button"
                      key={criterion.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -3, scale: 1.01 }}
                      onClick={() => {
                        setActiveCriterion({
                          key: criterion.key,
                          label: criterion.label,
                          icon: criterion.icon,
                          color: criterion.color,
                          bgColor: criterion.bgColor,
                          score: criterion.score,
                          reflection: criterion.reflection,
                          tip: criterion.tip,
                        });
                      }}
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 text-left hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-colors"
                    >
                      <div className={`size-12 rounded-lg ${criterion.bgColor} ${criterion.color} flex items-center justify-center shrink-0`}>
                        {getIcon(criterion.icon)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold mb-1">{criterion.label}</p>
                        <StarRating rating={criterion.score} />
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Progress & Teacher Feedback */}
            <div className="space-y-8">
              {/* Progress Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-slate-500">Historical Growth</h3>
                {historicalComparison.data.length > 0 ? (
                  <RadarChart data={historicalComparison.data} dataKeys={historicalComparison.dataKeys} />
                ) : (
                  <div className="h-[350px] rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-sm font-bold text-slate-400">
                    No evaluation history is available yet.
                  </div>
                )}
              </div>

              {/* Teacher Feedback */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Recent Feedback</h3>
                  <button 
                    onClick={() => navigate('/feedback')}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentFeedback.length > 0 ? recentFeedback.map((feedback) => (
                    <div key={feedback.id} className="flex gap-3">
                      <div className="size-8 rounded-full overflow-hidden shrink-0 bg-slate-100">
                        {feedback.teacher_profile_image ? (
                          <img alt={feedback.teacher_name || 'Teacher'} src={feedback.teacher_profile_image} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-black">
                            {(feedback.teacher_name || 'T').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg flex-1">
                        <div className="flex justify-between items-start mb-1 gap-3">
                          <p className="text-xs font-bold">
                            {feedback.teacher_name || 'Teacher'}
                            <span className="text-[10px] font-normal text-slate-400 block sm:inline sm:ml-2">
                              {formatShortDate(String(feedback.created_at || ''))}
                            </span>
                          </p>
                        </div>
                        <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">{feedback.comment}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-400">
                      No recent teacher feedback is available yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={`size-14 rounded-2xl flex items-center justify-center ${activeCriterion.bgColor} ${activeCriterion.color}`}>
                    {getIcon(activeCriterion.icon)}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-widest text-primary">Current Status Detail</p>
                    <h3 className="text-2xl font-black text-slate-900">{activeCriterion.label}</h3>
                    <div className="flex items-center gap-3">
                      <StarRating rating={activeCriterion.score} starClassName="w-5 h-5" />
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
                    {activeCriterion.tip || 'No saved tip is available for this criterion yet.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Your Comment</p>
                  <p className="text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {activeCriterion.reflection || 'No written comment was saved for this criterion.'}
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
