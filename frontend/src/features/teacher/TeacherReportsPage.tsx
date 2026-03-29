import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  Filter,
  ChevronDown,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';

import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import { useTeacherIdentity } from '../../hooks/useTeacherIdentity';

import { motion } from 'motion/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { CRITERIA } from '../../constants';
import {
  API_BASE_URL,
  toDisplayName,
  normalizeGender,
} from '../../lib/teacher/utils';
import { cn } from '../../lib/utils';

type GenderOption = 'All' | 'Male' | 'Female';
type CriterionNavItem = {
  id: string;
  label: string;
  key: string;
};

interface EvaluationData {
  id: number;
  user_id: number;
  period: string;
  average_score: number;
  criteria_count: number;
  submitted_at: string;
  created_at?: string;
  responses: Array<{
    criterion_key: string;
    criterion_name: string;
    star_value: number;
  }>;
}

interface StudentData {
  id: number;
  name: string;
  email: string;
  className: string;
  generation?: string;
  student_id: string;
  gender: string;
}

const GENERATION_HINTS = ['2026', '2027'];
const DEFAULT_CLASS_FALLBACK = ['WEB Class A', 'WEB Class B', 'WEB Class C', 'WEB Class D'];
const CRITERIA_COLORS = [
  '#6366F1',
  '#06B6D4',
  '#F59E0B',
  '#10B981',
  '#EC4899',
  '#8B5CF6',
  '#F97316',
  '#22C55E',
  '#0EA5E9',
  '#EF4444'
];

const buildAuthHeaders = () => {
  const authToken = localStorage.getItem('token') || localStorage.getItem('auth_token') || '';
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
};

const parseGeneration = (student: StudentData) => {
  const direct = String(student.generation || '').trim();
  if (direct) return direct;
  const match = String(student.className || '').match(/gen\s*(\d{4})/i);
  return match?.[1] || '';
};

const normalizeGenerationValue = (value: string) => String(value || '').replace(/gen\s*/i, '').trim();
const toCriterionKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_match, char: string) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');

const parsePeriodParts = (value: string) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;

  const yqMatch = trimmed.match(/^(\d{4})\s*[-/ ]\s*Q([1-4])$/i);
  if (yqMatch) return { year: Number(yqMatch[1]), quarter: Number(yqMatch[2]) };

  const qyMatch = trimmed.match(/^Q([1-4])\s*[-/ ]?\s*(\d{4})$/i);
  if (qyMatch) return { year: Number(qyMatch[2]), quarter: Number(qyMatch[1]) };

  return null;
};

const formatPeriodLabel = (year: number, quarter: number) => `Q${quarter} ${year}`;

