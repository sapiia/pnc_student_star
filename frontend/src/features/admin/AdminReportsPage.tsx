import { useNavigate } from 'react-router-dom';

import { 

  BarChart3, 

  TrendingUp, 
  UserCheck, 

  Download, 
  ArrowUpRight,

  ArrowDownRight,

  Target,
  Loader2
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { 

  ResponsiveContainer, 

  BarChart, 

  Bar, 

  XAxis, 

  YAxis, 

  CartesianGrid, 

  Tooltip, 
  LineChart, 

  Line, 

  PieChart, 

  Pie, 
  Cell
} from 'recharts';

import AdminSidebar from '../../components/layout/sidebar/admin/AdminSidebar';

import AdminMobileNav from '../../components/common/AdminMobileNav';
import RadarChart from '../../components/ui/RadarChart';
import { cn } from '../../lib/utils';
import { DEFAULT_AVATAR } from '../../lib/api';
import { exportToPDF } from '../../utils/exportPdf';

import { CRITERIA } from '../../constants';

type StudentRecord = {
  id: number;
  name: string;
  email: string;
  class: string;
  gender: string;
  generation?: string;
  profileImage?: string | null;
};

type CriterionNavItem = {
  id: string;
  label: string;
  key: string;
};

type EvaluationRecord = {
  id: number;
  user_id: number;
  period: string;
  average_score: number;
  submitted_at?: string;
  created_at?: string;
  responses?: Array<{
    criterion_key: string;
    star_value: number;
  }>;
};

type FeedbackRecord = {
  id: number;
  teacher_id: number;
  student_id: number;
  evaluation_id?: number | null;
  teacher_name?: string;
  teacher_profile_image?: string | null;
  created_at?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const parseGeneration = (student: StudentRecord) => {
  const direct = String(student.generation || '').trim();
  if (direct) return direct;
  const match = String(student.class || '').match(/gen\s*(\d{4})/i);
  return match?.[1] || '';
};

const toCriterionKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_match, char: string) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');

const parsePeriodParts = (value: string) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;

  const yqMatch = trimmed.match(/^(\d{4})\s*[-/ ]\s*Q([1-4])$/i);
  if (yqMatch) {
    return { year: Number(yqMatch[1]), quarter: Number(yqMatch[2]) };
  }

  const qyMatch = trimmed.match(/^Q([1-4])\s*[-/ ]?\s*(\d{4})$/i);
  if (qyMatch) {
    return { year: Number(qyMatch[2]), quarter: Number(qyMatch[1]) };
  }

  return null;
};

