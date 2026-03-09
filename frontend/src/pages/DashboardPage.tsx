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
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import StarRating from '../components/ui/StarRating';
import RadarChart from '../components/ui/RadarChart';
import Sidebar from '../components/layout/sidebar/Sidebar';
import Footer from "../components/layout/Footer";
import StudentMobileNav from '../components/StudentMobileNav';
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
  if (quarterMatch) return `Q${quarterMatch[2]} ${quarterMatch[1]}`;
  return trimmed || 'Current';
};

const formatShortDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No evaluation yet';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const formatLongDate = (value: Date) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(value);

const getCurrentPeriodLabel = () => {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `Q${quarter} ${now.getFullYear()}`;
};

const getPeriodSortValue = (period: string) => {
  const quarterMatch = String(period || '').trim().match(/^(\d{4})-Q([1-4])$/i);
  if (quarterMatch) return Number(quarterMatch[1]) * 10 + Number(quarterMatch[2]);
  return Number.MIN_SAFE_INTEGER;
};

const getEvaluationSortValue = (evaluation: EvaluationRecord) => {
  const periodSortValue = getPeriodSortValue(evaluation.period);
  if (periodSortValue !== Number.MIN_SAFE_INTEGER) return periodSortValue;
  const dateValue = new Date(String(evaluation.submitted_at || evaluation.created_at || '')).getTime();
  return Number.isNaN(dateValue) ? Number.MIN_SAFE_INTEGER : dateValue;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
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
    const sortedEvaluations = [...evaluations].sort((left, right) => getEvaluationSortValue(left) - getEvaluationSortValue(right));
    if (sortedEvaluations.length === 0) return { data: [], dataKeys: [] as { key: string; name: string; color: string; fill: string }[] };

    const comparedEvaluations = sortedEvaluations.length === 1 ? [sortedEvaluations[0]] : sortedEvaluations.slice(-2);
    const criteriaOrder = comparedEvaluations.reduce<string[]>((acc, evaluation) => {
      (evaluation.responses || []).forEach((response, idx) => {
        const key = String(response.criterion_key || response.criterion_name || `criterion-${idx + 1}`).trim() || `criterion-${idx + 1}`;
        if (!acc.includes(key)) acc.push(key);
      });
      return acc;
    }, []);

    const data = criteriaOrder.map((criterionKey, index) => {
      const subject = comparedEvaluations.flatMap(e => e.responses || []).find(r => String(r.criterion_key || '').trim() === criterionKey)?.criterion_name || criterionKey;
      const row: Record<string, string | number> = { subject: String(subject || `Criterion ${index + 1}`) };
      comparedEvaluations.forEach((evaluation, evaluationIndex) => {
        const chartKey = comparedEvaluations.length === 1 ? 'current' : evaluationIndex === 0 ? 'previous' : 'current';
        const response = (evaluation.responses || []).find(item => String(item.criterion_key || '').trim() === criterionKey);
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

  useEffect(() => { setShowUrgentNotification(daysLeft <= 3); }, [daysLeft]);

  const loadRecentFeedback = useCallback(async () => {
    if (!studentUserId) { setRecentFeedback([]); return; }
    try {
      const [visibilityRes, feedbackRes] = await Promise.all([
        fetch(`${API_BASE_URL}/settings/key/student_can_view_teacher_feedback`),
        fetch(`${API_BASE_URL}/feedbacks/student/${studentUserId}`)
      ]);
      const visibilityData = await visibilityRes.json().catch(() => ({}));
      const feedbackData = await feedbackRes.json().catch(() => []);
      const canView = !['false', '0'].includes(String(visibilityData?.value || 'true').trim().toLowerCase());
      if (!canView || !feedbackRes.ok || !Array.isArray(feedbackData)) { setRecentFeedback([]); return; }
      const normalized = [...feedbackData].sort((a, b) => new Date(String(b.created_at || '')).getTime() - new Date(String(a.created_at || '')).getTime()).slice(0, 3);
      setRecentFeedback(normalized);
    } catch { setRecentFeedback([]); }
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

      const prefsRaw = localStorage.getItem(`student_notify_${userId}`);
      const prefs = prefsRaw ? JSON.parse(prefsRaw) : null;
      const remindersEnabled = prefs?.remindersEnabled !== false;

      const [userRes, intervalRes, evalRes, visibilityRes, reminderRes, feedbackRes, notifRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/${userId}`),
        fetch(`${API_BASE_URL}/settings/key/evaluation_interval_days`),
        fetch(`${API_BASE_URL}/evaluations/user/${userId}`),
        fetch(`${API_BASE_URL}/settings/key/student_can_view_teacher_feedback`),
        fetch(`${API_BASE_URL}/settings/key/student_receives_reminder_notifications`),
        fetch(`${API_BASE_URL}/feedbacks/student/${userId}`),
        fetch(`${API_BASE_URL}/notifications/user/${userId}`)
      ]);

      const userData = await userRes.json().catch(() => ({}));
      const intervalData = await intervalRes.json().catch(() => ({}));
      const evalData = await evalRes.json().catch(() => []);
      const visibilityData = await visibilityRes.json().catch(() => ({}));
      const reminderData = await reminderRes.json().catch(() => ({}));
      const feedbackData = await feedbackRes.json().catch(() => []);
      const notifData = await notifRes.json().catch(() => []);

      const sortedEvals = Array.isArray(evalData) ? [...evalData].sort((a, b) => getEvaluationSortValue(b) - getEvaluationSortValue(a)) : [];
      const latestEval = sortedEvals.length > 0 ? sortedEvals[0] : null;

      const resolvedName = String(userData?.name || '').trim() || [userData?.first_name, userData?.last_name].filter(Boolean).join(' ').trim() || localName || 'Student';
      const resolvedStudentId = String(userData?.student_id || userData?.resolved_student_id || localStudentId || '').trim();

      setStudentName(resolvedName);
      setStudentId(resolvedStudentId);
      setEvaluations(sortedEvals);

      const canViewFeedback = !['false', '0'].includes(String(visibilityData?.value || 'true').trim().toLowerCase());
      if (canViewFeedback && Array.isArray(feedbackData)) {
        const normalized = [...feedbackData].sort((a, b) => new Date(String(b.created_at || '')).getTime() - new Date(String(a.created_at || '')).getTime()).slice(0, 3);
        setRecentFeedback(normalized);
      }

      const notifications = Array.isArray(notifData) ? notifData : [];
      setUnreadNotificationCount(notifications.filter(n => Number(n.is_read) !== 1).length);

      const resolvedCycle = Math.min(365, Math.max(30, Number(intervalData?.value || 90)));
      setCycleDays(resolvedCycle);

      const evalDateKey = `last_evaluation_submitted_at_${userId}`;
      const lastDateRaw = String(latestEval?.submitted_at || latestEval?.created_at || '').trim() || String(localStorage.getItem(evalDateKey) || '').trim();
      setLatestEvaluation(latestEval);

      if (!lastDateRaw) { setDaysLeft(0); return; }
      const lastDate = new Date(lastDateRaw);
      if (Number.isNaN(lastDate.getTime())) { setDaysLeft(0); return; }

      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + resolvedCycle);
      const remaining = nextDate.getTime() - Date.now();
      setDaysLeft(Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24))));

      const adminAllowsReminders = !['false', '0'].includes(String(reminderData?.value || 'true').trim().toLowerCase());
      const daysUntil = Math.ceil(remaining / (1000 * 60 * 60 * 24));
      if (adminAllowsReminders && remindersEnabled && daysUntil === 3) {
        const msg = `Reminder: your next evaluation opens in 3 days on ${formatLongDate(nextDate)}.`;
        if (!notifications.some(n => String(n.message || '').trim() === msg)) {
          const res = await fetch(`${API_BASE_URL}/notifications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, message: msg, is_read: 0 }) });
          if (res.ok) { setUnreadNotificationCount(c => c + 1); window.dispatchEvent(new Event('student-notifications-updated')); }
        }
      }
    } catch {
      setStudentUserId(null); setCycleDays(90); setDaysLeft(0); setEvaluations([]); setRecentFeedback([]); setUnreadNotificationCount(0); setLatestEvaluation(null);
    }
  }, []);

  useEffect(() => { void loadIdentity(); }, [loadIdentity]);
  useEffect(() => { void loadRecentFeedback(); }, [loadRecentFeedback]);

  useEffect(() => {
    if (!studentUserId) return;
    const socket = getRealtimeSocket();
    const sub = { studentId: studentUserId };
    const handler = (payload: FeedbackRealtimePayload = {}) => { if (Number(payload.studentId) !== studentUserId) return; void loadRecentFeedback(); };
    socket.emit('feedback:subscribe', sub);
    socket.on('feedback:created', handler); socket.on('feedback:updated', handler); socket.on('feedback:deleted', handler);
    return () => { socket.emit('feedback:unsubscribe', sub); socket.off('feedback:created', handler); socket.off('feedback:updated', handler); socket.off('feedback:deleted', handler); };
  }, [loadRecentFeedback, studentUserId]);

  const getIcon = (name: string) => {
    const icons: Record<string, React.ReactNode> = { Home: <Home />, Briefcase: <Briefcase />, Users: <Users />, Users2: <Users2 />, Heart: <Heart />, Smile: <Smile />, Brain: <Brain />, CreditCard: <CreditCard />, Wrench: <Wrench />, MessageCircle: <MessageCircle /> };
    const IconComponent = icons[name] || <Star />;
    return <span className="w-6 h-6">{IconComponent}</span>;
  };

  const cardTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };
  const listTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <StudentMobileNav />
        <header className="h-auto min-h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-4 md:px-8 py-3 md:py-0 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] md:text-sm">
            <Home className="w-3.5 h-3.5 md:w-4 md:h-4" /><span>/</span><span className="font-medium text-slate-900">Student Dashboard</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => navigate('/notifications')} className="size-9 md:size-10 rounded-full flex items-center justify-center hover:bg-slate-100 relative text-slate-600">
              <Bell className="w-4.5 h-4.5 md:w-5 md:h-5" />
              {unreadNotificationCount > 0 && <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-red-500 rounded-full text-white text-[8px] font-black">{Math.min(unreadNotificationCount, 9)}</span>}
            </button>
            <button onClick={() => navigate('/help')} className="size-9 md:size-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600">
              <HelpCircle className="w-4.5 h-4.5 md:w-5 md:h-5" />
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8">
          <AnimatePresence>
            {showUrgentNotification && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={listTransition} className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-4 text-rose-800">
                <div className="size-10 bg-rose-500 text-white rounded-lg flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div>
                <div className="flex-1"><p className="font-bold text-sm">{daysLeft === 0 ? 'Action Required: Evaluation Is Due Now' : 'Action Required: Evaluation Window Opening Soon!'}</p><p className="text-xs opacity-80">{daysLeft === 0 ? 'Your self-evaluation is due now.' : `Your next self-evaluation is scheduled in ${daysLeft} days.`}</p></div>
                <button onClick={() => navigate('/evaluate')} className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600">View Schedule</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={cardTransition} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex flex-col md:flex-row items-center h-full">
                <div className="p-6 md:p-8 flex-1 text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Hello, {studentName}! Ready for your {currentPeriodLabel} Evaluation?</h2>
                  {studentId && <p className="text-[10px] md:text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Student ID: {studentId}</p>}
                  <p className="text-sm md:text-base text-slate-600 mb-6 max-w-xl">Track your progress across 8 key areas. Regular reflection helps you stay focused on your goals.</p>
                  {!canStartEvaluation && <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-600 mb-6">Next evaluation unlocks in {daysLeft} day{daysLeft === 1 ? '' : 's'}</p>}
                  <div className="flex justify-center md:justify-start">
                    <button onClick={() => canStartEvaluation && navigate('/evaluate')} disabled={!canStartEvaluation} className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 text-sm shadow-lg shadow-primary/20">
                      <PlusCircle className="w-5 h-5" />{canStartEvaluation ? 'Start Evaluation' : `Available In ${daysLeft} Days`}
                    </button>
                  </div>
                </div>
                <div className="w-full md:w-64 h-40 md:h-auto bg-primary/5 flex items-center justify-center">
                  <div className={`size-24 md:size-32 bg-primary/20 rounded-full flex items-center justify-center ${prefersReducedMotion ? '' : 'animate-pulse'}`}><Star className="w-10 h-10 md:w-12 md:h-12 text-primary fill-primary" /></div>
                </div>
              </div>
            </motion.section>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...cardTransition, delay: 0.08 }} className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Clock className="w-24 h-24 md:w-32 md:h-32 -mr-6 md:-mr-8 -mt-6 md:-mt-8" /></div>
              <div className="relative z-10">
                <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-4">Next Evaluation In</p>
                <div className="flex items-baseline gap-2 mb-6"><span className="text-5xl md:text-6xl font-black">{daysLeft}</span><span className="text-lg md:text-xl font-bold text-slate-400">Days</span></div>
                <div className="space-y-3">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, (daysLeft / cycleDays) * 100))}%` }} transition={{ duration: 0.5 }} className="h-full bg-primary" />
                  </div>
                  <div className="flex justify-between text-[8px] md:text-[10px] font-black text-slate-500 uppercase"><span>Cycle: {cycleDays} Days</span><span>{Math.round(Math.min(100, Math.max(0, (daysLeft / cycleDays) * 100)))}% Remaining</span></div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between"><h3 className="text-lg font-bold">Current Status ({formatPeriodLabel(latestEvaluation?.period || '')})</h3><span className="text-sm text-slate-500">Last updated: {formatShortDate(String(latestEvaluation?.submitted_at || latestEvaluation?.created_at || ''))}</span></div>
              {currentStatusCriteria.length === 0 ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-dashed border-slate-200 text-sm font-bold text-slate-400">No submitted evaluation is available yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentStatusCriteria.map((criterion, idx) => (
                    <motion.button key={criterion.key} type="button" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...listTransition, delay: idx * 0.04 }} whileHover={{ y: -2 }} onClick={() => setActiveCriterion({ key: criterion.key, label: criterion.label, icon: criterion.icon, color: criterion.color, bgColor: criterion.bgColor, score: criterion.score, reflection: criterion.reflection, tip: criterion.tip })} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 text-left hover:border-primary/30 hover:shadow-lg transition-all">
                      <div className={`size-12 rounded-lg ${criterion.bgColor} ${criterion.color} flex items-center justify-center`}>{getIcon(criterion.icon)}</div>
                      <div className="flex-1"><p className="text-sm font-semibold mb-1">{criterion.label}</p><StarRating rating={criterion.score} /></div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-slate-500">Historical Growth</h3>
                {historicalComparison.data.length > 0 ? <RadarChart data={historicalComparison.data} dataKeys={historicalComparison.dataKeys} /> : <div className="h-[350px] rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-sm font-bold text-slate-400">No evaluation history yet.</div>}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Recent Feedback</h3><button onClick={() => navigate('/feedback')} className="text-xs text-primary font-semibold hover:underline">View All</button></div>
                <div className="space-y-4">
                  {recentFeedback.length > 0 ? recentFeedback.map(feedback => (
                    <div key={feedback.id} className="flex gap-3">
                      <div className="size-8 rounded-full overflow-hidden bg-slate-100 shrink-0">{feedback.teacher_profile_image ? <img alt={feedback.teacher_name || 'Teacher'} src={feedback.teacher_profile_image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-black">{(feedback.teacher_name || 'T').charAt(0).toUpperCase()}</div>}</div>
                      <div className="bg-slate-50 p-3 rounded-lg flex-1"><p className="text-xs font-bold">{feedback.teacher_name || 'Teacher'}<span className="text-[10px] font-normal text-slate-400 ml-2">{formatShortDate(String(feedback.created_at || ''))}</span></p><p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">{feedback.comment}</p></div>
                    </div>
                  )) : <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-400">No recent feedback yet.</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>

      <AnimatePresence>
        {activeCriterion && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveCriterion(null)} className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.97 }} transition={listTransition} className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={`size-14 rounded-2xl flex items-center justify-center ${activeCriterion.bgColor} ${activeCriterion.color}`}>{getIcon(activeCriterion.icon)}</div>
                  <div className="space-y-2"><p className="text-[11px] font-black uppercase tracking-widest text-primary">Current Status Detail</p><h3 className="text-2xl font-black text-slate-900">{activeCriterion.label}</h3><div className="flex items-center gap-3"><StarRating rating={activeCriterion.score} starClassName="w-5 h-5" /><span className="text-sm font-black text-slate-900">{activeCriterion.score}/5 Stars</span></div></div>
                </div>
                <button onClick={() => setActiveCriterion(null)} className="size-10 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5"><p className="text-[11px] font-black uppercase tracking-widest text-primary mb-2">Assigned Tip</p><p className="text-sm font-medium leading-relaxed text-slate-700">{activeCriterion.tip || 'No saved tip is available for this criterion yet.'}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Your Comment</p><p className="text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">{activeCriterion.reflection || 'No written comment was saved for this criterion.'}</p></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


