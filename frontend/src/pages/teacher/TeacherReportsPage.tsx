import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Bell, ChevronDown, Download, Filter, TrendingUp, Users } from 'lucide-react';
import { motion } from 'motion/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import { CRITERIA } from '../../constants';
import { useTeacherUnreadNotifications } from '../../lib/useTeacherUnreadNotifications';

type ApiUser = {
  id: number;
  role?: string | null;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  class?: string | null;
  student_id?: string | null;
  resolved_student_id?: string | null;
};

type EvaluationResponse = {
  criterion_key: string;
  criterion_name?: string | null;
  star_value: number;
};

type EvaluationRecord = {
  id: number;
  user_id: number;
  average_score: number;
  rating_scale: number;
  submitted_at?: string;
  created_at?: string;
  responses?: EvaluationResponse[];
};

type TrendPoint = { name: string; avg: number; completion: number };
type CriteriaPoint = { name: string; value: number; color: string };
type EngagementPoint = { name: 'Completed' | 'Pending' | 'Overdue'; value: number; fill: string };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const FALLBACK_RATING_SCALE = 5;

const DATE_RANGES = [
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: '90d', label: 'Last 90 days', days: 90 },
] as const;

type DateRangeKey = typeof DATE_RANGES[number]['key'];

const toDisplayName = (user: ApiUser) => {
  const fallback = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return String(user.name || '').trim() || fallback || String(user.email || `User ${user.id}`).trim();
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

const extractClassLabel = (user: ApiUser) => {
  const raw = String(user.class || '').trim();
  if (!raw) return 'Unassigned';
  return raw.replace(/gen\s*\d{4}\s*/i, '').trim() || raw.trim();
};

const CANONICAL_CLASSES = ['Class A', 'Class B', 'Class C', 'Class D', 'WEB A', 'WEB B', 'WEB C'] as const;
type CanonicalClass = typeof CANONICAL_CLASSES[number];

const normalizeToCanonicalClass = (rawLabel: string): CanonicalClass | null => {
  const raw = String(rawLabel || '').trim();
  if (!raw) return null;

  const normalized = raw
    .toLowerCase()
    .replace(/\bgen\s*\d{4}\b/gi, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();

  const hasWeb = normalized.includes('web');
  const classMatch = normalized.match(/class([a-d])/i) || normalized.match(/^([a-d])$/i);
  const webMatch = normalized.match(/web([a-c])/i);

  if (webMatch) {
    return `WEB ${webMatch[1].toUpperCase()}` as CanonicalClass;
  }

  if (hasWeb && classMatch) {
    return `WEB ${classMatch[1].toUpperCase()}` as CanonicalClass;
  }

  if (classMatch) {
    return `Class ${classMatch[1].toUpperCase()}` as CanonicalClass;
  }

  if (normalized === 'weba') return 'WEB A';
  if (normalized === 'webb') return 'WEB B';
  if (normalized === 'webc') return 'WEB C';

  return null;
};

const parseDate = (value?: string) => {
  const date = new Date(String(value || ''));
  return Number.isNaN(date.getTime()) ? null : date;
};

const getEvaluationTimestamp = (evaluation: EvaluationRecord) => {
  const submitted = parseDate(evaluation.submitted_at);
  const created = parseDate(evaluation.created_at);
  return submitted?.getTime() || created?.getTime() || 0;
};

const formatShortDate = (value?: Date) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(value);
};

const toCsvValue = (value: unknown) => {
  const text = String(value ?? '');
  if (text.includes('"') || text.includes(',') || text.includes('\n')) return `"${text.replace(/"/g, '""')}"`;
  return text;
};

const downloadTextFile = (filename: string, content: string, mime = 'text/plain') => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export default function TeacherReportsPage() {
  const navigate = useNavigate();
  const unreadNotificationCount = useTeacherUnreadNotifications();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [ratingScale, setRatingScale] = useState(FALLBACK_RATING_SCALE);
  const [customClasses, setCustomClasses] = useState<string[]>([]);

  const [selectedGen, setSelectedGen] = useState('ALL Gen');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [dateRange, setDateRange] = useState<DateRangeKey>('30d');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [usersResponse, evaluationsResponse, criteriaConfigResponse, classSettingResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/users`),
        fetch(`${API_BASE_URL}/evaluations`),
        fetch(`${API_BASE_URL}/settings/evaluation-criteria`),
        fetch(`${API_BASE_URL}/settings/key/available_classes`),
      ]);

      const usersData = await usersResponse.json().catch(() => []);
      const evaluationsData = await evaluationsResponse.json().catch(() => []);
      const criteriaConfigData = await criteriaConfigResponse.json().catch(() => ({}));
      const classSettingData = await classSettingResponse.json().catch(() => null);

      if (!usersResponse.ok) throw new Error(usersData?.error || 'Failed to load users.');
      if (!evaluationsResponse.ok) throw new Error(evaluationsData?.error || 'Failed to load evaluations.');

      const nextRatingScale = Math.max(
        1,
        Number(criteriaConfigData?.ratingScale || criteriaConfigData?.rating_scale || FALLBACK_RATING_SCALE),
      );
      setRatingScale(nextRatingScale);

      setUsers(Array.isArray(usersData) ? (usersData as ApiUser[]) : []);
      setEvaluations(Array.isArray(evaluationsData) ? (evaluationsData as EvaluationRecord[]) : []);

      if (classSettingResponse.ok) {
        try {
          const parsed = JSON.parse(String((classSettingData as any)?.value || '[]'));
          if (Array.isArray(parsed)) {
            setCustomClasses(
              parsed
                .map((value) => String(value || '').trim())
                .filter(Boolean),
            );
          }
        } catch {
          setCustomClasses([]);
        }
      } else {
        setCustomClasses([]);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load reports.');
      setUsers([]);
      setEvaluations([]);
      setCustomClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const students = useMemo(() => (
    users
      .filter((user) => String(user.role || '').trim().toLowerCase() === 'student')
      .map((user) => ({
        ...user,
        generation: extractGeneration(user),
        classLabel: (() => {
          const rawClass = extractClassLabel(user);
          const customMatch = customClasses.find((cls) => cls.toLowerCase() === rawClass.toLowerCase());
          if (customMatch) return customMatch;
          return normalizeToCanonicalClass(rawClass) || 'Unassigned';
        })(),
        displayName: toDisplayName(user),
        studentId: String(user.student_id || user.resolved_student_id || '').trim(),
      }))
  ), [customClasses, users]);

  const generationOptions = useMemo(() => {
    const gens = new Set<string>();
    students.forEach((student) => {
      if (student.generation && student.generation !== 'Unknown Gen') gens.add(student.generation);
    });
    return ['ALL Gen', ...Array.from(gens).sort().reverse()];
  }, [students]);

  const classOptions = useMemo(() => {
    const classes = new Set<string>();
    CANONICAL_CLASSES.forEach((cls) => classes.add(cls));
    customClasses.forEach((cls) => {
      const trimmed = String(cls || '').trim();
      if (trimmed) classes.add(trimmed);
    });

    const sorted = Array.from(classes).sort((a, b) => a.localeCompare(b));
    return [
      'All Classes',
      ...sorted,
      ...(customClasses.length ? ['__remove_custom_class__'] : []),
      '__add_new_class__',
    ];
  }, [customClasses, selectedGen, students]);

  useEffect(() => {
    if (!generationOptions.includes(selectedGen)) setSelectedGen('ALL Gen');
  }, [generationOptions, selectedGen]);

  useEffect(() => {
    if (!classOptions.includes(selectedClass)) setSelectedClass('All Classes');
  }, [classOptions, selectedClass]);

  const filteredStudents = useMemo(() => (
    students.filter((student) => {
      if (selectedGen !== 'ALL Gen' && student.generation !== selectedGen) return false;
      if (selectedClass !== 'All Classes' && student.classLabel !== selectedClass) return false;
      return true;
    })
  ), [selectedClass, selectedGen, students]);

  const filteredStudentIds = useMemo(() => (
    new Set(filteredStudents.map((student) => Number(student.id)))
  ), [filteredStudents]);

  const dateRangeDays = useMemo(() => (
    DATE_RANGES.find((item) => item.key === dateRange)?.days ?? 30
  ), [dateRange]);

  const dateRangeStart = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - dateRangeDays);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [dateRangeDays]);

  const evaluationsInScope = useMemo(() => (
    evaluations
      .filter((evaluation) => filteredStudentIds.has(Number(evaluation.user_id)))
      .sort((a, b) => getEvaluationTimestamp(b) - getEvaluationTimestamp(a))
  ), [evaluations, filteredStudentIds]);

  const evaluationsInRange = useMemo(() => (
    evaluationsInScope.filter((evaluation) => getEvaluationTimestamp(evaluation) >= dateRangeStart.getTime())
  ), [dateRangeStart, evaluationsInScope]);

  const latestEvaluationByUser = useMemo(() => {
    const map = new Map<number, EvaluationRecord>();
    evaluationsInScope.forEach((evaluation) => {
      const userId = Number(evaluation.user_id);
      if (!map.has(userId)) map.set(userId, evaluation);
    });
    return map;
  }, [evaluationsInScope]);

  const trendData = useMemo<TrendPoint[]>(() => {
    const weeks = 6;
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - (weeks * 7));
    start.setHours(0, 0, 0, 0);

    const studentCount = filteredStudents.length || 1;

    return Array.from({ length: weeks }, (_v, index) => {
      const bucketStart = new Date(start);
      bucketStart.setDate(start.getDate() + index * 7);
      const bucketEnd = new Date(bucketStart);
      bucketEnd.setDate(bucketStart.getDate() + 7);

      const evaluationsInBucket = evaluationsInScope.filter((evaluation) => {
        const ts = getEvaluationTimestamp(evaluation);
        return ts >= bucketStart.getTime() && ts < bucketEnd.getTime();
      });

      const avg = evaluationsInBucket.length
        ? Number((evaluationsInBucket.reduce((sum, evaluation) => sum + Number(evaluation.average_score || 0), 0) / evaluationsInBucket.length).toFixed(2))
        : 0;

      const completedUsers = new Set<number>();
      evaluationsInBucket.forEach((evaluation) => completedUsers.add(Number(evaluation.user_id)));
      const completion = Math.round((completedUsers.size / studentCount) * 100);

      return { name: formatShortDate(bucketStart), avg, completion };
    });
  }, [evaluationsInScope, filteredStudents.length]);

  const criteriaData = useMemo<CriteriaPoint[]>(() => {
    const colorsByKey = new Map<string, string>([
      ['living', '#5d5fef'],
      ['jobStudy', '#10b981'],
      ['humanSupport', '#f59e0b'],
      ['health', '#ef4444'],
      ['moneyPayment', '#8b5cf6'],
      ['feeling', '#ec4899'],
      ['choiceBehavior', '#06b6d4'],
      ['lifeSkill', '#2563eb'],
    ]);

    const sums = new Map<string, { name: string; total: number; count: number }>();
    evaluationsInRange.forEach((evaluation) => {
      (evaluation.responses || []).forEach((response) => {
        const key = String(response.criterion_key || '').trim();
        if (!key) return;
        const existing = sums.get(key) || {
          name: String(response.criterion_name || key).trim() || key,
          total: 0,
          count: 0,
        };
        existing.total += Math.max(0, Number(response.star_value || 0));
        existing.count += 1;
        sums.set(key, existing);
      });
    });

    const points = Array.from(sums.entries()).map(([key, value]) => ({
      name: value.name,
      value: value.count ? Number((value.total / value.count).toFixed(2)) : 0,
      color: colorsByKey.get(key) || '#64748b',
    }));

    return points.length
      ? points.sort((a, b) => a.name.localeCompare(b.name))
      : CRITERIA.map((criterion) => ({
          name: criterion.label,
          value: 0,
          color: colorsByKey.get(criterion.key) || '#64748b',
        }));
  }, [evaluationsInRange]);

  const engagementData = useMemo<EngagementPoint[]>(() => {
    const total = filteredStudents.length || 1;
    let completed = 0;
    let pending = 0;
    let overdue = 0;

    filteredStudents.forEach((student) => {
      const latest = latestEvaluationByUser.get(Number(student.id));
      const latestTs = latest ? getEvaluationTimestamp(latest) : 0;
      if (!latestTs) {
        overdue += 1;
        return;
      }
      if (latestTs >= dateRangeStart.getTime()) {
        completed += 1;
        return;
      }
      pending += 1;
    });

    const toPercent = (count: number) => Math.round((count / total) * 100);
    const completedPct = toPercent(completed);
    const pendingPct = toPercent(pending);
    const overduePct = Math.max(0, 100 - completedPct - pendingPct);

    return [
      { name: 'Completed', value: completedPct, fill: '#5d5fef' },
      { name: 'Pending', value: pendingPct, fill: '#94a3b8' },
      { name: 'Overdue', value: overduePct, fill: '#ef4444' },
    ];
  }, [dateRangeStart, filteredStudents, latestEvaluationByUser]);

  const avgScore = useMemo(() => {
    const latest = filteredStudents
      .map((student) => latestEvaluationByUser.get(Number(student.id)))
      .filter(Boolean) as EvaluationRecord[];
    if (latest.length === 0) return 0;
    return Number((latest.reduce((sum, evaluation) => sum + Number(evaluation.average_score || 0), 0) / latest.length).toFixed(2));
  }, [filteredStudents, latestEvaluationByUser]);

  const handleExport = useCallback(() => {
    const headers = [
      'student_id',
      'name',
      'generation',
      'class',
      'last_submitted_at',
      'average_score',
      ...CRITERIA.map((criterion) => criterion.label),
    ];

    const rows = filteredStudents.map((student) => {
      const latest = latestEvaluationByUser.get(Number(student.id));
      const submittedAt = latest ? (parseDate(latest.submitted_at) || parseDate(latest.created_at)) : null;
      const responseMap = new Map<string, number>();
      (latest?.responses || []).forEach((response) => {
        responseMap.set(String(response.criterion_key || '').trim(), Number(response.star_value || 0));
      });
      const criteriaValues = CRITERIA.map((criterion) => responseMap.get(criterion.key) ?? '');

      return [
        student.studentId || '',
        student.displayName,
        student.generation,
        student.classLabel,
        submittedAt ? submittedAt.toISOString() : '',
        latest ? Number(latest.average_score || 0).toFixed(2) : '',
        ...criteriaValues,
      ].map(toCsvValue).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const filename = `teacher_report_${selectedGen.replace(/\s+/g, '_')}_${selectedClass.replace(/\s+/g, '_')}_${dateRange}.csv`.toLowerCase();
    downloadTextFile(filename, csv, 'text/csv');
  }, [dateRange, filteredStudents, latestEvaluationByUser, selectedClass, selectedGen]);

  const addNewClass = useCallback(async (nextClass: string) => {
    const cleaned = String(nextClass || '').trim();
    if (!cleaned) return;

    const merged = Array.from(new Set([...customClasses, cleaned])).sort((a, b) => a.localeCompare(b));
    setCustomClasses(merged);
    setSelectedClass(cleaned);

    try {
      await fetch(`${API_BASE_URL}/settings/key/available_classes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: JSON.stringify(merged) }),
      });
    } catch {
      // Ignore persistence failure; UI still updates locally.
    }
  }, [customClasses]);

  const removeCustomClass = useCallback(async (classToRemove: string) => {
    const cleaned = String(classToRemove || '').trim();
    if (!cleaned) return;

    const merged = customClasses.filter((cls) => cls.toLowerCase() !== cleaned.toLowerCase());
    setCustomClasses(merged);
    if (selectedClass.toLowerCase() === cleaned.toLowerCase()) {
      setSelectedClass('All Classes');
    }

    try {
      await fetch(`${API_BASE_URL}/settings/key/available_classes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: JSON.stringify(merged) }),
      });
    } catch {
      // Ignore persistence failure; UI still updates locally.
    }
  }, [customClasses, selectedClass]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TeacherMobileNav />

        <header className="h-auto min-h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-2 md:py-0 flex items-center justify-between shrink-0 z-10">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">Academic Analytics</h1>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate">Class performance and trends.</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-2">
            <button
              onClick={handleExport}
              disabled={isLoading || filteredStudents.length === 0}
              className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white border border-slate-200 rounded-xl text-[10px] md:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shrink-0 disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Export
            </button>
            <button
              onClick={() => navigate('/teacher/notifications')}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative shrink-0"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 ? (
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
              ) : null}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="relative">
                <select
                  value={selectedGen}
                  onChange={(e) => setSelectedGen(e.target.value)}
                  className="appearance-none px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 pr-10"
                >
                  {generationOptions.map((gen) => <option key={gen} value={gen}>{gen}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '__remove_custom_class__') {
                      const list = customClasses.length ? `\n\nCustom classes:\n- ${customClasses.join('\n- ')}` : '';
                      const nextValue = window.prompt(`Delete which custom class?${list}\n\nType the class name exactly:`, '');
                      if (nextValue) {
                        void removeCustomClass(nextValue);
                      }
                      return;
                    }
                    if (value === '__add_new_class__') {
                      const nextValue = window.prompt('Add new class (example: WEB D or Class E):', '');
                      if (nextValue) {
                        void addNewClass(nextValue);
                      }
                      return;
                    }
                    setSelectedClass(value);
                  }}
                  className="appearance-none px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 pr-10"
                >
                  {classOptions.map((cls) => (
                    cls === '__add_new_class__' ? (
                      <option key={cls} value={cls}>+ Add new class...</option>
                    ) : cls === '__remove_custom_class__' ? (
                      <option key={cls} value={cls}>Delete custom class...</option>
                    ) : (
                      <option key={cls} value={cls}>{cls}</option>
                    )
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as DateRangeKey)}
                  className="appearance-none px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 pr-10"
                >
                  {DATE_RANGES.map((range) => <option key={range.key} value={range.key}>{range.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="h-8 w-px bg-slate-200 mx-2" />
              <button type="button" onClick={loadData} className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                <Filter className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Student Score</p>
                <p className="text-3xl font-black text-slate-900">
                  {avgScore.toFixed(2)} <span className="text-sm text-slate-400 font-medium">/ {ratingScale}</span>
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-slate-500 text-[10px] font-black">{filteredStudents.length}</span>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Students In Scope</p>
                <p className="text-3xl font-black text-slate-900">{filteredStudents.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-slate-500 text-[10px] font-black">{evaluationsInRange.length}</span>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Evaluations ({dateRangeDays}d)</p>
                <p className="text-3xl font-black text-slate-900">{evaluationsInRange.length}</p>
              </div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Class Performance Trend</h3>
                  <p className="text-sm text-slate-500">Average star rating vs. completion</p>
                </div>
              </div>
              <div className="h-[260px] md:h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} domain={[0, ratingScale]} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="avg" name="Avg Stars" stroke="#5d5fef" strokeWidth={4} dot={{ r: 5, fill: '#fff', stroke: '#5d5fef', strokeWidth: 3 }} />
                    <Line yAxisId="right" type="monotone" dataKey="completion" name="Completion %" stroke="#34d399" strokeWidth={4} dot={{ r: 5, fill: '#fff', stroke: '#34d399', strokeWidth: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Criteria Breakdown</h3>
                <p className="text-sm text-slate-500 mb-6">Average star score per criterion</p>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={criteriaData} layout="vertical" margin={{ left: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, ratingScale]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} width={90} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {criteriaData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Engagement Status</h3>
                <p className="text-sm text-slate-500 mb-6">Students with recent evaluations</p>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="h-[240px] w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={engagementData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                          {engagementData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 space-y-4">
                    {engagementData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="size-3 rounded-full" style={{ backgroundColor: item.fill }} />
                          <span className="text-sm font-bold text-slate-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm font-bold text-slate-500">
                Loading report data...
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
