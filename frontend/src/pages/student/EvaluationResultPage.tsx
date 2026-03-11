import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRealtimeSocket } from '../../lib/realtime';
import {
  ArrowRight,
  Bell,
  Brain,
  Briefcase,
  CreditCard,
  Heart,
  History,
  Home,
  LayoutDashboard,
  Lightbulb,
  PartyPopper,
  Settings,
  Smile,
  Star,
  TrendingUp,
  Users,
  Users2,
  Wrench,
  X,
  MessageCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import StarRating from '../../components/ui/StarRating';
import RadarChart from '../../components/ui/RadarChart';
import Sidebar from '../../components/layout/sidebar/student/Sidebar';
import StudentMobileNav from '../../components/common/StudentMobileNav';


type EvaluationResponse = {
  criterion_id?: string | null;
  criterion_key: string;
  criterion_name: string;
  criterion_icon?: string | null;
  star_value: number;
  reflection: string;
  tip_snapshot?: string;
};

type EvaluationRecord = {
  id: number;
  user_id?: number;
  period: string;
  rating_scale: number;
  average_score: number;
  submitted_at: string;
  created_at: string;
  responses: EvaluationResponse[];
};

type FeedbackItem = {
  id: number;
  teacher_name?: string;
  teacher_profile_image?: string | null;
  evaluation_id?: number | null;
  comment: string;
  created_at?: string;
};

type CriterionView = {
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
const CRITERION_STYLES = [
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

const toCriterionKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');

const toPeriodLabel = (period: string) => {
  const trimmed = String(period || '').trim();
  const quarterMatch = trimmed.match(/^(\d{4})-Q([1-4])$/i);
  if (quarterMatch) {
    return `Q${quarterMatch[2]} ${quarterMatch[1]}`;
  }
  return trimmed || 'Current';
};

const formatLongDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const getIcon = (iconName: string, className?: string) => {
  switch (iconName) {
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

export default function EvaluationResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as {
    scores?: Record<string, number>;
    reflections?: Record<string, string>;
    evaluationId?: number;
  };

  const [evaluation, setEvaluation] = useState<EvaluationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(locationState.evaluationId));
  const [quarterFeedback, setQuarterFeedback] = useState<FeedbackItem[]>([]);
  const [activeCriterion, setActiveCriterion] = useState<CriterionView | null>(null);
  const [globalRatingScale, setGlobalRatingScale] = useState<number>(5);
  const feedbackScrollRef = useRef<HTMLDivElement | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [globalCriteria, setGlobalCriteria] = useState<any[]>([]);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 5000);
  };

  useEffect(() => {
    const loadEvaluationAndComparison = async () => {
      // Fetch global rating scale configuration
      try {
        const criteriaRes = await fetch(`${API_BASE_URL}/settings/evaluation-criteria`);
        const criteriaData = await criteriaRes.json().catch(() => ({}));
        if (criteriaRes.ok && criteriaData?.ratingScale) {
          setGlobalRatingScale(Math.max(1, Number(criteriaData.ratingScale)));
        }
        if (criteriaRes.ok && Array.isArray(criteriaData?.criteria)) {
          setGlobalCriteria(criteriaData.criteria);
        }
      } catch (err) {
        console.error('Error loading global rating scale/criteria:', err);
      }

      if (!locationState.evaluationId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/evaluations/${locationState.evaluationId}`);
        const currentData = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(currentData?.error || 'Failed to load evaluation result.');
        }
        setEvaluation(currentData as EvaluationRecord);

        // Fetch user's evaluation history to find the previous one for comparison
        const userId = Number(currentData.user_id);
        if (userId) {
          const historyResponse = await fetch(`${API_BASE_URL}/evaluations/user/${userId}`);
          const historyData = await historyResponse.json().catch(() => []);
          if (Array.isArray(historyData) && historyData.length > 1) {
            // History is usually sorted by date descending, so current is at [0] and previous is at [1]
            // But since we just submitted, current might be at [0]
            const sortedHistory = [...historyData].sort((a, b) => 
              new Date(b.submitted_at || b.created_at).getTime() - new Date(a.submitted_at || a.created_at).getTime()
            );
            
            const currentIndex = sortedHistory.findIndex(h => Number(h.id) === Number(locationState.evaluationId));
            if (currentIndex !== -1 && currentIndex < sortedHistory.length - 1) {
              const previousEval = sortedHistory[currentIndex + 1];
              setPreviousEvaluation(previousEval);
            }
          }
        }
      } catch (err) {
        console.error('Error loading evaluation for comparison:', err);
        setEvaluation(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvaluationAndComparison();
  }, [locationState.evaluationId]);

  const [previousEvaluation, setPreviousEvaluation] = useState<EvaluationRecord | null>(null);

  useEffect(() => {
    const loadQuarterFeedback = async () => {
      if (!evaluation?.id) {
        setQuarterFeedback([]);
        return;
      }

      try {
        const raw = localStorage.getItem('auth_user');
        const authUser = raw ? JSON.parse(raw) : null;
        const fallbackUserId = Number(authUser?.id);
        const userId = Number(evaluation.user_id || fallbackUserId);
        if (!Number.isInteger(userId) || userId <= 0) {
          setQuarterFeedback([]);
          return;
        }

        const [visibilityResponse, feedbackResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/settings/key/student_can_view_teacher_feedback`),
          fetch(`${API_BASE_URL}/feedbacks/student/${userId}`)
        ]);

        const visibilityData = await visibilityResponse.json().catch(() => ({}));
        const feedbackData = await feedbackResponse.json().catch(() => []);
        const canViewFeedback = !['false', '0'].includes(
          String(visibilityData?.value || 'true').trim().toLowerCase()
        );

        if (!canViewFeedback || !feedbackResponse.ok || !Array.isArray(feedbackData)) {
          setQuarterFeedback([]);
          return;
        }

        const matchedFeedback = (feedbackData as FeedbackItem[])
          .filter((item) => Number(item.evaluation_id) === Number(evaluation.id))
          .sort((left, right) => (
            new Date(String(left.created_at || '')).getTime() - new Date(String(right.created_at || '')).getTime()
          ));

        setQuarterFeedback(matchedFeedback);
      } catch {
        setQuarterFeedback([]);
      }
    };

    loadQuarterFeedback();
  }, [evaluation]);

  useEffect(() => {
    const container = feedbackScrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [quarterFeedback]);

  // Real-time notifications via Socket.IO
  useEffect(() => {
    const raw = localStorage.getItem('auth_user');
    const authUser = raw ? JSON.parse(raw) : null;
    const userId = Number(authUser?.id);
    if (!userId) return;

    const socket = getRealtimeSocket();

    // Feedback notifications (teacher gave/updated/deleted feedback)
    const handleFeedbackCreated = (payload: { studentId?: number }) => {
      if (Number(payload?.studentId) !== userId) return;
      showToast('🎓 Your teacher just sent you new feedback!');
      // Refresh feedback list
      setQuarterFeedback(prev => [...prev]); // trigger re-fetch via setEvaluation
      setEvaluation(prev => prev ? { ...prev } : null);
    };

    const handleFeedbackUpdated = (payload: { studentId?: number }) => {
      if (Number(payload?.studentId) !== userId) return;
      showToast('✏️ A teacher updated their feedback for you.');
      setEvaluation(prev => prev ? { ...prev } : null);
    };

    const handleFeedbackDeleted = (payload: { studentId?: number }) => {
      if (Number(payload?.studentId) !== userId) return;
      showToast('🗑️ A feedback message was removed.');
      setEvaluation(prev => prev ? { ...prev } : null);
    };

    // Admin notifications (evaluation settings/criteria changed, profile updated)
    const handleNotificationCreated = (payload: { userId?: number; notification?: { message?: string } }) => {
      if (Number(payload?.userId) !== userId) return;
      const message = String(payload?.notification?.message || '');
      if (message.toLowerCase().includes('evaluation') || message.toLowerCase().includes('criteria')) {
        showToast('⚙️ Admin updated evaluation settings. Your results may reflect the latest criteria.');
      } else if (message.toLowerCase().includes('profile') || message.toLowerCase().includes('class') || message.toLowerCase().includes('student id')) {
        showToast('👤 An admin updated your profile information.');
      } else if (message) {
        showToast(`🔔 ${message}`);
      }
    };

    socket.emit('feedback:subscribe', { studentId: userId });
    socket.on('feedback:created', handleFeedbackCreated);
    socket.on('feedback:updated', handleFeedbackUpdated);
    socket.on('feedback:deleted', handleFeedbackDeleted);
    socket.on('notification:created', handleNotificationCreated);

    return () => {
      socket.emit('feedback:unsubscribe', { studentId: userId });
      socket.off('feedback:created', handleFeedbackCreated);
      socket.off('feedback:updated', handleFeedbackUpdated);
      socket.off('feedback:deleted', handleFeedbackDeleted);
      socket.off('notification:created', handleNotificationCreated);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const criteriaData = useMemo<CriterionView[]>(() => {
    const activeGlobal = globalCriteria.filter(c => String(c.status).toLowerCase() === 'active');
    
    if (activeGlobal.length > 0) {
      return activeGlobal.map((criterion, index) => {
        const response = (evaluation?.responses || []).find(r => 
          String(r.criterion_id || r.criterion_key || '').trim() === String(criterion.id || '').trim() ||
          String(r.criterion_name || '').trim().toLowerCase() === String(criterion.name || '').trim().toLowerCase()
        );
        
        return {
          key: String(criterion.id || criterion.name || `criterion-${index}`),
          label: String(criterion.name || 'Unnamed Criterion'),
          icon: String(criterion.icon || 'Star'),
          score: response ? Number(response.star_value || 0) : 0,
          reflection: response ? String(response.reflection || '').trim() : '',
          tip: response ? String(response.tip_snapshot || '').trim() : '',
          ...CRITERION_STYLES[index % CRITERION_STYLES.length],
        };
      });
    }

    if (evaluation?.responses?.length) {
      return evaluation.responses.map((response, index) => ({
        key: response.criterion_key || toCriterionKey(response.criterion_name || `criterion${index + 1}`),
        label: response.criterion_name || `Criterion ${index + 1}`,
        icon: String(response.criterion_icon || 'Star'),
        score: Number(response.star_value || 0),
        reflection: String(response.reflection || '').trim(),
        tip: String(response.tip_snapshot || '').trim(),
        ...CRITERION_STYLES[index % CRITERION_STYLES.length],
      }));
    }

    const fallbackScores = locationState.scores || {};
    const fallbackReflections = locationState.reflections || {};
    return Object.keys(fallbackScores).map((key, index) => ({
      key,
      label: key,
      icon: 'Star',
      score: Number(fallbackScores[key] || 0),
      reflection: String(fallbackReflections[key] || '').trim(),
      tip: '',
      ...CRITERION_STYLES[index % CRITERION_STYLES.length],
    }));
  }, [globalCriteria, evaluation, locationState.reflections, locationState.scores]);

  const ratingScale = globalRatingScale;
  const averageScore = criteriaData.length > 0
    ? criteriaData.reduce((sum, item) => sum + item.score, 0) / criteriaData.length
    : Number(evaluation?.average_score || 0);
  const strongestCriterion = criteriaData.reduce<CriterionView | null>(
    (currentBest, item) => (currentBest === null || item.score > currentBest.score ? item : currentBest),
    null
  );
  const focusCriterion = criteriaData.reduce<CriterionView | null>(
    (currentLowest, item) => (currentLowest === null || item.score < currentLowest.score ? item : currentLowest),
    null
  );
  const radarData = criteriaData.map((item) => {
    // Find the matching criterion in the previous evaluation
    const prevResponse = previousEvaluation?.responses?.find(r =>
      r.criterion_key === item.key || r.criterion_name === item.label
    );
    // Use raw star values — RadarChart uses domain=[0, ratingScale] for correct rings
    const prevScore = prevResponse ? Number(prevResponse.star_value || 0) : 0;

    return {
      subject: item.label,
      prev: Math.max(0, prevScore),
      curr: Math.max(0, item.score),
    };
  });


  const radarKeys = [
    { key: 'prev', name: previousEvaluation ? toPeriodLabel(previousEvaluation.period) : 'Baseline', color: '#cbd5e1', fill: '#cbd5e1' },
    { key: 'curr', name: toPeriodLabel(evaluation?.period || ''), color: '#5d5fef', fill: '#5d5fef' },
  ];
  const completedLabel = formatLongDate(String(evaluation?.submitted_at || evaluation?.created_at || new Date().toISOString()));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />

      <main className="relative flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <StudentMobileNav />
        <header className="h-auto min-h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 text-primary cursor-pointer" onClick={() => navigate('/dashboard')}>
            <h2 className="text-slate-900 text-sm md:text-lg font-bold leading-tight tracking-tight uppercase tracking-widest font-black">Evaluation Results</h2>
          </div>
          <div className="flex items-center justify-end gap-3 md:gap-4">
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl hidden md:block">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Toast notification banner */}
        <AnimatePresence>
          {toastMessage ? (
            <motion.div
              key="toast"
              initial={{ opacity: 0, y: -60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -60 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-20 right-4 left-4 md:left-auto md:right-8 md:w-[420px] z-[200] bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-3 border border-white/10"
            >
              <div className="flex-1 text-sm font-bold leading-snug">{toastMessage}</div>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-6 md:gap-8">
            <motion.section
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary" />
              <div className="size-12 md:size-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <PartyPopper className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h1 className="text-slate-900 text-2xl md:text-4xl font-black leading-tight mb-2 tracking-tight">Well Done!</h1>
              <p className="text-slate-600 text-sm md:text-lg max-w-2xl font-bold">
                {evaluation?.period
                  ? `Your ${toPeriodLabel(evaluation.period)} evaluation was submitted on ${completedLabel}.`
                  : 'Your evaluation has been submitted successfully.'}
              </p>
            </motion.section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 h-full">
                  <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h3 className="text-slate-900 text-lg md:text-xl font-black uppercase tracking-widest">Growth Radar</h3>
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-primary">{toPeriodLabel(evaluation?.period || '')}</span>
                      </div>
                    </div>
                  </div>

                  {criteriaData.length > 0 ? (
                    <RadarChart data={radarData} dataKeys={radarKeys} maxValue={ratingScale} />
                  ) : (
                    <div className="h-[320px] rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-sm font-bold text-slate-400">
                      {isLoading ? 'Loading evaluation result...' : 'No saved criteria data found.'}
                    </div>
                  )}

                  <div className="mt-8 flex items-center justify-center gap-8">
                    <div className="text-center">
                      <p className="text-slate-500 text-xs font-medium">Average Score</p>
                      <p className="text-2xl font-bold text-slate-900">{averageScore.toFixed(1)} <span className="text-slate-400 text-sm font-medium">/ {ratingScale}</span></p>
                    </div>
                    <div className="h-10 w-px bg-slate-200" />
                    <div className="text-center">
                      <p className="text-slate-500 text-xs font-medium">Completed On</p>
                      <p className="text-lg font-bold text-slate-900">{completedLabel}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-slate-900 text-lg font-bold">Strongest Area</h3>
                  </div>
                  {strongestCriterion ? (
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <h4 className="font-bold text-emerald-800">{strongestCriterion.label}</h4>
                        <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {strongestCriterion.score}/{ratingScale} Stars
                        </span>
                      </div>
                      <p className="text-emerald-700 text-sm leading-relaxed">
                        {strongestCriterion.reflection || strongestCriterion.tip || 'This criterion currently has the strongest score in your evaluation.'}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <h3 className="text-slate-900 text-lg font-bold">Focus Area</h3>
                  </div>
                  {focusCriterion ? (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center gap-4">
                          <span className="font-semibold text-slate-700 text-sm">{focusCriterion.label}</span>
                          <span className="text-amber-600 text-xs font-bold">{focusCriterion.score}/{ratingScale} Stars</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 italic">
                          "{focusCriterion.tip || focusCriterion.reflection || 'Open the criterion card below to review the full details for this area.'}"
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 flex-1">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-slate-900 text-base md:text-lg font-black uppercase tracking-widest">Teacher Feedback</h3>
                      <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">{toPeriodLabel(evaluation?.period || '')}</p>
                    </div>
                    <button
                      onClick={() => navigate('/feedback')}
                      className="text-[10px] md:text-xs text-primary font-black uppercase tracking-widest hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  {quarterFeedback.length > 0 ? (
                    <div
                      ref={feedbackScrollRef}
                      className="max-h-[19rem] overflow-y-auto pr-1 space-y-4"
                    >
                      {quarterFeedback.map((feedback) => (
                        <div key={feedback.id} className="flex gap-3">
                          <div className="size-9 md:size-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center border border-slate-200">
                            {feedback.teacher_profile_image ? (
                              <img
                                src={feedback.teacher_profile_image}
                                alt={feedback.teacher_name || 'Teacher'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 rounded-xl bg-slate-50 border border-slate-100 p-3 md:p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-3 mb-2">
                              <p className="text-sm font-black text-slate-900">{feedback.teacher_name || 'Teacher'}</p>
                              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {formatLongDate(String(feedback.created_at || ''))}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-600 font-medium line-clamp-4">
                              {feedback.comment}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                      No feedback yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-slate-900 text-xl md:text-2xl font-black uppercase tracking-widest">Detail View</h2>
                  <p className="text-[10px] md:text-sm text-slate-400 font-bold uppercase tracking-widest">Click cards for full reflections.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {criteriaData.map((criterion, idx) => (
                  <motion.button
                    type="button"
                    key={criterion.key}
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4, scale: 1.015 }}
                    transition={{ delay: idx * 0.04, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setActiveCriterion(criterion)}
                    className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-3 text-left shadow-sm hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className={`p-2 ${criterion.bgColor} rounded-lg ${criterion.color}`}>
                        {getIcon(criterion.icon, 'w-5 h-5')}
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-primary inline-flex items-center gap-1">
                        Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-800">{criterion.label}</h4>
                      <div className="flex items-center justify-between gap-3">
                        <StarRating rating={criterion.score} max={ratingScale} starClassName="w-4 h-4" />
                        <span className="text-sm font-black text-slate-900">{criterion.score}/{ratingScale}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {criterion.reflection || criterion.tip || 'Click to open the full comment for this criterion.'}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 md:gap-4 mt-8 pb-12">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 md:flex-none px-8 py-3.5 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-5 h-5" />
                Return Home
              </button>
              <button
                onClick={() => navigate('/history')}
                className="flex-1 md:flex-none px-8 py-3.5 bg-white text-slate-700 font-black text-[10px] uppercase tracking-widest rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <History className="w-5 h-5" />
                History
              </button>
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
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={`size-12 md:size-14 rounded-2xl flex items-center justify-center ${activeCriterion.bgColor} ${activeCriterion.color} shrink-0`}>
                    {getIcon(activeCriterion.icon, 'w-6 h-6 md:w-7 md:h-7')}
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-primary">Detail View</p>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{activeCriterion.label}</h3>
                    <div className="flex items-center gap-2 md:gap-3">
                      <StarRating rating={activeCriterion.score} max={ratingScale} starClassName="size-4 md:size-5" />
                      <span className="text-xs md:text-sm font-black text-slate-900">{activeCriterion.score}/{ratingScale}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCriterion(null)}
                  className="size-10 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 md:p-5">
                  <p className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-primary mb-2">Assigned Tip</p>
                  <p className="text-sm font-medium leading-relaxed text-slate-700">
                    {activeCriterion.tip || 'No admin tip was saved for this criterion.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
                  <p className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Your Reflection</p>
                  <p className="text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {activeCriterion.reflection || 'No written reflection was submitted for this criterion.'}
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


