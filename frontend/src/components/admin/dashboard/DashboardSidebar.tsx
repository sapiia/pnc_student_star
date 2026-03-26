import { Calendar } from 'lucide-react';

import { cn } from '../../../lib/utils';

import type { StudentStatsSummary } from './adminDashboard.types';
import { formatGenerationTitle, isYearGeneration, SYSTEM_ACTIVITY } from './adminDashboard.utils';

interface DashboardSidebarProps {
  studentStats: StudentStatsSummary | null;
  generationActionLoading: Record<string, boolean>;
  onToggleGeneration: (generation: string, activeCount: number) => void;
}

function DisabledGenerationsCard({
  studentStats,
  generationActionLoading,
  onToggleGeneration,
}: DashboardSidebarProps) {
  const disabledGenerations = studentStats?.generations.filter(
    (generation) => generation.disabledCount > 0 && generation.activeCount === 0,
  ) ?? [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="font-black text-slate-900">Disabled Generations</h3>
      </div>

      {!studentStats ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
          Loading generations...
        </div>
      ) : disabledGenerations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
          No disabled generations.
        </div>
      ) : (
        <div className="space-y-3">
          {disabledGenerations.map((generation) => (
            <div
              key={generation.title}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {formatGenerationTitle(generation.title)}
                </p>
                <p className="text-sm font-black text-slate-900">
                  {generation.disabledCount} students disabled
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleGeneration(generation.title, generation.activeCount)}
                disabled={generationActionLoading[generation.title] || !isYearGeneration(generation.title)}
                className={cn(
                  'rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors',
                  generationActionLoading[generation.title] || !isYearGeneration(generation.title)
                    ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
                )}
              >
                {generationActionLoading[generation.title] ? '...' : 'Enable'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SystemActivityCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-black text-slate-900">System Activity</h3>
        <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-6">
        {SYSTEM_ACTIVITY.map((activity) => (
          <div key={activity.id} className="flex gap-4">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                activity.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600'
                  : activity.type === 'info'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-orange-50 text-orange-600',
              )}
            >
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight text-slate-900">{activity.message}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardSidebar(props: DashboardSidebarProps) {
  return (
    <div className="space-y-8">
      <DisabledGenerationsCard {...props} />
      <SystemActivityCard />
    </div>
  );
}
