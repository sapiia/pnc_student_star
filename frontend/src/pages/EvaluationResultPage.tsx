import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import StarRating from '../components/StarRating';
import RadarChart from '../components/RadarChart';
import Sidebar from '../components/Sidebar';

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
  const feedbackScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadEvaluation = async () => {
      if (!locationState.evaluationId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/evaluations/${locationState.evaluationId}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load evaluation result.');
        }
        setEvaluation(data as EvaluationRecord);
      } catch {
        setEvaluation(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvaluation();
  }, [locationState.evaluationId]);

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

  const criteriaData = useMemo<CriterionView[]>(() => {
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
  }, [evaluation, locationState.reflections, locationState.scores]);

  const ratingScale = Math.max(1, Number(evaluation?.rating_scale || 5));
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
  const radarData = criteriaData.map((item) => ({
    subject: item.label,
    prev: Math.max(0, item.score * 16),
    curr: Math.max(0, item.score * (100 / ratingScale)),
  }));
  const radarKeys = [
    { key: 'prev', name: 'Baseline', color: '#cbd5e1', fill: '#cbd5e1' },
    { key: 'curr', name: toPeriodLabel(evaluation?.period || ''), color: '#5d5fef', fill: '#5d5fef' },
  ];
  const completedLabel = formatLongDate(String(evaluation?.submitted_at || evaluation?.created_at || new Date().toISOString()));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-primary cursor-pointer" onClick={() => navigate('/dashboard')}>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Evaluation Results</h2>
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

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
            <motion.section
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary" />
              <div className="size-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <PartyPopper className="w-8 h-8" />
              </div>
              <h1 className="text-slate-900 text-3xl md:text-4xl font-bold leading-tight mb-2">Evaluation Complete!</h1>
              <p className="text-slate-600 text-lg max-w-2xl">
                {evaluation?.period
                  ? `Your ${toPeriodLabel(evaluation.period)} evaluation was submitted on ${completedLabel}.`
                  : 'Your evaluation has been submitted successfully.'}
              </p>
            </motion.section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-slate-900 text-xl font-bold">Performance Overview</h3>
                    <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-primary">{toPeriodLabel(evaluation?.period || '')}</span>
                      </div>
                    </div>
                  </div>

                  {criteriaData.length > 0 ? (
                    <RadarChart data={radarData} dataKeys={radarKeys} />
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

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-slate-900 text-lg font-bold">Teacher Feedback</h3>
                      <p className="text-xs text-slate-500">{toPeriodLabel(evaluation?.period || '')}</p>
                    </div>
                    <button
                      onClick={() => navigate('/feedback')}
                      className="text-xs text-primary font-semibold hover:underline"
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
                          <div className="size-10 rounded-full overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
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
                          <div className="flex-1 rounded-xl bg-slate-50 border border-slate-100 p-4">
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <p className="text-sm font-bold text-slate-900">{feedback.teacher_name || 'Teacher'}</p>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {formatLongDate(String(feedback.created_at || ''))}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                              {feedback.comment}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-400">
                      No teacher feedback is available yet for this quarter.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-slate-900 text-2xl font-bold">Criteria Breakdown</h2>
                  <p className="text-sm text-slate-500">Click any criterion to view its stars and full comment.</p>
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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pb-12">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-5 h-5" />
                Return to Dashboard
              </button>
              <button
                onClick={() => navigate('/history')}
                className="w-full sm:w-auto px-8 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <History className="w-5 h-5" />
                View Full History
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
              <div className="p-8 border-b border-slate-100 flex items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={`size-14 rounded-2xl flex items-center justify-center ${activeCriterion.bgColor} ${activeCriterion.color}`}>
                    {getIcon(activeCriterion.icon, 'w-7 h-7')}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-widest text-primary">Criterion Detail</p>
                    <h3 className="text-2xl font-black text-slate-900">{activeCriterion.label}</h3>
                    <div className="flex items-center gap-3">
                      <StarRating rating={activeCriterion.score} max={ratingScale} starClassName="w-5 h-5" />
                      <span className="text-sm font-black text-slate-900">{activeCriterion.score}/{ratingScale} Stars</span>
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
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Your Comment</p>
                  <p className="text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {activeCriterion.reflection || 'No written comment was submitted for this criterion.'}
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
