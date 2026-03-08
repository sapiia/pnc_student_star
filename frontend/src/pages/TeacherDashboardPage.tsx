import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  Star, 
  TrendingUp, 
  AlertCircle, 
  Smile, 
  Search, 
  Filter, 
  ChevronRight, 
  Bell,
  MoreHorizontal,
  ArrowUpRight,
  ChevronLeft
} from 'lucide-react';
import TeacherSidebar from '../components/TeacherSidebar';
import TeacherMobileNav from '../components/TeacherMobileNav';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const STATS = [
  { label: 'Class Avg Stars', value: '4.2', total: '/5.0', trend: '+2.4%', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Evaluation Rate', value: '85%', total: '', trend: '+5.1%', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/5' },
  { label: 'Needs Attention', value: '3', total: 'Students', trend: '3 New !', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
  { label: 'Overall Feeling', value: 'Positive', total: '', trend: 'Healthy', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

const STUDENTS = [
  { id: '2026-012', name: 'Dany Chan', rating: 2.1, status: 'Action Needed', lastEval: 'Yesterday, 04:15 PM', avatar: 'https://picsum.photos/seed/dany/100/100', generation: 'Gen 2026', class: 'WEB A' },
  { id: '2026-001', name: 'Sokha Mean', rating: 4.5, status: 'Healthy', lastEval: 'Today, 08:30 AM', avatar: 'https://picsum.photos/seed/sokha/100/100', generation: 'Gen 2026', class: 'WEB A' },
  { id: '2026-045', name: 'Leakna Roeun', rating: 4.0, status: 'Healthy', lastEval: 'Today, 08:45 AM', avatar: 'https://picsum.photos/seed/leakna/100/100', generation: 'Gen 2026', class: 'WEB B' },
  { id: '2026-025', name: 'Borey Van', rating: null, status: 'No Data Today', lastEval: 'Oct 23, 09:00 AM', avatar: 'https://picsum.photos/seed/borey/100/100', generation: 'Gen 2026', class: 'MOBILE A' },
  { id: '2025-001', name: 'Vicheka Long', rating: 4.8, status: 'Healthy', lastEval: 'Today, 09:00 AM', avatar: 'https://picsum.photos/seed/vicheka/100/100', generation: 'Gen 2025', class: 'WEB A' },
  { id: '2025-015', name: 'Piseth Keo', rating: 3.2, status: 'Healthy', lastEval: 'Yesterday, 02:00 PM', avatar: 'https://picsum.photos/seed/piseth/100/100', generation: 'Gen 2025', class: 'WEB A' },
];

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const [selectedGen, setSelectedGen] = useState('Gen 2026');
  const [selectedClass, setSelectedClass] = useState('WEB A');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'gen' | 'class' | null>(null);

  const gens = ['Gen 2026', 'Gen 2025', 'Gen 2024'];
  const classes = ['WEB A', 'WEB B', 'MOBILE A', 'MOBILE B'];

  const filteredStudents = STUDENTS.filter(student => {
    const matchesGen = student.generation === selectedGen;
    const matchesClass = student.class === selectedClass;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         student.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGen && matchesClass && matchesSearch;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TeacherMobileNav />
        {/* Header */}
        <header className="h-auto min-h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-2 md:py-0 flex items-center justify-between shrink-0 z-10">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">Teacher Overview</h1>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate">Monitor student well-being.</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-2">
            <div className="flex items-center gap-1 md:gap-2 bg-slate-100 p-1 rounded-xl relative scale-90 md:scale-100 origin-right">
              {/* GEN Filter */}
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'gen' ? null : 'gen')}
                  className={cn(
                    "px-2 md:px-3 py-1 md:py-1.5 rounded-lg shadow-sm text-[10px] md:text-xs font-bold transition-all whitespace-nowrap",
                    activeDropdown === 'gen' ? "bg-primary text-white" : "bg-white text-primary"
                  )}
                >
                  GEN: {selectedGen.replace('Gen ', '')}
                </button>
                <AnimatePresence>
                  {activeDropdown === 'gen' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 md:left-0 mt-2 w-32 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                    >
                      {gens.map(gen => (
                        <button 
                          key={gen}
                          onClick={() => { setSelectedGen(gen); setActiveDropdown(null); }}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                        >
                          {gen}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CLASS Filter */}
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'class' ? null : 'class')}
                  className={cn(
                    "px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap",
                    activeDropdown === 'class' ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:bg-white/50"
                  )}
                >
                  {selectedClass}
                </button>
                <AnimatePresence>
                  {activeDropdown === 'class' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 md:left-0 mt-2 w-32 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                    >
                      {classes.map(cls => (
                        <button 
                          key={cls}
                          onClick={() => { setSelectedClass(cls); setActiveDropdown(null); }}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                        >
                          {cls}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <button 
              onClick={() => navigate('/teacher/notifications')}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative shrink-0"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-[1200px] mx-auto space-y-6 md:space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS.map((stat, idx) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-2 rounded-xl", stat.bg, stat.color)}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <span className={cn("text-xs font-bold", stat.color)}>{stat.trend}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-900">
                    {stat.value}
                    {stat.total && <span className="text-sm font-medium text-slate-400 ml-1">{stat.total}</span>}
                  </h3>
                </motion.div>
              ))}
            </div>

            {/* Urgent Alert */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-100 p-4 md:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="size-10 md:size-12 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-200 shrink-0">
                  <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-900 text-sm md:text-base">Urgent Alerts</h4>
                  <p className="text-xs md:text-sm text-rose-700 leading-tight">3 students rated 'Health' below 2 stars today. 5 evaluations pending.</p>
                </div>
              </div>
              <button className="bg-rose-500 text-white px-6 py-2 md:py-2.5 rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all text-sm">
                Resolve All
              </button>
            </motion.div>

            {/* Student Performance List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-base md:text-lg font-bold text-slate-900">Student Performance List</h3>
                <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search students..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full sm:w-64"
                    />
                  </div>
                  <button className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors shrink-0">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Avg Rating</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Last Evaluation</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full overflow-hidden shrink-0">
                              <img src={student.avatar} alt={student.name} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{student.name}</p>
                              <p className="text-[10px] text-slate-400">ID: {student.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {student.rating ? (
                            <div className="flex flex-col">
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={cn("w-3 h-3 fill-current", i >= Math.floor(student.rating) && "text-slate-200 fill-slate-200")} />
                                ))}
                              </div>
                              <span className="text-xs font-bold text-slate-900 mt-1">{student.rating}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 font-bold">--</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                            student.status === 'Healthy' ? "bg-emerald-100 text-emerald-600" : 
                            student.status === 'Action Needed' ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
                          )}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">{student.lastEval}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => navigate('/teacher/students')}
                              className="px-4 py-1.5 text-xs font-bold text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
                            >
                              View Profile
                            </button>
                            <button 
                              onClick={() => navigate('/teacher/messages')}
                              className={cn(
                                "px-4 py-1.5 text-xs font-bold text-white rounded-lg shadow-sm transition-all",
                                student.status === 'Action Needed' ? "bg-rose-500 hover:bg-rose-600 shadow-rose-100" : "bg-slate-800 hover:bg-slate-900"
                              )}
                            >
                              Intervene
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 md:p-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500">Showing {filteredStudents.length} students</p>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((page) => (
                      <button 
                        key={page}
                        className={cn(
                          "size-8 rounded-lg text-xs font-bold transition-all",
                          page === 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