const formatPeriodLabel = (year: number, quarter: number) => `Q${quarter} ${year}`;

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

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'teachers'>('overview');
  
  // Student Report State
  const [selectedGen, setSelectedGen] = useState<string | 'All'>('All');
  const [selectedClass, setSelectedClass] = useState<string | 'All'>('All');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Male' | 'Female' | 'Other'>('All');
  const [selectedLevel, setSelectedLevel] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [teachers, setTeachers] = useState<StudentRecord[]>([]);
  const [criteriaNav, setCriteriaNav] = useState<CriterionNavItem[]>([]);
  const [activeCriterionKey, setActiveCriterionKey] = useState('overall');
  const [ratingScale, setRatingScale] = useState(5);
  const [selectedTeacherQuarter, setSelectedTeacherQuarter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersRes, evalsRes, criteriaRes, feedbackRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users`),
          fetch(`${API_BASE_URL}/evaluations`),
          fetch(`${API_BASE_URL}/settings/evaluation-criteria`),
          fetch(`${API_BASE_URL}/feedbacks`)
        ]);

        if (!usersRes.ok) {
          throw new Error('Failed to load users.');
        }
        if (!evalsRes.ok) {
          throw new Error('Failed to load evaluations.');
        }

        const usersData = await usersRes.json();
        const evalsData = await evalsRes.json();
        const criteriaData = await criteriaRes.json().catch(() => ({}));
        const feedbackData = await feedbackRes.json().catch(() => ([]));

        const studentRows = Array.isArray(usersData)
          ? usersData.filter((u: any) => String(u.role || '').toLowerCase() === 'student')
          : [];
        const teacherRows = Array.isArray(usersData)
          ? usersData.filter((u: any) => String(u.role || '').toLowerCase() === 'teacher')
          : [];

        setStudents(studentRows.map((u: any) => ({
          id: Number(u.id),
          name: String(u.name || `${u.first_name || ''} ${u.last_name || ''}` || 'Student').trim(),
          email: String(u.email || ''),
          class: String(u.class || ''),
          gender: String(u.gender || ''),
          generation: u.generation ? String(u.generation) : undefined,
          profileImage: String(u.profile_image || '').trim() || null
        })));

        setTeachers(teacherRows.map((u: any) => ({
          id: Number(u.id),
          name: String(u.name || `${u.first_name || ''} ${u.last_name || ''}` || 'Teacher').trim(),
          email: String(u.email || ''),
          class: String(u.class || ''),
          gender: String(u.gender || ''),
          generation: u.generation ? String(u.generation) : undefined,
          profileImage: String(u.profile_image || '').trim() || null
        })));

        setEvaluations(Array.isArray(evalsData) ? evalsData : []);
        setFeedbacks(Array.isArray(feedbackData) ? feedbackData : []);

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
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to load report data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (activeCriterionKey !== 'overall' && criteriaNav.every((criterion) => criterion.key !== activeCriterionKey)) {
      setActiveCriterionKey('overall');
    }
  }, [activeCriterionKey, criteriaNav]);

  const generations = useMemo(() => {
    const unique = new Set<string>();
    students.forEach((student) => {
      const gen = parseGeneration(student);
      if (gen) unique.add(gen);
    });
    return Array.from(unique).sort();
  }, [students]);

  const getScoreLevel = (score?: number | null) => {
    if (score === null || score === undefined || Number.isNaN(score)) return null;
    if (score < 3) return 'Low';
    if (score < 4) return 'Medium';
    return 'High';
  };

  const studentAverageMap = useMemo(() => {
    const totals = new Map<number, { total: number; count: number }>();
    evaluations.forEach((evaluation) => {
      const userId = Number(evaluation.user_id);
      const score = Number(evaluation.average_score || 0);
      if (!Number.isInteger(userId)) return;
      if (!Number.isFinite(score)) return;
      const entry = totals.get(userId) || { total: 0, count: 0 };
      entry.total += score;
      entry.count += 1;
      totals.set(userId, entry);
    });

    const averages = new Map<number, number>();
    totals.forEach((entry, userId) => {
      if (entry.count > 0) {
        averages.set(userId, Number((entry.total / entry.count).toFixed(2)));
      }
    });

    return averages;
  }, [evaluations]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (selectedGen !== 'All') {
        const gen = parseGeneration(student);
        if (gen !== selectedGen) return false;
      }
      if (selectedClass !== 'All' && student.class !== selectedClass) {
        return false;
      }
      if (selectedLevel !== 'All') {
        const avgScore = studentAverageMap.get(student.id);
        const level = getScoreLevel(avgScore);
        if (!level || level !== selectedLevel) return false;
      }
      return true;
    });
  }, [students, selectedGen, selectedClass, selectedLevel, studentAverageMap]);

  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    students.forEach((student) => {
      if (selectedGen === 'All' || parseGeneration(student) === selectedGen) {
        if (student.class) classSet.add(student.class);
      }
    });
    return Array.from(classSet).sort();
  }, [students, selectedGen]);

  const filteredEvaluations = useMemo(() => {
    const studentIds = new Set(filteredStudents.map((student) => student.id));
    let filtered = evaluations.filter((evaluation) => studentIds.has(Number(evaluation.user_id)));
    if (selectedGender !== 'All') {
      const normalizedGender = selectedGender.toLowerCase();
      const genderIds = new Set(filteredStudents
        .filter((student) => String(student.gender || '').trim().toLowerCase() === normalizedGender)
        .map((student) => student.id));
      filtered = filtered.filter((evaluation) => genderIds.has(Number(evaluation.user_id)));
    }
    return filtered;
  }, [evaluations, filteredStudents, selectedGender]);

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

  const currentReportData = useMemo(() => {
    const totals = new Map<string, { total: number; count: number; label: string }>();
    const lookup = new Map<string, string>();
    criteriaList.forEach((criterion) => {
      totals.set(criterion.key, { total: 0, count: 0, label: criterion.label });
      lookup.set(toCriterionKey(criterion.key), criterion.key);
      lookup.set(toCriterionKey(criterion.label), criterion.key);
    });

    filteredEvaluations.forEach((evaluation) => {
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

    return criteriaList.map((criterion) => {
      const entry = totals.get(criterion.key);
      return {
        subject: criterion.label,
        color: criteriaColorMap.get(criterion.key) || '#5d5fef',
        score: entry && entry.count > 0
          ? Number((entry.total / entry.count).toFixed(2))
          : 0,
        fullMark: ratingScale
      };
    });
  }, [filteredEvaluations, criteriaList, ratingScale, criteriaColorMap]);

  const radarData = useMemo(() => (
    currentReportData.map((item) => ({
      subject: item.subject,
      curr: Math.max(0, item.score)
    }))
  ), [currentReportData]);

  const radarKeys = useMemo(() => ([
    {
      key: 'curr',
      name: selectedGender === 'All' ? 'Student Avg' : `${selectedGender} Avg`,
      color: '#4f46e5',
      fill: '#818cf8'
    }
  ]), [selectedGender]);

  const overallStats = useMemo(() => {
    const studentIds = new Set(students.map((student) => student.id));
    const studentEvaluations = evaluations.filter((evaluation) => studentIds.has(Number(evaluation.user_id)));

    const totalStudents = students.length;
    const evaluatedStudents = new Set(studentEvaluations.map((e) => Number(e.user_id))).size;
    const completionRate = totalStudents > 0 ? Math.round((evaluatedStudents / totalStudents) * 100) : 0;
    const pendingEvaluations = Math.max(0, totalStudents - evaluatedStudents);

    const avgScore = studentEvaluations.length > 0
      ? Number((studentEvaluations.reduce((sum, e) => sum + Number(e.average_score || 0), 0) / studentEvaluations.length).toFixed(2))
      : 0;

    return { totalStudents, evaluatedStudents, completionRate, pendingEvaluations, avgScore };
  }, [evaluations, students]);

  const teacherQuarterOptions = useMemo(() => {
    const periods = new Map<string, { year: number; quarter: number }>();
    evaluations.forEach((evaluation) => {
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
      periods.set(key, period);
    });

    const entries = Array.from(periods.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.quarter - b.quarter;
    });

    if (entries.length === 0) {
      const year = new Date().getFullYear();
      return [1, 2, 3, 4].map((q) => formatPeriodLabel(year, q));
    }

    const minYear = entries[0].year;
    const maxYear = entries[entries.length - 1].year;
    const allOptions: string[] = [];
    for (let year = minYear; year <= maxYear; year += 1) {
      for (let quarter = 1; quarter <= 4; quarter += 1) {
        allOptions.push(formatPeriodLabel(year, quarter));
      }
    }
    return allOptions;
  }, [evaluations]);

  const teacherPerformance = useMemo(() => {
    const filteredFeedbacks = selectedTeacherQuarter === 'All'
      ? feedbacks
      : feedbacks.filter((feedback) => {
          const evalId = Number(feedback.evaluation_id || 0);
          if (!evalId) return false;
          const evalRecord = evaluations.find((evaluation) => Number(evaluation.id) === evalId);
          if (!evalRecord) return false;
          const period = parsePeriodParts(evalRecord.period);
          if (!period) return false;
          return formatPeriodLabel(period.year, period.quarter) === selectedTeacherQuarter;
        });

    const feedbackByTeacher = new Map<number, FeedbackRecord[]>();
    filteredFeedbacks.forEach((feedback) => {
      const teacherId = Number(feedback.teacher_id);
      if (!Number.isInteger(teacherId) || teacherId <= 0) return;
      const list = feedbackByTeacher.get(teacherId) || [];
      list.push(feedback);
      feedbackByTeacher.set(teacherId, list);
    });

    const evaluationMap = new Map<number, EvaluationRecord>();
    evaluations.forEach((evaluation) => {
      evaluationMap.set(Number(evaluation.id), evaluation);
    });

    const teachersById = new Map<number, StudentRecord>();
    teachers.forEach((teacher) => {
      teachersById.set(Number(teacher.id), teacher);
    });

    const rows = teachers.map((teacher) => {
      const teacherId = Number(teacher.id);
      const teacherFeedbacks = feedbackByTeacher.get(teacherId) || [];
      const uniqueStudents = new Set(teacherFeedbacks.map((feedback) => Number(feedback.student_id)).filter((id) => Number.isInteger(id) && id > 0));
      const evaluationScores = teacherFeedbacks
        .map((feedback) => {
          const evalId = Number(feedback.evaluation_id || 0);
          if (!evalId) return null;
          const evalRecord = evaluationMap.get(evalId);
          return evalRecord ? Number(evalRecord.average_score || 0) : null;
        })
        .filter((score) => typeof score === 'number') as number[];

      const avgScore = evaluationScores.length > 0
        ? Number((evaluationScores.reduce((sum, score) => sum + score, 0) / evaluationScores.length).toFixed(1))
        : 0;

      return {
        id: teacherId,
        name: teacher.name || `Teacher #${teacherId}`,
        dept: teacher.class || 'Teaching Staff',
        avgScore,
        studentCount: uniqueStudents.size,
        profileImage: teacher.profileImage
      };
    });

    return rows.sort((a, b) => b.studentCount - a.studentCount || b.avgScore - a.avgScore);
  }, [feedbacks, evaluations, teachers, selectedTeacherQuarter]);

  const feedbackStatusData = useMemo(() => {
    const filteredFeedbacks = selectedTeacherQuarter === 'All'
      ? feedbacks
      : feedbacks.filter((feedback) => {
          const evalId = Number(feedback.evaluation_id || 0);
          if (!evalId) return false;
          const evalRecord = evaluations.find((evaluation) => Number(evaluation.id) === evalId);
          if (!evalRecord) return false;
          const period = parsePeriodParts(evalRecord.period);
          if (!period) return false;
          return formatPeriodLabel(period.year, period.quarter) === selectedTeacherQuarter;
        });

    const totalStudents = students.length;
    const studentWithFeedback = new Set(
      filteredFeedbacks.map((feedback) => Number(feedback.student_id)).filter((id) => Number.isInteger(id) && id > 0)
    );
    const completed = studentWithFeedback.size;
    const pending = Math.max(0, totalStudents - completed);

    return {
      completed,
      pending,
      data: [
        { name: 'With Feedback', value: completed, color: '#5d5fef' },
        { name: 'Pending', value: pending, color: '#fbbf24' }
      ]
    };
  }, [feedbacks, students, evaluations, selectedTeacherQuarter]);

  const performanceTrendData = useMemo(() => {
    const studentIds = new Set(students.map((student) => student.id));
    const studentEvaluations = evaluations.filter((evaluation) => studentIds.has(Number(evaluation.user_id)));

    const buckets = new Map<string, { total: number; count: number; year: number; quarter: number; studentIds: Set<number> }>();
    studentEvaluations.forEach((evaluation) => {
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
      const entry = buckets.get(key) || { total: 0, count: 0, year: period.year, quarter: period.quarter, studentIds: new Set<number>() };
      entry.studentIds.add(Number(evaluation.user_id));
      
      let value = Number(evaluation.average_score || 0);
      if (activeCriterionKey !== 'overall') {
        const responses = Array.isArray(evaluation.responses) ? evaluation.responses : [];
        const normalizedActiveKey = toCriterionKey(activeCriterionKey);
        const matched = responses.find((response) => {
          const keyCandidate = toCriterionKey(String(response.criterion_key || ''));
          const nameCandidate = toCriterionKey(String(response.criterion_name || ''));
          return keyCandidate === normalizedActiveKey || nameCandidate === normalizedActiveKey;
        });
        if (matched) {
          value = Number(matched.star_value || 0);
          entry.total += value;
          entry.count += 1;
        }
      } else {
        entry.total += value;
        entry.count += 1;
      }
      buckets.set(key, entry);
    });

    const periods = Array.from(buckets.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.quarter - b.quarter;
    });

    if (periods.length === 0) {
      return [];
    }

    return periods.map((entry) => ({
      label: formatPeriodLabel(entry.year, entry.quarter),
      studentAvg: entry.count > 0 ? Number((entry.total / entry.count).toFixed(1)) : 0,
      completion: entry.studentIds.size
    }));
  }, [evaluations, students, activeCriterionKey]);

  const activeCriterionColor = useMemo(() => {
    if (activeCriterionKey === 'overall') return '#5d5fef';
    return criteriaColorMap.get(activeCriterionKey) || '#5d5fef';
  }, [activeCriterionKey, criteriaColorMap]);

  const handleExport = async () => {
    try {
      setExporting(true);
      setExportNotice(null);
      const params = new URLSearchParams();
      params.append('scope', activeTab);

      if (activeTab === 'students') {
        if (selectedClass !== 'All') params.append('class', selectedClass);
        if (selectedGen !== 'All') params.append('generation', selectedGen);
        if (selectedGender !== 'All') params.append('gender', selectedGender);
        if (selectedLevel !== 'All') params.append('level', selectedLevel);
      }

      if (activeTab === 'teachers' && selectedTeacherQuarter !== 'All') {
        params.append('quarter', selectedTeacherQuarter);
      }

      const response = await fetch(`${API_BASE_URL}/evaluations/report/export?${params.toString()}`);
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
      const exportLabel = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      a.download = `Admin_${exportLabel}_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExportNotice({
        type: 'success',
        message: 'Export completed. Your Excel file is downloading.'
      });
    } catch (err: any) {
      console.error(err);
      setExportNotice({
        type: 'error',
        message: err?.message || 'Failed to export report.'
      });
    } finally {
      setExporting(false);
    }
  };



  // Handle PDF export

  const handleExportPDF = () => {

    const elementId = activeTab === 'overview' ? 'overview-content' : 

                     activeTab === 'students' ? 'student-content' : 

                     'teacher-content';

    const filename = `${activeTab}-report-${new Date().toISOString().split('T')[0]}`;

    

    const success = exportToPDF(elementId, filename);

    if (!success) {

      alert('Failed to export PDF. Please try again.');

    }

  };



  return (

    <div className="flex h-screen overflow-hidden bg-slate-50">

      <AdminSidebar />



      <main className="flex-1 overflow-y-auto">

        <AdminMobileNav />

        {/* Header */}

        <header className="h-auto min-h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">

          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-8 w-full md:w-auto">

            <div>

              <h1 className="text-lg md:text-xl font-black text-slate-900">Visual Reports</h1>

              <p className="text-xs text-slate-500 font-bold hidden md:block">Comprehensive performance analytics.</p>

            </div>

            

            <nav className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto w-full md:w-auto">

              {(['overview', 'students', 'teachers'] as const).map((tab) => (

                <button

                  key={tab}

                  onClick={() => setActiveTab(tab)}

                  className={cn(

                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",

                    activeTab === tab ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"

                  )}

                >

                  {tab}

                </button>

              ))}

            </nav>

          </div>

          

          <div className="flex items-center gap-4">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting ? 'Exporting...' : 'Export Excel'}
            </button>

          </div>

        </header>



        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8">
          {loading && (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm font-semibold">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading report data...
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
          {error && !loading && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-semibold">
              {error}
            </div>
          )}
          <AnimatePresence mode="wait">

            {activeTab === 'students' ? (

              <motion.div 

                key="student-reports"

                id="student-content"

                initial={{ opacity: 0, y: 20 }}

                animate={{ opacity: 1, y: 0 }}

                exit={{ opacity: 0, y: -20 }}

                className="space-y-8"

              >

                {/* Filters */}

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-6 items-end">

                  <div className="space-y-2">

                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generation</label>

                    <select 

                      value={selectedGen}

                      onChange={(e) => {

                        setSelectedGen(e.target.value);

                        setSelectedClass('All');
                        setSelectedGender('All');
                      }}

                      className="block w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"

                    >

                      <option value="All">All Generations</option>
                      {generations.map(gen => <option key={gen} value={gen}>{gen}</option>)}
                    </select>

                  </div>



                  <div className="space-y-2">

                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</label>

                    <select 
                      value={selectedClass}

                      onChange={(e) => {

                        setSelectedClass(e.target.value);
                        setSelectedGender('All');
                      }}

                      className="block w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"

                    >

                      <option value="All">All Classes</option>
                      {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                  </div>



                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                    <select 
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value as 'All' | 'Male' | 'Female' | 'Other')}
                      className="block w-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="All">All Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>

                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value as 'All' | 'Low' | 'Medium' | 'High')}
                      className="block w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="All">All Levels</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <button 

                    onClick={() => {

                      setSelectedGen('All');

                      setSelectedClass('All');
                      setSelectedGender('All');
                      setSelectedLevel('All');
                    }}

                    className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"

                  >

                    Reset Filters

                  </button>

                </div>



                {/* Performance Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">

                    <div className="flex items-center justify-between mb-8">

                      <div>

                        <h3 className="text-lg font-black text-slate-900">

                          {selectedClass !== 'All' ? `Class ${selectedClass} Performance` :

                           selectedGen !== 'All' ? `${selectedGen} Performance` : 'Overall Student Performance'}

                        </h3>

                        <p className="text-xs text-slate-500 font-bold">Detailed breakdown by criteria</p>

                      </div>

                      <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">

                        <BarChart3 className="w-5 h-5" />

                      </div>

                    </div>



                    <div className="h-[400px] w-full">

                      <ResponsiveContainer width="100%" height="100%">

                        <BarChart data={currentReportData}>

                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                          <XAxis 

                            dataKey="subject" 

                            axisLine={false} 

                            tickLine={false} 

                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}

                          />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, ratingScale]} />
                          <Tooltip 

                            cursor={{ fill: '#f8fafc' }}

                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}

                          />
                          <Bar dataKey="score" radius={[10, 10, 0, 0]} barSize={44}>
                            {currentReportData.map((entry) => (
                              <Cell key={`bar-${entry.subject}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>

                      </ResponsiveContainer>

                    </div>

                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/25 pointer-events-none" />
                    <div className="relative z-10">
                      <h3 className="text-lg font-black text-slate-900 mb-8">Radar Analysis</h3>
                      <RadarChart data={radarData} dataKeys={radarKeys} maxValue={ratingScale} />
                      
                      <div className="mt-8 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Insights</h4>
                        <div className="p-4 bg-emerald-100/70 rounded-2xl border border-emerald-200">
                          <p className="text-xs font-bold text-emerald-800">Strongest Area</p>
                          <p className="text-sm font-black text-emerald-950 mt-1">
                            {currentReportData.every((item) => item.score === 0)
                              ? 'No data yet'
                              : currentReportData.reduce((prev, curr) => prev.score > curr.score ? prev : curr).subject}
                          </p>
                        </div>
                        <div className="p-4 bg-rose-100/70 rounded-2xl border border-rose-200">
                          <p className="text-xs font-bold text-rose-800">Growth Opportunity</p>
                          <p className="text-sm font-black text-rose-950 mt-1">
                            {currentReportData.every((item) => item.score === 0)
                              ? 'No data yet'
                              : currentReportData.reduce((prev, curr) => prev.score < curr.score ? prev : curr).subject}
                          </p>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

              </motion.div>

            ) : activeTab === 'teachers' ? (

              <motion.div 

                key="teacher-reports"

                id="teacher-content"

                initial={{ opacity: 0, y: 20 }}

                animate={{ opacity: 1, y: 0 }}

                exit={{ opacity: 0, y: -20 }}

                className="space-y-8"

              >
                {/* Teacher reporting content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                      <h3 className="text-lg font-black text-slate-900">Evaluation Status</h3>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quarter</label>
                        <select
                          value={selectedTeacherQuarter}
                          onChange={(e) => setSelectedTeacherQuarter(e.target.value)}
                          className="bg-slate-100 border border-slate-200 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="All">All</option>
                          {teacherQuarterOptions.map((quarter) => (
                            <option key={quarter} value={quarter}>{quarter}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="h-[250px] w-full">

                      <ResponsiveContainer width="100%" height="100%">

                        <PieChart>

                          <Pie
                            data={feedbackStatusData.data}
                            cx="50%"

                            cy="50%"

                            innerRadius={60}

                            outerRadius={80}

                            paddingAngle={8}

                            dataKey="value"

                          >
                            {feedbackStatusData.data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />

                            ))}

                          </Pie>

                          <Tooltip />

                        </PieChart>

                      </ResponsiveContainer>

                    </div>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Students With Feedback</p>
                      <p className="text-2xl font-black text-slate-900">{feedbackStatusData.completed}</p>
                    </div>
                  </div>

                  

                  <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-8">
                      <h3 className="text-lg font-black text-slate-900">Top Performing Teachers</h3>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {selectedTeacherQuarter === 'All' ? 'All Quarters' : selectedTeacherQuarter}
                      </div>
                    </div>
                    <div className="space-y-6">
                      {teacherPerformance.map((teacher, idx) => (
                        <div key={teacher.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-4">

                            <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">

                              {idx + 1}

                            </div>

                            <div>
                              <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                  <img
                                    src={teacher.profileImage || DEFAULT_AVATAR}
                                    alt={teacher.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-900">{teacher.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{teacher.dept || 'Teaching Staff'} Department</p>
                                </div>
                              </div>
                            </div>

                          </div>

                          <div className="flex items-center gap-8">

                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900">{teacher.avgScore.toFixed(1)}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Score</p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900">{teacher.studentCount}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Students</p>
                            </div>

                          </div>

                        </div>

                      ))}
                      {teacherPerformance.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                          No teacher feedback data yet.
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </motion.div>

            ) : (

              <motion.div 

                key="overview-reports"

                id="overview-content"

                initial={{ opacity: 0, y: 20 }}

                animate={{ opacity: 1, y: 0 }}

                exit={{ opacity: 0, y: -20 }}

                className="space-y-8"

              >

                {/* Overview Stats */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">

                    <div className="flex items-center justify-between mb-4">

                      <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                        <TrendingUp className="w-5 h-5" />

                      </div>

                      <span className="text-emerald-600 text-[10px] font-black flex items-center gap-1">

                        <ArrowUpRight className="w-3 h-3" />

                        +4.2%

                      </span>

                    </div>

                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Student Score</p>
                    <p className="text-3xl font-black text-slate-900">
                      {overallStats.avgScore || 0}
                      <span className="text-sm text-slate-400 font-medium"> / 5.0</span>
                    </p>
                  </div>



                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">

                    <div className="flex items-center justify-between mb-4">

                      <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">

                        <UserCheck className="w-5 h-5" />

                      </div>

                      <span className="text-emerald-600 text-[10px] font-black flex items-center gap-1">

                        <ArrowUpRight className="w-3 h-3" />

                        +12%

                      </span>

                    </div>

                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Teacher Completion</p>
                    <p className="text-3xl font-black text-slate-900">{overallStats.completionRate}%</p>
                  </div>



                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">

                    <div className="flex items-center justify-between mb-4">

                      <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">

                        <Target className="w-5 h-5" />

                      </div>

                      <span className="text-rose-600 text-[10px] font-black flex items-center gap-1">

                        <ArrowDownRight className="w-3 h-3" />

                        -2.1%

                      </span>

                    </div>

                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Evaluations</p>
                    <p className="text-3xl font-black text-slate-900">{overallStats.pendingEvaluations}</p>
                  </div>

                </div>



                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">

                  <div className="flex items-center justify-between mb-8">

                    <h3 className="text-lg font-black text-slate-900">Performance Trend</h3>

                    <div className="flex gap-4">

                      <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full" style={{ backgroundColor: activeCriterionColor }} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {activeCriterionKey === 'overall'
                            ? 'Student Avg'
                            : (criteriaNav.find((criterion) => criterion.key === activeCriterionKey)?.label || 'Criteria Avg')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-emerald-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Completion</span>
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

                  <div className="h-[400px] w-full">

                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceTrendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, ratingScale]} />
                        <YAxis
                          yAxisId="completion"
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          domain={[0, Math.max(1, students.length)]}
                        />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                        <Line
                          type="monotone"
                          dataKey="studentAvg"
                          stroke={activeCriterionColor}
                          strokeWidth={4}
                          dot={{ r: 6, fill: '#fff', stroke: activeCriterionColor, strokeWidth: 3 }}
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

                </div>

              </motion.div>

            )}

          </AnimatePresence>

        </div>

      </main>

    </div>

  );

}



