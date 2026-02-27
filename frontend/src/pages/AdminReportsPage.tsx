import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Download, 
  Calendar,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  BookOpen,
  Search,
  ChevronRight,
  User
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import AdminSidebar from '../components/AdminSidebar';
import { cn } from '../lib/utils';
import { CRITERIA } from '../constants';

// Mock Data for hierarchical reporting
const GENERATIONS = ['Gen 2026', 'Gen 2027'];
const CLASSES: Record<string, string[]> = {
  'Gen 2026': ['WEB A', 'WEB B', 'MOBILE A', 'MOBILE B'],
  'Gen 2027': ['Class A', 'Class B', 'Class C', 'Class D'],
};

const MOCK_STUDENTS: Record<string, any[]> = {
  'Gen 2026-WEB A': [
    { id: 1, name: 'John Doe', scores: [85, 90, 75, 80, 85, 70, 95, 88] },
    { id: 2, name: 'Alice Smith', scores: [92, 85, 80, 88, 90, 75, 85, 92] },
  ],
  'Gen 2027-Class A': [
    { id: 101, name: 'Amin Pisal', scores: [78, 82, 85, 80, 75, 88, 90, 85] },
    { id: 102, name: 'Chan Setha', scores: [85, 88, 82, 75, 80, 85, 88, 90] },
  ],
};

