import { ArrowUpRight, UserCheck, Users } from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '../../../lib/utils';

import type { StudentStatsSummary } from './adminDashboard.types';
import { formatGenerationTitle, isYearGeneration } from './adminDashboard.utils';

interface AdminDashboardOverviewProps {
  studentStats: StudentStatsSummary | null;
  teacherCount: number;
  adminCount: number;
  generationActionLoading: Record<string, boolean>;
  onOpenUsers: () => void;
  onOpenTeachers: () => void;
  onOpenClass: (generation: string, className: string) => void;
  onToggleGeneration: (generation: string, activeCount: number) => void;
}

function StudentOverviewCard({
  studentStats,
  generationActionLoading,
  onOpenUsers,
  onOpenClass,
  onToggleGeneration,
}: Pick<AdminDashboardOverviewProps, 'studentStats' | 'generationActionLoading' | 'onOpenUsers' | 'onOpenClass' | 'onToggleGeneration'>) {
  const activeGenerations = studentStats?.generations.filter((generation) => generation.activeCount > 0) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex-1 p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
            <Users className="h-6 w-6" />
          </div>
          <button
            onClick={onOpenUsers}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
          >
            View All
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">Total Students</p>
        <p className="mb-4 text-3xl font-black text-slate-900">{studentStats?.total || 0}</p>

        {activeGenerations.length > 0 ? (
          <div className="space-y-3">
            {activeGenerations.map((generation) => (
              <div key={generation.title} className="rounded-xl bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                    {formatGenerationTitle(generation.title)}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-blue-600">{generation.total}</p>
                    <button
                      type="button"
                      onClick={() => onToggleGeneration(generation.title, generation.activeCount)}
                      disabled={generationActionLoading[generation.title] || !isYearGeneration(generation.title)}
                      className={cn(
                        'rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest transition-colors',
                        generation.activeCount > 0
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
                        generationActionLoading[generation.title] || !isYearGeneration(generation.title)
                          ? 'cursor-not-allowed opacity-60'
                          : '',
                      )}
                    >
                      {generationActionLoading[generation.title]
                        ? '...'
                        : generation.activeCount > 0
                          ? 'Disable'
                          : 'Enable'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {generation.classes.map((classItem) => (
                    <button
                      key={classItem.name}
                      onClick={() => onOpenClass(generation.title, classItem.name)}
                      className="group/btn flex items-center justify-between rounded-lg border border-transparent p-1.5 transition-colors hover:border-slate-200 hover:bg-white"
                    >
                      <span className="text-[9px] font-bold text-slate-400 group-hover/btn:text-primary">
                        {classItem.name}
                      </span>
                      <span className="text-[9px] font-black text-slate-600">{classItem.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
            No active generations available.
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TeacherOverviewCard({
  teacherCount,
  adminCount,
  onOpenTeachers,
}: Pick<AdminDashboardOverviewProps, 'teacherCount' | 'adminCount' | 'onOpenTeachers'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex-1 p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
            <UserCheck className="h-6 w-6" />
          </div>
          <button
            onClick={onOpenTeachers}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
          >
            View All
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">Total Teachers</p>
        <p className="mb-2 text-3xl font-black text-slate-900">{teacherCount}</p>
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <p className="text-[10px] font-bold leading-relaxed text-emerald-700">
            All teachers are currently active and assigned to their respective departments.
          </p>
          <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-emerald-600/70">
            {adminCount} admin{adminCount === 1 ? '' : 's'} monitoring operations
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboardOverview(props: AdminDashboardOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <StudentOverviewCard {...props} />
      <TeacherOverviewCard {...props} />
    </div>
  );
}
