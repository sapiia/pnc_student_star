import { motion } from 'motion/react';
import { BarChart3 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { TeacherReportCriteriaPoint } from '../../../lib/teacher/reporting';

interface TeacherCriteriaDistributionCardProps {
  criteria: TeacherReportCriteriaPoint[];
}

export default function TeacherCriteriaDistributionCard({
  criteria,
}: TeacherCriteriaDistributionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tight text-slate-900">
          Criteria Distribution
        </h3>
        <BarChart3 className="h-5 w-5 text-slate-400" />
      </div>

      <div className="h-[250px] w-full md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={criteria} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#f1f5f9"
            />
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
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
              {criteria.map((entry, index) => (
                <Cell key={`criterion-cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
