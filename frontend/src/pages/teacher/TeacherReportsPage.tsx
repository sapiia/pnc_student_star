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
  extractClassName,
  extractGeneration,
  normalizeGender,
} from '../../lib/teacher/utils';

type GenderOption = 'All' | 'Male' | 'Female';

interface EvaluationData {
  id: number;
  user_id: number;
  period: string;
  average_score: number;
  criteria_count: number;
  submitted_at: string;
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
  generation: string;
  student_id: string;
  gender: string;
}

const GENERATION_HINTS = ['2026', '2027'];
const DEFAULT_CLASS_FALLBACK = ['WEB Class A', 'WEB Class B', 'WEB Class C', 'WEB Class D'];

const buildAuthHeaders = () => {
  const authToken = localStorage.getItem('token') || localStorage.getItem('auth_token') || '';
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
};

const normalizeGenerationValue = (value: string) => String(value || '').replace(/gen\s*/i, '').trim();

export default function TeacherReportsPage() {
  const navigate = useNavigate();
  const [selectedGen, setSelectedGen] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedGender, setSelectedGender] = useState<GenderOption>('All');
  const { teacherId } = useTeacherIdentity();
  
  // Data state
  const [students, setStudents] = useState<StudentData[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    if (!teacherId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const authHeaders = buildAuthHeaders();

        // Fetch users (students) and evaluations
        const [usersRes, evalRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users`, { headers: { ...authHeaders } }),
          fetch(`${API_BASE_URL}/evaluations`, { headers: { ...authHeaders } }),
        ]);

        const usersData = await usersRes.json();
        const evalData = await evalRes.json();

        if (Array.isArray(usersData)) {
          const mappedStudents: StudentData[] = usersData
            .filter((u: any) => String(u.role || '').toLowerCase() === 'student')
            .map((u: any) => ({
              id: Number(u.id),
              name: toDisplayName(u),
              email: String(u.email || '').trim(),
              student_id: String(u.student_id || u.resolved_student_id || '').trim() || `STU-${u.id}`,
              className: extractClassName(u),
              generation: extractGeneration(u),
              gender: normalizeGender(u.gender),
            }));

          setStudents(mappedStudents);
        }

        if (Array.isArray(evalData)) {
          setEvaluations(evalData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId]);

  const generations = useMemo(() => {
    const uniqueGenerations = new Set(
      students
        .map((s) => normalizeGenerationValue(s.generation))
        .filter(Boolean)
    );
    return Array.from(new Set([...uniqueGenerations, ...GENERATION_HINTS])).sort();
  }, [students]);

  const classes = useMemo(() => (
    Array.from(new Set(students.map((s) => s.className).filter(Boolean)))
  ), [students]);

  // Process data based on filters
  const processedData = useMemo(() => {
    let filteredStudents = students;

    if (selectedGen !== 'All') {
      filteredStudents = filteredStudents.filter((s: StudentData) => {
        const gen = normalizeGenerationValue(s.generation);
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

    const criteriaMap: Record<string, { total: number; count: number }> = {};
    
    filteredEvals.forEach(eval_ => {
      eval_.responses?.forEach((response: { criterion_key: string; star_value: number }) => {
        if (!criteriaMap[response.criterion_key]) {
          criteriaMap[response.criterion_key] = { total: 0, count: 0 };
        }
        criteriaMap[response.criterion_key].total += response.star_value;
        criteriaMap[response.criterion_key].count += 1;
      });
    });

    const criteriaColors = [
      { key: 'living', fill: '#3b82f6' },
      { key: 'jobStudy', fill: '#f59e0b' },
      { key: 'humanSupport', fill: '#8b5cf6' },
      { key: 'health', fill: '#ef4444' },
      { key: 'feeling', fill: '#ec4899' },
      { key: 'choiceBehavior', fill: '#06b6d4' },
      { key: 'moneyPayment', fill: '#10b981' },
      { key: 'lifeSkill', fill: '#6366f1' },
    ];
    const criteriaData = CRITERIA.map(c => {
      const colorEntry = criteriaColors.find(col => col.key === c.key);
      return ({
        name: c.label,
        value: criteriaMap[c.key] 
          ? Number((criteriaMap[c.key].total / criteriaMap[c.key].count).toFixed(1))
          : 0,
        fill: colorEntry ? colorEntry.fill : '#94a3b8',
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

    const totalStudents = filteredStudents.length || 1;
    const completedEvals = filteredEvals.length;
    const completionRate = Math.round((completedEvals / totalStudents) * 100);
    
    const engagementData = [
      { name: 'Completed', value: completionRate, fill: '#5d5fef' },
      { name: 'Pending', value: Math.max(0, 100 - completionRate), fill: '#94a3b8' },
      { name: 'Overdue', value: 0, fill: '#ef4444' },
    ];

    const avgScore = filteredEvals.length > 0
      ? Number((filteredEvals.reduce((sum, e) => sum + e.average_score, 0) / filteredEvals.length).toFixed(1))
      : 0;

    const periodMap: Record<string, { totalScore: number; count: number }> = {};
    filteredEvals.forEach(eval_ => {
      const period = eval_.period || 'Unknown';
      if (!periodMap[period]) {
        periodMap[period] = { totalScore: 0, count: 0 };
      }
      periodMap[period].totalScore += eval_.average_score;
      periodMap[period].count += 1;
    });

    const trendData = Object.entries(periodMap).map(([period, data]) => ({
      name: period,
      avg: Number((data.totalScore / data.count).toFixed(1)),
      completion: Math.round((data.count / totalStudents) * 100)
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
  }, [selectedClass, selectedGender, selectedGen, students, evaluations]);

  // Get available classes
  const availableClasses = classes.length > 0 ? classes : DEFAULT_CLASS_FALLBACK;
  const { trend, criteria, engagement, stats } = processedData;

  // Export handler
  const handleExport = async () => {
    try {
      setExporting(true);

      const authHeaders = buildAuthHeaders();

      // Build query params from current filters
      const params = new URLSearchParams();
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
      
      const contentDisposition = response.headers.get('content-disposition') || '';
      const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i);
      const fallbackName = `Teacher_Report_${new Date().toISOString().slice(0, 10)}`;
      const filename = decodeURIComponent(filenameMatch?.[1] || filenameMatch?.[2] || `${fallbackName}.xlsx`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Export error:', err);
      alert(err?.message || 'Failed to export report. Please try again.');
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
          {exporting ? 'Exporting...' : 'Export'}
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
          onChange={(e) => setSelectedClass(e.target.value)}
          className="appearance-none flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 pr-10"
          disabled={selectedGen === 'All' && availableClasses.length === 0}
        >
          <option value="All">All Classes</option>
          {availableClasses
            .filter(c => selectedGen === 'All' || c.includes(`Gen ${selectedGen}`))
            .map(c => (
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
                      <p className="text-sm text-slate-500">Average star rating vs. evaluation completion rate</p>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Avg Stars</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Completion %</span>
                      </div>
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
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="avg" 
                          stroke="#5d5fef" 
                          strokeWidth={4} 
                          dot={{ r: 6, fill: '#5d5fef', strokeWidth: 3, stroke: '#fff' }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="completion" 
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

