import { motion } from 'framer-motion';
import { ResponsiveContainer, Area, AreaChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface Props {
  activeTrendData: Array<{ name: string; score: number; feedbackCount?: number }>;
  globalRatingScale: number;
  maxFeedbackCount: number;
  activeCriterionId: string;
  criteriaNav: Array<{ id: string; name: string }>;
  onCriterionChange: (id: string) => void;
  latestRating: number;
  recordCount: number;
}

export function PerformanceTrend({ 
  activeTrendData, 
  globalRatingScale, 
  maxFeedbackCount, 
  activeCriterionId, 
  criteriaNav, 
  onCriterionChange, 
  latestRating, 
  recordCount 
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200"
    >
      <div className="mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Performance Trend</h3>
          <p className="text-xs text-slate-500 mt-1">Average score across your submitted evaluations</p>
        </div>
      </div>

      <div className="flex items-baseline gap-4 mb-8">
        <span className="text-5xl font-black text-slate-900">
          {latestRating.toFixed(1)}
        </span>
        <span className="text-slate-400 text-lg font-medium">/ {globalRatingScale.toFixed(1)}</span>
        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
          <TrendingUp className="w-3 h-3" />
          {recordCount} Records
        </div>
      </div>

      {activeTrendData.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-sm font-bold text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
          No evaluation data available yet.
        </div>
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeTrendData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5d5fef" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#5d5fef" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                dy={10}
              />
              <YAxis yAxisId="score" hide domain={[0, globalRatingScale]} />
              <YAxis yAxisId="feedback" hide domain={[0, maxFeedbackCount]} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                  fontSize: '12px', 
                  fontWeight: 'bold' 
                }} 
              />
              <Area
                type="monotone"
                dataKey="score"
                yAxisId="score"
                stroke="#5d5fef"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorScore)"
                dot={{ r: 6, fill: '#fff', stroke: '#5d5fef', strokeWidth: 3 }}
                activeDot={{ r: 8, fill: '#5d5fef', stroke: '#fff', strokeWidth: 3 }}
              />
              {activeCriterionId === 'overall' && (
                <Line
                  type="monotone"
                  dataKey="feedbackCount"
                  yAxisId="feedback"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
