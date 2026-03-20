import { motion } from 'motion/react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { cn } from '../../../lib/utils';
import type {
  TeacherReportCriterionNavItem,
  TeacherReportTrendPoint,
} from '../../../lib/teacher/reporting';

interface TeacherPerformanceTrendCardProps {
  activeCriterionColor: string;
  activeCriterionKey: string;
  activeCriterionLabel: string;
  criteriaColorMap: ReadonlyMap<string, string>;
  criteriaNav: TeacherReportCriterionNavItem[];
  ratingScale: number;
  totalStudents: number;
  trend: TeacherReportTrendPoint[];
  onCriterionChange: (value: string) => void;
}

export default function TeacherPerformanceTrendCard({
  activeCriterionColor,
  activeCriterionKey,
  activeCriterionLabel,
  criteriaColorMap,
  criteriaNav,
  ratingScale,
  totalStudents,
  trend,
  onCriterionChange,
}: TeacherPerformanceTrendCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black tracking-tight text-slate-900">
            Class Performance Trend
          </h3>
          <p className="text-sm text-slate-500">
            Average star rating vs. evaluation completion count
          </p>
        </div>

        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: activeCriterionColor }}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {activeCriterionLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Completion
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => onCriterionChange('overall')}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
              activeCriterionKey === 'overall'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-400 hover:text-slate-600',
            )}
          >
            <span className="size-2 rounded-full bg-primary" />
            Overall
          </button>

          {criteriaNav.map((criterion) => (
            <button
              key={criterion.id}
              type="button"
              onClick={() => onCriterionChange(criterion.key)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
                activeCriterionKey === criterion.key
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-400 hover:text-slate-600',
              )}
            >
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor:
                    criteriaColorMap.get(criterion.key) || '#5d5fef',
                }}
              />
              {criterion.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[250px] w-full md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
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
              domain={[0, Math.max(1, totalStudents)]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="avg"
              yAxisId="score"
              stroke={activeCriterionColor}
              strokeWidth={4}
              dot={{
                r: 6,
                fill: activeCriterionColor,
                strokeWidth: 3,
                stroke: '#fff',
              }}
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
  );
}
