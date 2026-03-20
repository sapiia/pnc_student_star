import { motion } from 'motion/react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import {
  getReportEngagementHealth,
  type TeacherReportEngagementPoint,
} from '../../../lib/teacher/reporting';

interface TeacherEngagementStatusCardProps {
  completionRate: number;
  engagement: TeacherReportEngagementPoint[];
}

export default function TeacherEngagementStatusCard({
  completionRate,
  engagement,
}: TeacherEngagementStatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tight text-slate-900">
          Engagement Status
        </h3>
        <div className="rounded-lg bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">
          {getReportEngagementHealth(completionRate)}
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 md:flex-row">
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
                  <Cell key={`engagement-cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full space-y-4 md:w-1/2">
          {engagement.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm font-bold text-slate-700">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-black text-slate-900">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
