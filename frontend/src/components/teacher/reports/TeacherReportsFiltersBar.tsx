import {
  BarChart3,
  ChevronDown,
  Filter,
  TrendingUp,
  Users,
} from 'lucide-react';

import type {
  TeacherReportGenderOption,
  TeacherReportStats,
} from '../../../lib/teacher/reporting';

interface TeacherReportsFiltersBarProps {
  availableClasses: string[];
  generations: string[];
  selectedClass: string;
  selectedGender: TeacherReportGenderOption;
  selectedGeneration: string;
  stats: TeacherReportStats;
  onClassChange: (value: string) => void;
  onGenderChange: (value: TeacherReportGenderOption) => void;
  onGenerationChange: (value: string) => void;
}

function ReportsFilterSelect({
  children,
  disabled = false,
  value,
  onChange,
}: {
  children: any;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="appearance-none rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 pr-10 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

export default function TeacherReportsFiltersBar({
  availableClasses,
  generations,
  selectedClass,
  selectedGender,
  selectedGeneration,
  stats,
  onClassChange,
  onGenderChange,
  onGenerationChange,
}: TeacherReportsFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <ReportsFilterSelect
        value={selectedGeneration}
        onChange={onGenerationChange}
      >
        <option value="All">All Generations</option>
        {generations.map((generation) => (
          <option key={generation} value={generation}>
            Gen {generation}
          </option>
        ))}
      </ReportsFilterSelect>

      <ReportsFilterSelect
        value={selectedClass}
        onChange={onClassChange}
        disabled={selectedGeneration === 'All' && availableClasses.length === 0}
      >
        <option value="All">All Classes</option>
        {availableClasses.map((className) => (
          <option key={className} value={className}>
            {className}
          </option>
        ))}
      </ReportsFilterSelect>

      <ReportsFilterSelect
        value={selectedGender}
        onChange={(value) => onGenderChange(value as TeacherReportGenderOption)}
      >
        <option value="All">All Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </ReportsFilterSelect>

      <div className="mx-2 h-8 w-px bg-slate-200" />

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-bold text-slate-700">{stats.totalStudents}</span>
          <span className="text-slate-400">Students</span>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span className="font-bold text-slate-700">{stats.avgScore}</span>
          <span className="text-slate-400">Avg Score</span>
        </div>

        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-amber-500" />
          <span className="font-bold text-slate-700">
            {stats.completionRate}%
          </span>
          <span className="text-slate-400">Completion</span>
        </div>
      </div>

      <div className="mx-2 h-8 w-px bg-slate-200" />

      <button
        type="button"
        className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
      >
        <Filter className="h-4 w-4" />
        Advanced Filters
      </button>
    </div>
  );
}
