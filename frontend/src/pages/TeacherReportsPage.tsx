import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Download, 
  Filter, 
  ChevronDown,
  Bell,
  Settings,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import TeacherSidebar from '../components/TeacherSidebar';
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
  Legend
} from 'recharts';
import { cn } from '../lib/utils';

const TREND_DATA = [
  { name: 'Week 1', avg: 3.2, completion: 65 },
  { name: 'Week 2', avg: 3.5, completion: 72 },
  { name: 'Week 3', avg: 3.4, completion: 80 },
  { name: 'Week 4', avg: 3.8, completion: 78 },
  { name: 'Week 5', avg: 4.0, completion: 85 },
  { name: 'Week 6', avg: 4.2, completion: 92 },
];

const CRITERIA_DATA = [
  { name: 'Living', value: 4.2, color: '#5d5fef' },
  { name: 'Study', value: 4.5, color: '#10b981' },
  { name: 'Human', value: 3.8, color: '#f59e0b' },
  { name: 'Health', value: 4.0, color: '#ef4444' },
  { name: 'Money', value: 3.5, color: '#8b5cf6' },
  { name: 'Feeling', value: 3.9, color: '#ec4899' },
  { name: 'Skill', value: 4.1, color: '#06b6d4' },
];

const ENGAGEMENT_DATA = [
  { name: 'Completed', value: 85, fill: '#5d5fef' },
  { name: 'Pending', value: 10, fill: '#94a3b8' },
  { name: 'Overdue', value: 5, fill: '#ef4444' },
];

const DATA_BY_GEN = {
  'ALL Gen': {
    trend: TREND_DATA,
    criteria: CRITERIA_DATA,
    engagement: ENGAGEMENT_DATA
  },
  'Gen 2027': {
    trend: [
      { name: 'Week 1', avg: 3.0, completion: 60 },
      { name: 'Week 2', avg: 3.2, completion: 68 },
      { name: 'Week 3', avg: 3.1, completion: 75 },
      { name: 'Week 4', avg: 3.5, completion: 70 },
      { name: 'Week 5', avg: 3.7, completion: 80 },
      { name: 'Week 6', avg: 3.9, completion: 88 },
    ],
    criteria: [
      { name: 'Living', value: 3.8, color: '#5d5fef' },
      { name: 'Study', value: 4.0, color: '#10b981' },
      { name: 'Human', value: 3.5, color: '#f59e0b' },
      { name: 'Health', value: 3.7, color: '#ef4444' },
      { name: 'Money', value: 3.2, color: '#8b5cf6' },
      { name: 'Feeling', value: 3.6, color: '#ec4899' },
      { name: 'Skill', value: 3.8, color: '#06b6d4' },
    ],
    engagement: [
      { name: 'Completed', value: 78, fill: '#5d5fef' },
      { name: 'Pending', value: 15, fill: '#94a3b8' },
      { name: 'Overdue', value: 7, fill: '#ef4444' },
    ]
  },
  'Gen 2026': {
    trend: [
      { name: 'Week 1', avg: 3.5, completion: 70 },
      { name: 'Week 2', avg: 3.8, completion: 75 },
      { name: 'Week 3', avg: 3.7, completion: 85 },
      { name: 'Week 4', avg: 4.1, completion: 82 },
      { name: 'Week 5', avg: 4.3, completion: 90 },
      { name: 'Week 6', avg: 4.5, completion: 95 },
    ],
    criteria: [
      { name: 'Living', value: 4.5, color: '#5d5fef' },
      { name: 'Study', value: 4.8, color: '#10b981' },
      { name: 'Human', value: 4.2, color: '#f59e0b' },
      { name: 'Health', value: 4.3, color: '#ef4444' },
      { name: 'Money', value: 3.8, color: '#8b5cf6' },
      { name: 'Feeling', value: 4.2, color: '#ec4899' },
      { name: 'Skill', value: 4.4, color: '#06b6d4' },
    ],
    engagement: [
      { name: 'Completed', value: 92, fill: '#5d5fef' },
      { name: 'Pending', value: 5, fill: '#94a3b8' },
      { name: 'Overdue', value: 3, fill: '#ef4444' },
    ]
  }
};

export default function TeacherReportsPage() {
  const navigate = useNavigate();
  const [selectedGen, setSelectedGen] = useState('ALL Gen');
  const [selectedClass, setSelectedClass] = useState('WEB Class A');

  const currentData = DATA_BY_GEN[selectedGen as keyof typeof DATA_BY_GEN];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Academic Analytics</h1>
            <p className="text-xs text-slate-500">Deep dive into class performance and student growth trends.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button 
              onClick={() => navigate('/teacher/notifications')}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1400px] mx-auto space-y-8">
            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="relative">
                <select 
                  value={selectedGen}
                  onChange={(e) => setSelectedGen(e.target.value)}
                  className="appearance-none flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 pr-10"
                >
                  <option value="ALL Gen">ALL Gen</option>
                  <option value="Gen 2027">Gen 2027</option>
                  <option value="Gen 2026">Gen 2026</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="appearance-none flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 pr-10"
                >
                  <option value="WEB Class A">WEB Class A</option>
                  <option value="WEB Class B">WEB Class B</option>
                  <option value="WEB Class C">WEB Class C</option>
                  <option value="WEB Class D">WEB Class D</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <div className="h-8 w-px bg-slate-200 mx-2" />
              <button className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                <Filter className="w-4 h-4" />
                Advanced Filters
              </button>
            </div>

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
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentData.trend}>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentData.criteria} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }}
                        width={80}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                        {currentData.criteria.map((entry, index) => (
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
                    Healthy
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="h-[250px] w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={currentData.engagement}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {currentData.engagement.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 space-y-4">
                    {currentData.engagement.map((item) => (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Growth Insight</span>
                </div>
                <h4 className="font-bold text-emerald-900 mb-2">Academic Surge</h4>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  Class average in 'Study' has increased by 15% since Week 1. Peer-learning initiatives are showing high impact.
                </p>
              </div>
              <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <ArrowDownRight className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Attention Needed</span>
                </div>
                <h4 className="font-bold text-amber-900 mb-2">Financial Stress</h4>
                <p className="text-sm text-amber-700 leading-relaxed">
                  'Money' pillar scores have dipped slightly. Consider checking in with students regarding scholarship disbursements.
                </p>
              </div>
              <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <ArrowUpRight className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Next Milestone</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Q4 Evaluations</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Final quarter evaluations start in 12 days. Current prep-rate is at 92% across all departments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