export default function TeacherReportsPage() {
  const navigate = useNavigate();
  const [selectedGen, setSelectedGen] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedGender, setSelectedGender] = useState<GenderOption>('All');
  const { teacherId } = useTeacherIdentity();
  
  // Data state
  const [students, setStudents] = useState<StudentData[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [criteriaNav, setCriteriaNav] = useState<CriterionNavItem[]>([]);
  const [activeCriterionKey, setActiveCriterionKey] = useState('overall');
  const [ratingScale, setRatingScale] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch data on mount
  useEffect(() => {
    if (!teacherId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const authHeaders = buildAuthHeaders();

        // Fetch users (students) and evaluations
        const [usersRes, evalRes, criteriaRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/teachers/students/${teacherId}`, { headers: { ...authHeaders } }),
          fetch(`${API_BASE_URL}/evaluations`, { headers: { ...authHeaders } }),
          fetch(`${API_BASE_URL}/settings/evaluation-criteria`, { headers: { ...authHeaders } }),
        ]);

        let usersData: any[] = [];
        if (usersRes.ok) {
          usersData = await usersRes.json();
        } else {
          const fallbackRes = await fetch(`${API_BASE_URL}/users`, { headers: { ...authHeaders } });
          usersData = await fallbackRes.json();
        }
        const evalData = await evalRes.json();
        const criteriaData = await criteriaRes.json().catch(() => ({}));

        if (Array.isArray(usersData)) {
          const mappedStudents: StudentData[] = usersData
            .filter((u: any) => String(u.role || '').toLowerCase() === 'student')
            .map((u: any) => ({
              id: Number(u.id),
              name: toDisplayName(u),
              email: String(u.email || '').trim(),
              student_id: String(u.student_id || u.resolved_student_id || '').trim() || `STU-${u.id}`,
              className: String(u.class || '').trim(),
              generation: u.generation ? String(u.generation) : undefined,
              gender: normalizeGender(u.gender),
            }));

          setStudents(mappedStudents);
        }

        if (Array.isArray(evalData)) {
          setEvaluations(evalData);
        }

        const activeCriteria = Array.isArray(criteriaData?.criteria)
          ? criteriaData.criteria.filter((c: any) => String(c.status || '').toLowerCase() === 'active')
          : [];
        const scale = Math.max(1, Number(criteriaData?.ratingScale || 5));
        setRatingScale(scale);

        const mappedCriteria: CriterionNavItem[] = activeCriteria.length > 0
          ? activeCriteria.map((criterion: any, index: number) => {
              const label = String(criterion.name || `Criterion ${index + 1}`).trim();
              const rawKey = String(criterion.key || label || criterion.id || `criterion${index + 1}`);
              return {
                id: String(criterion.id || `CRIT-${String(index + 1).padStart(3, '0')}`),
                label,
                key: toCriterionKey(rawKey)
              };
            })
          : CRITERIA.map((criterion) => ({
              id: criterion.key,
              label: criterion.label,
              key: toCriterionKey(criterion.key)
            }));

        setCriteriaNav(mappedCriteria);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId]);

  useEffect(() => {
    if (activeCriterionKey !== 'overall' && criteriaNav.every((criterion) => criterion.key !== activeCriterionKey)) {
      setActiveCriterionKey('overall');
    }
  }, [activeCriterionKey, criteriaNav]);

  const generations = useMemo(() => {
    const uniqueGenerations = new Set(
      students
        .map((s) => normalizeGenerationValue(parseGeneration(s)))
        .filter(Boolean)
    );
    return Array.from(new Set([...uniqueGenerations, ...GENERATION_HINTS])).sort();
  }, [students]);

  // Process data based on filters
  const criteriaList = useMemo(() => {
    if (criteriaNav.length > 0) {
      return criteriaNav.map((criterion) => ({
        label: criterion.label,
        key: criterion.key
      }));
    }
    return CRITERIA.map((criterion) => ({
      label: criterion.label,
      key: toCriterionKey(criterion.key)
    }));
  }, [criteriaNav]);

  const criteriaColorMap = useMemo(() => {
    const map = new Map<string, string>();
    criteriaList.forEach((criterion, index) => {
      const color = CRITERIA_COLORS[index % CRITERIA_COLORS.length];
      map.set(criterion.key, color);
      map.set(toCriterionKey(criterion.label), color);
    });
    return map;
  }, [criteriaList]);

  const activeCriterionColor = useMemo(() => {
    if (activeCriterionKey === 'overall') return '#5d5fef';
    return criteriaColorMap.get(activeCriterionKey) || '#5d5fef';
  }, [activeCriterionKey, criteriaColorMap]);

  const activeCriterionLabel = useMemo(() => {
    if (activeCriterionKey === 'overall') return 'Avg Stars';
    const label = criteriaNav.find((criterion) => criterion.key === activeCriterionKey)?.label || 'Criteria Avg';
    return `${label} Avg`;
  }, [activeCriterionKey, criteriaNav]);

  const processedData = useMemo(() => {
    let filteredStudents = students;

    if (selectedGen !== 'All') {
      filteredStudents = filteredStudents.filter((s: StudentData) => {
        const gen = normalizeGenerationValue(parseGeneration(s));
        return gen === selectedGen;
      });
    }

    if (selectedClass !== 'All') {
      filteredStudents = filteredStudents.filter((s: StudentData) => s.className === selectedClass);
    }

    if (selectedGender !== 'All') {
      filteredStudents = filteredStudents.filter((s: StudentData) => 
        s.gender?.toLowerCase() === selectedGender.toLowerCase()
      );
    }

    const studentIds = new Set(filteredStudents.map((s: StudentData) => s.id));
    const filteredEvals = evaluations.filter((e: EvaluationData) => studentIds.has(e.user_id));

    const totals = new Map<string, { total: number; count: number; label: string }>();
    const lookup = new Map<string, string>();
    criteriaList.forEach((criterion) => {
      totals.set(criterion.key, { total: 0, count: 0, label: criterion.label });
      lookup.set(toCriterionKey(criterion.key), criterion.key);
      lookup.set(toCriterionKey(criterion.label), criterion.key);
    });

    filteredEvals.forEach((evaluation) => {
      (evaluation.responses || []).forEach((response) => {
        const normalizedKey = toCriterionKey(String(response.criterion_key || ''));
        const normalizedName = toCriterionKey(String(response.criterion_name || ''));
        const canonicalKey = lookup.get(normalizedKey) || lookup.get(normalizedName);
        if (!canonicalKey) return;
        const entry = totals.get(canonicalKey);
        if (!entry) return;
        entry.total += Number(response.star_value || 0);
        entry.count += 1;
      });
    });

    const criteriaData = criteriaList.map((criterion) => {
      const entry = totals.get(criterion.key);
      const color = criteriaColorMap.get(criterion.key) || '#94a3b8';
      return ({
        name: criterion.label,
        value: entry && entry.count > 0
          ? Number((entry.total / entry.count).toFixed(1))
          : 0,
        fill: color,
        color
      });
    });

    if (filteredEvals.length === 0) {
      return {
        trend: [],
        criteria: criteriaData,
        engagement: [],
        stats: {
          totalStudents: filteredStudents.length,
          avgScore: 0,
          completionRate: 0
        }
      };
    }

    const totalStudents = filteredStudents.length;
    const evaluatedStudents = new Set(filteredEvals.map((e) => Number(e.user_id))).size;
    const completionRate = totalStudents > 0 ? Math.round((evaluatedStudents / totalStudents) * 100) : 0;
    
    const engagementData = [
      { name: 'Completed', value: completionRate, fill: '#5d5fef' },
      { name: 'Pending', value: Math.max(0, 100 - completionRate), fill: '#94a3b8' },
      { name: 'Overdue', value: 0, fill: '#ef4444' },
    ];

    const avgScore = filteredEvals.length > 0
      ? Number((filteredEvals.reduce((sum, e) => sum + Number(e.average_score || 0), 0) / filteredEvals.length).toFixed(2))
      : 0;

    const buckets = new Map<string, { totalScore: number; count: number; year: number; quarter: number; studentIds: Set<number> }>();
    filteredEvals.forEach((evaluation) => {
      let period = parsePeriodParts(evaluation.period);
      if (!period) {
        const dateValue = evaluation.submitted_at || evaluation.created_at;
        if (dateValue) {
          const date = new Date(dateValue);
          if (!Number.isNaN(date.getTime())) {
            const year = date.getUTCFullYear();
            const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
            period = { year, quarter };
          }
        }
      }
      if (!period) return;
      const key = `${period.year}-Q${period.quarter}`;
      const entry = buckets.get(key) || { totalScore: 0, count: 0, year: period.year, quarter: period.quarter, studentIds: new Set<number>() };
      entry.studentIds.add(Number(evaluation.user_id));

      let scoreValue = Number(evaluation.average_score || 0);
      if (activeCriterionKey !== 'overall') {
        const normalizedActiveKey = toCriterionKey(activeCriterionKey);
        const responses = Array.isArray(evaluation.responses) ? evaluation.responses : [];
        const matched = responses.find((response) => {
          const keyCandidate = toCriterionKey(String(response.criterion_key || ''));
          const nameCandidate = toCriterionKey(String(response.criterion_name || ''));
          return normalizedActiveKey === keyCandidate || normalizedActiveKey === nameCandidate;
        });
        if (matched) {
          scoreValue = Number(matched.star_value || 0);
          entry.totalScore += scoreValue;
          entry.count += 1;
        }
      } else {
        entry.totalScore += scoreValue;
        entry.count += 1;
      }
      buckets.set(key, entry);
    });

    const periods = Array.from(buckets.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.quarter - b.quarter;
    });

    const trendData = periods.map((entry) => ({
      name: formatPeriodLabel(entry.year, entry.quarter),
      avg: entry.count > 0 ? Number((entry.totalScore / entry.count).toFixed(1)) : 0,
      completion: entry.studentIds.size
    }));

    return {
      trend: trendData,
      criteria: criteriaData,
      engagement: engagementData,
      stats: {
        totalStudents,
        avgScore,
        completionRate
      }
    };
  }, [selectedClass, selectedGender, selectedGen, students, evaluations, criteriaList, criteriaColorMap, activeCriterionKey]);

  // Get available classes
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    students.forEach((student) => {
      if (selectedGen === 'All' || normalizeGenerationValue(parseGeneration(student)) === selectedGen) {
        if (student.className) classSet.add(student.className);
      }
    });
    const list = Array.from(classSet).sort();
    return list.length > 0 ? list : DEFAULT_CLASS_FALLBACK;
  }, [students, selectedGen]);
  const { trend, criteria, engagement, stats } = processedData;

  // Export handler
  const handleExport = async () => {
    try {
      setExporting(true);
      setExportNotice(null);

      const authHeaders = buildAuthHeaders();

      // Build query params from current filters
      const params = new URLSearchParams();
      params.append('scope', 'students');
      if (selectedClass !== 'All') params.append('class', selectedClass);
      if (selectedGender !== 'All') params.append('gender', selectedGender);
      if (selectedGen !== 'All') params.append('generation', selectedGen);
      
      const response = await fetch(`${API_BASE_URL}/evaluations/report/export?${params.toString()}`, {
        method: 'GET',
        headers: { ...authHeaders },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export failed: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('spreadsheet')) {
        throw new Error('Invalid response format. Expected Excel file.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Teacher_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExportNotice({
        type: 'success',
        message: 'Export completed. Your Excel file is downloading.'
      });
    } catch (err: any) {
      console.error('Export error:', err);
      setExportNotice({
        type: 'error',
        message: err?.message || 'Failed to export report.'
      });
    } finally {
      setExporting(false);
    }
  };

  const renderTopBar = () => (
    <header className="h-auto min-h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-2 md:py-0 flex items-center justify-between shrink-0 z-10">
      <div className="min-w-0">
        <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">Academic Analytics</h1>
        <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate">Class performance and trends.</p>
      </div>
      <div className="flex items-center gap-2 md:gap-4 ml-2">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white border border-slate-200 rounded-xl text-[10px] md:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
          )}
          {exporting ? 'Exporting...' : 'Export Excel'}
        </button>
        <button
          onClick={() => navigate('/teacher/notifications')}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative shrink-0"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>
      </div>
    </header>
  );

  const renderFiltersBar = () => (
    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
      <div className="relative">
        <select
          value={selectedGen}
          onChange={(e) => {
            setSelectedGen(e.target.value);
            setSelectedClass('All');
            setSelectedGender('All');
          }}
          className="appearance-none flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 pr-10"
        >
          <option value="All">All Generations</option>
          {generations.map(g => (
            <option key={g} value={g}>Gen {g}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>

      <div className="relative">
        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedGender('All');
          }}
          className="appearance-none flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 pr-10"
          disabled={selectedGen === 'All' && availableClasses.length === 0}
        >
          <option value="All">All Classes</option>
          {availableClasses.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>

      <div className="relative">
        <select
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value as GenderOption)}
          className="appearance-none flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 pr-10"
        >
          <option value="All">All Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>

      <div className="h-8 w-px bg-slate-200 mx-2" />

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-bold text-slate-700">{stats.totalStudents}</span>
          <span className="text-slate-400">Students</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span className="font-bold text-slate-700">{stats.avgScore}</span>
          <span className="text-slate-400">Avg Score</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-slate-700">{stats.completionRate}%</span>
          <span className="text-slate-400">Completion</span>
        </div>
      </div>

      <div className="h-8 w-px bg-slate-200 mx-2" />
      <button className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
        <Filter className="w-4 h-4" />
        Advanced Filters
      </button>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TeacherMobileNav />
        {renderTopBar()}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-slate-500">Loading report data...</span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                {error}
              </div>
            )}

            {exportNotice && (
              <div
                className={cn(
                  "flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-semibold",
                  exportNotice.type === 'success'
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                )}
              >
                <span>{exportNotice.message}</span>
                <button
                  type="button"
                  onClick={() => setExportNotice(null)}
                  className="text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100"
                >
                  Dismiss
                </button>
              </div>
            )}

            {!loading && (
              <>
                {renderFiltersBar()}

                {/* Top Row: Main Trend Chart */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Class Performance Trend</h3>
                      <p className="text-sm text-slate-500">Average star rating vs. evaluation completion count</p>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeCriterionColor }} />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{activeCriterionLabel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Completion</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 overflow-x-auto">
                    <div className="inline-flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setActiveCriterionKey('overall')}
                        className={cn(
                          "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                          activeCriterionKey === 'overall'
                            ? "bg-white text-primary shadow-sm"
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <span className="size-2 rounded-full bg-primary" />
                        Overall
                      </button>
                      {criteriaNav.map((criterion) => (
                        <button
                          key={criterion.id}
                          type="button"
                          onClick={() => setActiveCriterionKey(criterion.key)}
                          className={cn(
                            "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                            activeCriterionKey === criterion.key
                              ? "bg-white text-primary shadow-sm"
                              : "text-slate-400 hover:text-slate-600"
                          )}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: criteriaColorMap.get(criterion.key) || '#5d5fef' }}
                          />
                          {criterion.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="h-[250px] md:h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                          dy={10}
                        />
                        <YAxis 
                          yAxisId="score"
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                          domain={[0, Math.max(ratingScale, 5)]}
                        />
                        <YAxis
                          yAxisId="completion"
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                          domain={[0, Math.max(1, stats.totalStudents)]}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="avg" 
                          yAxisId="score"
                          stroke={activeCriterionColor} 
                          strokeWidth={4} 
                          dot={{ r: 6, fill: activeCriterionColor, strokeWidth: 3, stroke: '#fff' }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="completion" 
                          yAxisId="completion"
                          stroke="#10b981" 
                          strokeWidth={2} 
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Bottom Row: Two Columns */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">
                  {/* Criteria Distribution */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Criteria Distribution</h3>
                      <BarChart3 className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="h-[250px] md:h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={criteria} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }}
                            width={120}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                          />
                          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                            {criteria.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Engagement Overview */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Engagement Status</h3>
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                        {stats.completionRate >= 80 ? 'Healthy' : stats.completionRate >= 50 ? 'Moderate' : 'Low'}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="h-[250px] w-full md:w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={engagement}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={8}
                              dataKey="value"
                            >
                              {engagement.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full md:w-1/2 space-y-4">
                        {engagement.map((item) => (
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

                {/* Summary Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
                  <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-widest">Growth Insight</span>
                    </div>
                    <h4 className="font-bold text-emerald-900 mb-2">Academic Performance</h4>
                    <p className="text-sm text-emerald-700 leading-relaxed">
                      Class average is at {stats.avgScore}/5.0 with {stats.completionRate}% completion rate across all criteria.
                    </p>
                  </div>
                  <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl">
                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                      <ArrowDownRight className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-widest">Attention Needed</span>
                    </div>
                    <h4 className="font-bold text-amber-900 mb-2">Evaluation Progress</h4>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      {100 - stats.completionRate}% of students still need to submit their evaluations. Follow up with pending students.
                    </p>
                  </div>
                  <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <ArrowUpRight className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-widest">Next Milestone</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">Q4 Evaluations</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Final quarter evaluations in progress. Current prep-rate is at {stats.completionRate}% across all departments.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