const getAverageScores = (scoresList: number[][]) => {
  if (scoresList.length === 0) return CRITERIA.map(c => ({ subject: c.label, score: 0 }));
  const sums = new Array(CRITERIA.length).fill(0);
  scoresList.forEach(scores => {
    scores.forEach((s, i) => { sums[i] += s; });
  });
  return CRITERIA.map((c, i) => ({
    subject: c.label,
    score: Math.round(sums[i] / scoresList.length),
    fullMark: 100
  }));
};

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'teachers'>('overview');
  
  // Student Report State
  const [selectedGen, setSelectedGen] = useState<string | 'All'>('All');
  const [selectedClass, setSelectedClass] = useState<string | 'All'>('All');
  const [selectedStudentId, setSelectedStudentId] = useState<number | 'All'>('All');

  // Derived Data for Student Reports
  const currentReportData = useMemo(() => {
    let allScores: number[][] = [];
    
    if (selectedGen === 'All') {
      // All Generations
      Object.values(MOCK_STUDENTS).forEach(classStudents => {
        classStudents.forEach(s => allScores.push(s.scores));
      });
    } else if (selectedClass === 'All') {
      // Specific Generation, All Classes
      Object.entries(MOCK_STUDENTS).forEach(([key, classStudents]) => {
        if (key.startsWith(selectedGen)) {
          classStudents.forEach(s => allScores.push(s.scores));
        }
      });
    } else if (selectedStudentId === 'All') {
      // Specific Class, All Students
      const key = `${selectedGen}-${selectedClass}`;
      (MOCK_STUDENTS[key] || []).forEach(s => allScores.push(s.scores));
    } else {
      // Specific Student
      const key = `${selectedGen}-${selectedClass}`;
      const student = (MOCK_STUDENTS[key] || []).find(s => s.id === selectedStudentId);
      if (student) allScores.push(student.scores);
    }

    return getAverageScores(allScores);
  }, [selectedGen, selectedClass, selectedStudentId]);

  const studentList = useMemo(() => {
    if (selectedGen === 'All' || selectedClass === 'All') return [];
    return MOCK_STUDENTS[`${selectedGen}-${selectedClass}`] || [];
  }, [selectedGen, selectedClass]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-xl font-black text-slate-900">Visual Reports</h1>
              <p className="text-xs text-slate-500 font-bold">Comprehensive performance analytics.</p>
            </div>
            
            <nav className="flex bg-slate-100 p-1 rounded-xl">
              {(['overview', 'students', 'teachers'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'students' ? (
              <motion.div 
                key="student-reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Filters */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generation</label>
                    <select 
                      value={selectedGen}
                      onChange={(e) => {
                        setSelectedGen(e.target.value);
                        setSelectedClass('All');
                        setSelectedStudentId('All');
                      }}
                      className="block w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="All">All Generations</option>
                      {GENERATIONS.map(gen => <option key={gen} value={gen}>{gen}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</label>
                    <select 
                      disabled={selectedGen === 'All'}
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setSelectedStudentId('All');
                      }}
                      className="block w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    >
                      <option value="All">All Classes</option>
                      {selectedGen !== 'All' && CLASSES[selectedGen].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</label>
                    <select 
                      disabled={selectedClass === 'All'}
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                      className="block w-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    >
                      <option value="All">All Students</option>
                      {studentList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedGen('All');
                      setSelectedClass('All');
                      setSelectedStudentId('All');
                    }}
                    className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>

                {/* Performance Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">
                          {selectedStudentId !== 'All' ? 'Individual Performance' : 
                           selectedClass !== 'All' ? `Class ${selectedClass} Performance` :
                           selectedGen !== 'All' ? `${selectedGen} Performance` : 'Overall Student Performance'}
                        </h3>
                        <p className="text-xs text-slate-500 font-bold">Detailed breakdown by criteria</p>
                      </div>
                      <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={currentReportData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="subject" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                          />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="score" fill="#5d5fef" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-8">Radar Analysis</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={currentReportData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#5d5fef"
                            strokeWidth={3}
                            fill="#5d5fef"
                            fillOpacity={0.2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-8 space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Insights</h4>
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-700">Strongest Area</p>
                        <p className="text-sm font-black text-emerald-900 mt-1">
                          {currentReportData.reduce((prev, curr) => prev.score > curr.score ? prev : curr).subject}
                        </p>
                      </div>
                      <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                        <p className="text-xs font-bold text-rose-700">Growth Opportunity</p>
                        <p className="text-sm font-black text-rose-900 mt-1">
                          {currentReportData.reduce((prev, curr) => prev.score < curr.score ? prev : curr).subject}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'teachers' ? (
              <motion.div 
                key="teacher-reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Teacher reporting content (from previous version) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6">Evaluation Status</h3>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Completed', value: 78, color: '#5d5fef' },
                              { name: 'In Progress', value: 15, color: '#fbbf24' },
                              { name: 'Not Started', value: 7, color: '#f43f5e' },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={8}
                            dataKey="value"
                          >
                            {[
                              { color: '#5d5fef' },
                              { color: '#fbbf24' },
                              { color: '#f43f5e' },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-8">Top Performing Teachers</h3>
                    <div className="space-y-6">
                      {[
                        { name: 'Mrs. Miller', dept: 'Math', rating: 4.9, reviews: 124 },
                        { name: 'Mr. Johnson', dept: 'Science', rating: 4.8, reviews: 98 },
                        { name: 'Ms. Davis', dept: 'English', rating: 4.7, reviews: 112 },
                      ].map((teacher, idx) => (
                        <div key={teacher.name} className="flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{teacher.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{teacher.dept} Department</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900">{teacher.rating}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Rating</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900">{teacher.reviews}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evaluations</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="overview-reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Overview Stats (from previous version) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <span className="text-emerald-600 text-[10px] font-black flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        +4.2%
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Student Score</p>
                    <p className="text-3xl font-black text-slate-900">4.25 <span className="text-sm text-slate-400 font-medium">/ 5.0</span></p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <span className="text-emerald-600 text-[10px] font-black flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        +12%
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Teacher Completion</p>
                    <p className="text-3xl font-black text-slate-900">92.4%</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Target className="w-5 h-5" />
                      </div>
                      <span className="text-rose-600 text-[10px] font-black flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3" />
                        -2.1%
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Evaluations</p>
                    <p className="text-3xl font-black text-slate-900">48</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-slate-900">Performance Trend</h3>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-primary" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Student Avg</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { month: 'Sep', studentAvg: 3.8 },
                        { month: 'Oct', studentAvg: 4.0 },
                        { month: 'Nov', studentAvg: 4.2 },
                        { month: 'Dec', studentAvg: 4.1 },
                        { month: 'Jan', studentAvg: 4.3 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                        <Line type="monotone" dataKey="studentAvg" stroke="#5d5fef" strokeWidth={4} dot={{ r: 6, fill: '#fff', stroke: '#5d5fef', strokeWidth: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
