import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, ClipboardList, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import Sidebar from '../components/layout/sidebar/Sidebar';
import StudentMobileNav from '../components/StudentMobileNav';
import RadarChart from '../components/ui/RadarChart';
import StarRating from '../components/ui/StarRating';
import { cn } from '../lib/utils';

type EvaluationResponse = {
  id?: number;
  criterion_key: string;
  criterion_name: string;
  criterion_icon?: string | null;
  star_value: number;
  reflection?: string | null;
  tip_snapshot?: string | null;
};

type EvaluationRecord = {
  id: number;
  user_id: number;
  period: string;
  rating_scale: number;
  criteria_count: number;
  average_score: number;
  submitted_at?: string;
  created_at?: string;
  responses?: EvaluationResponse[];
};

type LocationState = {
  scores?: Record<string, number>;
  reflections?: Record<string, string>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const formatDateTime = (value?: string) => {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export default function EvaluationResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as LocationState;

  const [studentId, setStudentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationRecord | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return;
      const authUser = JSON.parse(raw);
      const resolvedStudentId = Number(authUser?.id);
      if (Number.isInteger(resolvedStudentId) && resolvedStudentId > 0) {
        setStudentId(resolvedStudentId);
      }
    } catch {
      setStudentId(null);
    }
  }, []);

  const loadLatestEvaluation = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/evaluations/user/${studentId}`);
      const data = await response.json().catch(() => []);
      if (!response.ok) throw new Error((data as any)?.error || 'Failed to load evaluation.');
      const list = Array.isArray(data) ? (data as EvaluationRecord[]) : [];
      const sorted = [...list].sort((a, b) => {
        const left = new Date(String(a.submitted_at || a.created_at || '')).getTime();
        const right = new Date(String(b.submitted_at || b.created_at || '')).getTime();
        return (Number.isNaN(right) ? 0 : right) - (Number.isNaN(left) ? 0 : left);
      });
      setEvaluation(sorted[0] || null);
    } catch (loadError) {
      setEvaluation(null);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load evaluation.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  const derivedResponses = useMemo<EvaluationResponse[]>(() => {
    const scores = locationState?.scores || null;
    const reflections = locationState?.reflections || {};
    if (!scores) return [];
    return Object.entries(scores).map(([key, value], index) => ({
      id: index + 1,
      criterion_key: key,
      criterion_name: key,
      star_value: Math.max(0, Number(value || 0)),
      reflection: reflections[key] || '',
    }));
  }, [locationState?.reflections, locationState?.scores]);

  const responses = useMemo(() => {
    if (derivedResponses.length > 0) return derivedResponses;
    return Array.isArray(evaluation?.responses) ? (evaluation!.responses as EvaluationResponse[]) : [];
  }, [derivedResponses, evaluation]);

  const ratingScale = useMemo(() => {
    if (evaluation?.rating_scale) return Math.max(1, Number(evaluation.rating_scale));
    const maxFromState = derivedResponses.reduce((max, r) => Math.max(max, r.star_value), 5);
    return Math.max(1, maxFromState || 5);
  }, [derivedResponses, evaluation?.rating_scale]);

  const radarData = useMemo(() => {
    return responses.map((r) => ({
      subject: String(r.criterion_name || r.criterion_key || 'Criterion'),
      score: Number(r.star_value || 0),
    }));
  }, [responses]);

  const radarKeys = useMemo(() => [{ key: 'score', name: 'Score', color: '#5d5fef', fill: '#5d5fef' }], []);

  useEffect(() => {
    if (derivedResponses.length > 0) return;
    void loadLatestEvaluation();
  }, [derivedResponses.length, loadLatestEvaluation]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <StudentMobileNav />

        <header className="h-auto min-h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-4 md:px-6 lg:px-8 py-3 md:py-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="size-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900">Evaluation Results</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {evaluation?.submitted_at ? `Submitted ${formatDateTime(evaluation.submitted_at)}` : 'Latest summary'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/feedback')}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20 bg-primary/10 text-primary hover:bg-primary/15"
            >
              Teacher Feedback
            </button>
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="size-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 pb-24 md:pb-8">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center font-bold text-slate-500">
              Loading results...
            </div>
          ) : responses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
              <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No evaluation data</h3>
              <p className="text-slate-500 text-sm mt-1">Submit an evaluation to see your results here.</p>
              <button
                type="button"
                onClick={() => navigate('/evaluate')}
                className="mt-6 rounded-xl bg-primary text-white px-5 py-3 text-xs font-black uppercase tracking-widest hover:bg-primary/90"
              >
                Start Evaluation
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Growth Radar</h2>
                    <span className="text-xs font-black text-slate-900">
                      Avg {evaluation?.average_score ? Number(evaluation.average_score).toFixed(2) : '--'}
                    </span>
                  </div>
                  <div className="h-[320px] bg-slate-50 rounded-3xl border border-slate-100 shadow-inner flex items-center justify-center overflow-hidden">
                    <RadarChart data={radarData} dataKeys={radarKeys} maxValue={ratingScale} />
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6"
                >
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Highlights</h2>
                  <div className="mt-5 space-y-4">
                    {responses
                      .slice()
                      .sort((a, b) => Number(b.star_value || 0) - Number(a.star_value || 0))
                      .slice(0, 3)
                      .map((r) => (
                        <div key={r.criterion_key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-black text-slate-900">{r.criterion_name}</p>
                          <div className="mt-2 flex items-center justify-between gap-4">
                            <StarRating rating={Number(r.star_value || 0)} max={ratingScale} starClassName="size-4" readonly />
                            <span className="text-xs font-black text-slate-700">{Number(r.star_value || 0)}/{ratingScale}</span>
                          </div>
                        </div>
                      ))}
                    <button
                      type="button"
                      onClick={() => navigate('/feedback')}
                      className={cn(
                        'w-full rounded-2xl px-5 py-4 text-left border transition-colors',
                        'border-primary/20 bg-primary/10 hover:bg-primary/15',
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-white text-primary flex items-center justify-center border border-primary/15">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-primary">View Teacher Feedback</p>
                            <p className="text-xs font-bold text-primary/80 mt-0.5">See notes from your teacher.</p>
                          </div>
                        </div>
                        <span className="text-primary font-black">{'>'}</span>
                      </div>
                    </button>
                  </div>
                </motion.section>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">All Criteria</h2>
                <div className="mt-5 space-y-4">
                  {responses.map((r) => (
                    <div key={r.criterion_key} className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">{r.criterion_name}</p>
                          <p className="text-xs font-bold text-slate-500 mt-1">{r.criterion_key}</p>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-4">
                          <StarRating rating={Number(r.star_value || 0)} max={ratingScale} starClassName="size-4" readonly />
                          <span className="text-xs font-black text-slate-700">{Number(r.star_value || 0)}/{ratingScale}</span>
                        </div>
                      </div>
                      {String(r.reflection || '').trim() ? (
                        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reflection</p>
                          <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap font-medium">{r.reflection}</p>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
