import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  FileText,
  Search,
  Settings,
  Star,
  TrendingUp,
  Clock3
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import StarRating from '../components/StarRating';
import Sidebar from '../components/Sidebar';
import StudentMobileNav from '../components/StudentMobileNav';

type EvaluationResponse = {
  criterion_key: string;
  criterion_name: string;
  star_value: number;
  reflection: string;
};

type EvaluationRecord = {
  id: number;
  user_id: number;
  period: string;
  rating_scale: number;
  criteria_count: number;
  average_score: number;
  submitted_at: string;
  created_at: string;
  responses?: EvaluationResponse[];
};

type HistoryItem = {
  id: number;
  title: string;
  period: string;
  completedDate: string;
  completedLabel: string;
  nextDueDate: string;
  nextDueLabel: string;
  rating: number;
  ratingScale: number;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const formatLongDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const toPeriodTitle = (period: string) => {
  const trimmed = String(period || '').trim();
  const quarterMatch = trimmed.match(/^(\d{4})-Q([1-4])$/i);
  if (quarterMatch) {
    return `Q${quarterMatch[2]} ${quarterMatch[1]} Evaluation`;
  }
  return `${trimmed || 'Evaluation'} Evaluation`;
};

const buildNextDueDate = (submittedAt: string, cycleDays: number) => {
  const date = new Date(submittedAt);
  if (Number.isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + cycleDays);
  return date.toISOString();
};

export default function EvaluationHistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'highest' | 'lowest' | 'title'>('recent');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [cycleDays, setCycleDays] = useState(90);
  const [isLoading, setIsLoading] = useState(true);
  const [studentName, setStudentName] = useState('Student');
  const [studentId, setStudentId] = useState('');
  const [globalRatingScale, setGlobalRatingScale] = useState<number>(5);

  useEffect(() => {
    const loadEvaluationHistory = async () => {
      try {
        const raw = localStorage.getItem('auth_user');
        if (!raw) {
          setHistoryItems([]);
          setIsLoading(false);
          return;
        }

        const authUser = JSON.parse(raw);
        const userId = Number(authUser?.id);
        const localName = String(authUser?.name || '').trim();
        const localStudentId = String(authUser?.student_id || '').trim();

        if (localName) setStudentName(localName);
        if (localStudentId) setStudentId(localStudentId);

        if (!Number.isInteger(userId) || userId <= 0) {
          setHistoryItems([]);
          setIsLoading(false);
          return;
        }

        const [userResponse, intervalResponse, evaluationsResponse, criteriaConfigResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/users/${userId}`),
          fetch(`${API_BASE_URL}/settings/key/evaluation_interval_days`),
          fetch(`${API_BASE_URL}/evaluations/user/${userId}`),
          fetch(`${API_BASE_URL}/settings/evaluation-criteria`)
        ]);

        const userData = await userResponse.json().catch(() => ({}));
        const intervalData = await intervalResponse.json().catch(() => ({}));
        const evaluationsData = await evaluationsResponse.json().catch(() => ([]));
        const criteriaConfigData = await criteriaConfigResponse.json().catch(() => ({}));

        const nextRatingScale = Math.max(1, Number(criteriaConfigData?.ratingScale || 5));
        const ratingScale = nextRatingScale;
        setGlobalRatingScale(nextRatingScale);

        const resolvedName =
          String(userData?.name || '').trim() ||
          [userData?.first_name, userData?.last_name].filter(Boolean).join(' ').trim() ||
          localName ||
          'Student';
        const resolvedStudentId = String(userData?.student_id || userData?.resolved_student_id || localStudentId || '').trim();
        const resolvedCycleDays = Math.min(365, Math.max(30, Number(intervalData?.value || 90)));

        setStudentName(resolvedName);
        setStudentId(resolvedStudentId);
        setCycleDays(resolvedCycleDays);

        const normalizedHistory = (Array.isArray(evaluationsData) ? evaluationsData : [])
          .map((evaluation: EvaluationRecord) => {
            const completedDate = String(evaluation.submitted_at || evaluation.created_at || '').trim();
            const nextDueDate = buildNextDueDate(completedDate, resolvedCycleDays);

            return {
              id: evaluation.id,
              title: toPeriodTitle(evaluation.period),
              period: String(evaluation.period || '').trim(),
              completedDate,
              completedLabel: formatLongDate(completedDate),
              nextDueDate,
              nextDueLabel: formatLongDate(nextDueDate),
              rating: Number(evaluation.average_score || 0),
              ratingScale: nextRatingScale,
            };
          })
          .sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime());

        setHistoryItems(normalizedHistory);
      } catch {
        setHistoryItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvaluationHistory();
  }, []);

  const filteredHistoryItems = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const searchedItems = !normalizedQuery
      ? historyItems
      : historyItems.filter((item) =>
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.period.toLowerCase().includes(normalizedQuery) ||
          item.completedLabel.toLowerCase().includes(normalizedQuery)
        );

    const sortedItems = [...searchedItems];
    sortedItems.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.completedDate).getTime() - new Date(b.completedDate).getTime();
      }
      if (sortBy === 'highest') {
        return b.rating - a.rating;
      }
      if (sortBy === 'lowest') {
        return a.rating - b.rating;
      }
      return a.title.localeCompare(b.title);
    });

    return sortedItems;
  }, [historyItems, searchQuery, sortBy]);

  const trendData = useMemo(() => {
    const items = [...historyItems].reverse();
    return items.map((item) => ({
      name: item.title.replace(' Evaluation', ''),
      score: Number(item.rating.toFixed(2)),
    }));
  }, [historyItems]);

  const highestRating = historyItems.reduce((max, item) => Math.max(max, item.rating), 0);
  const latestEvaluation = historyItems[0];
  const nextDueLabel = latestEvaluation?.nextDueLabel || 'No evaluation yet';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <StudentMobileNav />
        <header className="h-auto min-h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shrink-0">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search evaluations..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <div className="flex items-center justify-end gap-3 md:gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl relative border border-transparent hover:border-slate-200 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">My Evaluation History</h1>
              <p className="text-sm md:text-base text-slate-500 mt-2">
                Review your submitted evaluations and upcoming schedule.
              </p>
              {studentId ? (
                <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-slate-100 rounded-lg w-fit">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{studentName} • {studentId}</span>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Performance Trend</h3>
                      <p className="text-xs text-slate-500 mt-1">Average score across your submitted evaluations</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/10">
                      Saved History
                    </span>
                  </div>

                  <div className="flex items-baseline gap-4 mb-8">
                    <span className="text-5xl font-black text-slate-900">
                      {latestEvaluation ? latestEvaluation.rating.toFixed(1) : '0.0'}
                    </span>
                    <span className="text-slate-400 text-lg font-medium">/ 5.0</span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                      <TrendingUp className="w-3 h-3" />
                      {historyItems.length} Records
                    </div>
                  </div>

                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5d5fef" stopOpacity={0.12} />
                            <stop offset="95%" stopColor="#5d5fef" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                          dy={10}
                        />
                        <YAxis hide domain={[0, 5]} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} 
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#5d5fef"
                          strokeWidth={4}
                          fillOpacity={1}
                          fill="url(#colorScore)"
                          dot={{ r: 6, fill: '#fff', stroke: '#5d5fef', strokeWidth: 3 }}
                          activeDot={{ r: 8, fill: '#5d5fef', stroke: '#fff', strokeWidth: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-slate-900">Evaluation List</h3>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="w-full md:w-auto appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors outline-none focus:ring-2 focus:ring-primary/20 uppercase tracking-widest"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                        <option value="title">A to Z</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-sm font-bold text-slate-500">
                        Loading evaluation history...
                      </div>
                    ) : filteredHistoryItems.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-3">
                        <div className="size-16 mx-auto rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                          <FileText className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">No evaluation history yet</h4>
                        <p className="text-sm text-slate-500">
                          After you submit an evaluation, it will appear here with its completed date and next due date.
                        </p>
                      </div>
                    ) : (
                      filteredHistoryItems.map((evalItem, idx) => (
                        <motion.div
                          key={evalItem.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col group hover:border-primary/30 transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4 md:gap-6">
                              <div className="size-12 md:size-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                <FileText className="w-6 h-6 md:w-7 md:h-7" />
                              </div>
                              <div className="space-y-1 overflow-hidden">
                                <h4 className="text-base md:text-lg font-bold text-slate-900 truncate">{evalItem.title}</h4>
                                <div className="flex flex-col gap-1 text-[10px] md:text-sm text-slate-500">
                                  <span className="inline-flex items-center gap-2">
                                    <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    Finished: {evalItem.completedLabel}
                                  </span>
                                  <span className="inline-flex items-center gap-2">
                                    <Clock3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    Due: {evalItem.nextDueLabel}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                              <div className="flex items-center gap-3">
                                <StarRating rating={evalItem.rating} max={evalItem.ratingScale} starClassName="w-3.5 h-3.5" />
                                <span className="text-lg font-black text-slate-900">{evalItem.rating.toFixed(1)}</span>
                              </div>
                              <button
                                onClick={() => navigate('/results', { state: { evaluationId: evalItem.id } })}
                                className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                              >
                                View Full Report
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-primary p-8 rounded-2xl shadow-xl shadow-primary/20 text-white relative overflow-hidden"
                >
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-xl font-bold">Quick Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-primary-100 text-sm">Total Evaluations</span>
                        <span className="text-2xl font-black">{historyItems.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary-100 text-sm">Highest Rating</span>
                        <span className="text-2xl font-black">{highestRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-primary-100 text-xs uppercase tracking-widest font-bold">Next Evaluation</span>
                          <span className="text-lg font-bold mt-1">{nextDueLabel}</span>
                        </div>
                        <div className="size-12 bg-white/10 rounded-xl flex items-center justify-center">
                          <Star className="w-6 h-6 fill-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl" />
                </motion.div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Cycle Settings</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Your history and next evaluation schedule follow the admin-defined cycle length.
                  </p>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Current Interval</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">{cycleDays} days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
