import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Search, 
  Bell, 
  ChevronDown, 
  FileText, 
  TrendingUp, 
  CheckCircle2, 
  Target, 
  MessageSquare,
  ArrowUpRight,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import StarRating from '../components/StarRating';
import Sidebar from '../components/Sidebar';

const TREND_DATA = [
  { name: 'Q2 2023', score: 3.5 },
  { name: 'Q3 2023', score: 3.8 },
  { name: 'Q4 2023', score: 4.0 },
  { name: 'Q1 2024', score: 4.2 },
];

const EVALUATIONS = [
  { id: '1', title: 'Q1 2024 Evaluation', date: 'Jan 1, 2024 - Mar 31, 2024', rating: 4.8 },
  { id: '2', title: 'Q4 2023 Evaluation', date: 'Oct 1, 2023 - Dec 31, 2023', rating: 4.0 },
  { id: '3', title: 'Q3 2023 Evaluation', date: 'Jul 1, 2023 - Sep 30, 2023', rating: 3.5 },
  { id: '4', title: 'Q2 2023 Evaluation', date: 'Apr 1, 2023 - Jun 30, 2023', rating: 3.9 },
];

export default function EvaluationHistoryPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search evaluations or feedback..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && navigate('/help')}
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Evaluation History</h1>
              <p className="text-slate-500 mt-2">Track your academic and behavioral performance across all quarters. Review detailed feedback to identify areas for growth.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Trend & List */}
              <div className="lg:col-span-2 space-y-8">
                {/* Performance Trend Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Performance Trend</h3>
                      <p className="text-xs text-slate-500 mt-1">Average star rating over the last 12 months</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/10">
                      Academic Year 2023-24
                    </span>
                  </div>

                  <div className="flex items-baseline gap-4 mb-8">
                    <span className="text-5xl font-black text-slate-900">4.2</span>
                    <span className="text-slate-400 text-lg font-medium">/ 5.0</span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                      <TrendingUp className="w-3 h-3" />
                      +5.2%
                    </div>
                  </div>

                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TREND_DATA}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5d5fef" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#5d5fef" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis hide domain={[0, 5]} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#5d5fef" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorScore)" 
                          dot={{ r: 6, fill: '#fff', stroke: '#5d5fef', strokeWidth: 3 }}
                          activeDot={{ r: 8, fill: '#5d5fef', stroke: '#fff', strokeWidth: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Evaluation List Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">Evaluation List</h3>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                      Sort by: Most Recent
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {EVALUATIONS.map((evalItem, idx) => (
                      <motion.div 
                        key={evalItem.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between group hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center gap-6">
                          <div className="size-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <FileText className="w-7 h-7" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">{evalItem.title}</h4>
                            <p className="text-sm text-slate-500 mt-1">{evalItem.date}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-3">
                            <StarRating rating={evalItem.rating} starClassName="w-4 h-4" />
                            <span className="text-lg font-bold text-slate-900">{evalItem.rating}</span>
                          </div>
                          <button 
                            onClick={() => navigate('/results')}
                            className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                          >
                            View Full Report
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Summary & Insights */}
              <div className="space-y-8">
                {/* Quick Summary Card */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-primary p-8 rounded-2xl shadow-xl shadow-primary/20 text-white relative overflow-hidden"
                >
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-xl font-bold">Quick Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-primary-100 text-sm">Total Evaluations</span>
                        <span className="text-2xl font-black">12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary-100 text-sm">Highest Rating</span>
                        <span className="text-2xl font-black">4.9</span>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-primary-100 text-xs uppercase tracking-widest font-bold">Next Evaluation</span>
                          <span className="text-lg font-bold mt-1">JUL 15</span>
                        </div>
                        <div className="size-12 bg-white/10 rounded-xl flex items-center justify-center">
                          <Star className="w-6 h-6 fill-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Abstract background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl" />
                </motion.div>

                {/* Top Strengths Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="size-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Top Strengths</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-slate-700 font-medium">
                      <div className="size-2 bg-emerald-500 rounded-full" />
                      Critical Thinking
                    </li>
                    <li className="flex items-center gap-3 text-slate-700 font-medium">
                      <div className="size-2 bg-emerald-500 rounded-full" />
                      Class Participation
                    </li>
                    <li className="flex items-center gap-3 text-slate-700 font-medium">
                      <div className="size-2 bg-emerald-500 rounded-full" />
                      Collaborative Projects
                    </li>
                  </ul>
                </div>

                {/* Focus Areas Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="size-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Focus Areas</h3>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-sm text-slate-600 leading-relaxed">
                    "Focus on time management for independent study blocks and early submission of lab reports."
                  </div>
                </div>

                {/* Feedback Card */}
                <div className="bg-slate-900 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="size-12 rounded-full border-2 border-white/20 overflow-hidden">
                        <img src="https://picsum.photos/seed/teacher/100/100" alt="Mrs. Miller" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">New Feedback from Mrs. Miller</p>
                        <p className="text-sm font-bold">Excellent work on the Q1 math presentation. Your explanation of...</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-sm font-bold text-white hover:text-primary transition-colors group">
                      Read Full Message
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MessageSquare className="w-20 h-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
