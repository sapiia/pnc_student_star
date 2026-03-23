import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Star, TrendingUp } from 'lucide-react';
import StatsCard from '../StatsCard';
import type { StudentData } from '../../../hooks/useTeacherDashboardData';
import type { ReactNode } from 'react';

interface DashboardStatsProps {
  filteredStudents: StudentData[];
  evaluations: any[];
  loading: boolean;
  onAttentionClick?: () => void;
}

interface Stat {
  label: string;
  value: string | number;
  total?: string;
  trend?: string;
  icon: any;
  color: string;
  bg: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function DashboardStats({
  filteredStudents,
  evaluations,
  loading,
  onAttentionClick,
}: DashboardStatsProps) {
  const navigate = useNavigate();

  const STATS = useMemo((): Stat[] => {
    const filteredStudentIds = new Set(filteredStudents.map((s) => s.id));
    const scopedEvaluations = evaluations.filter((evaluation) =>
      filteredStudentIds.has(Number(evaluation.user_id))
    );

    const ratedStudents = filteredStudents.filter(s => s.rating !== null);
    const avgScoreLocal = ratedStudents.length > 0 
      ? ratedStudents.reduce((acc, curr) => acc + (curr.rating as number), 0) / ratedStudents.length 
      : 0;
    const evalRateLocal = filteredStudents.length > 0 ? (ratedStudents.length / filteredStudents.length) * 100 : 0;
    const needsAttentionCount = ratedStudents.filter(s => (s.rating as number) < 2.5).length;

    return [
      { 
        label: 'Avg Feedback Stars', 
        value: avgScoreLocal.toFixed(1), 
        total: '/5.0', 
        trend: '', 
        icon: Star, 
        color: 'text-amber-500', 
        bg: 'bg-amber-50' 
      },
      { 
        label: 'Evaluation Rate', 
        value: `${Math.round(evalRateLocal)}%`, 
        total: '', 
        trend: '', 
        icon: TrendingUp, 
        color: 'text-primary', 
        bg: 'bg-primary/5' 
      },
      { 
        label: 'Needs Attention', 
        value: String(needsAttentionCount), 
        total: 'Students', 
        trend: '', 
        icon: AlertCircle, 
        color: 'text-rose-500', 
        bg: 'bg-rose-50', 
        actionLabel: 'View Detail', 
        onAction: onAttentionClick 
      },
    ];
  }, [filteredStudents, evaluations, onAttentionClick]);

  const needsAttention = STATS[2].value !== '0';

  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 lg:gap-6">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-[1600px] mx-auto">
      {/* Stats Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 lg:gap-6">
{STATS.map((stat: Stat, idx: number) => (
          <StatsCard key={stat.label} {...stat} index={idx} />
        ))}
      </div>

      {/* Alert Banner */}
      {needsAttention && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 border border-rose-100 p-4 lg:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="size-10 md:size-12 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-200 shrink-0">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-rose-900 text-sm lg:text-base">Urgent Alerts</h4>
              <p className="text-xs lg:text-sm text-rose-700 leading-tight">
                {STATS[2].value} students have an average score below 2.5 stars. Intervention is recommended.
              </p>
            </div>
          </div>
          <button 
            onClick={onAttentionClick}
            className="bg-rose-500 text-white px-6 py-2 lg:py-2.5 rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all text-sm shrink-0 lg:w-auto w-full active:scale-95"
            aria-label="Review students needing attention"
          >
            Review Students
          </button>
        </motion.div>
      )}
    </div>
  );
}

