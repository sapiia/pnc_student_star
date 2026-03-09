import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  Star,
  TrendingUp,
  AlertCircle,
  Smile,
  Search,
  Filter,
  ChevronRight,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import TeacherSidebar from '../components/TeacherSidebar';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useTeacherUnreadNotifications } from '../lib/useTeacherUnreadNotifications';

const STATS = [
  { label: 'Class Avg Stars', value: '4.2', total: '/5.0', trend: '+2.4%', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Evaluation Rate', value: '85%', total: '', trend: '+5.1%', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/5' },
  { label: 'Needs Attention', value: '3', total: 'Students', trend: '3 New !', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
  { label: 'Overall Feeling', value: 'Positive', total: '', trend: 'Healthy', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

const STUDENTS = [
  { id: '2026-012', name: 'Dany Chan', rating: 2.1, status: 'Action Needed', lastEval: 'Yesterday, 04:15 PM', avatar: 'https://picsum.photos/seed/dany/100/100', generation: 'Gen 2026', class: 'WebA' },
  { id: '2026-001', name: 'Sokha Mean', rating: 4.5, status: 'Healthy', lastEval: 'Today, 08:30 AM', avatar: 'https://picsum.photos/seed/sokha/100/100', generation: 'Gen 2026', class: 'WebA' },
  { id: '2026-045', name: 'Leakna Roeun', rating: 4.0, status: 'Healthy', lastEval: 'Today, 08:45 AM', avatar: 'https://picsum.photos/seed/leakna/100/100', generation: 'Gen 2026', class: 'WebB' },
  { id: '2026-030', name: 'Nary Touch', rating: 3.6, status: 'Healthy', lastEval: 'Today, 09:40 AM', avatar: 'https://picsum.photos/seed/nary/100/100', generation: 'Gen 2026', class: 'WebC' },
  { id: '2026-034', name: 'Sreynich Kim', rating: 3.2, status: 'Healthy', lastEval: 'Today, 09:25 AM', avatar: 'https://picsum.photos/seed/sreynich/100/100', generation: 'Gen 2026', class: 'WebC' },
  { id: '2027-003', name: 'Panha Koeun', rating: 4.2, status: 'Healthy', lastEval: 'Today, 10:05 AM', avatar: 'https://picsum.photos/seed/panha/100/100', generation: 'Gen 2027', class: 'ClassA' },
  { id: '2027-017', name: 'Sophea Sophorn', rating: 3.7, status: 'Healthy', lastEval: 'Today, 11:10 AM', avatar: 'https://picsum.photos/seed/sophea/100/100', generation: 'Gen 2027', class: 'ClassB' },
  { id: '2027-021', name: 'Piset Nea', rating: null, status: 'No Data Today', lastEval: 'Oct 23, 09:00 AM', avatar: 'https://picsum.photos/seed/piset/100/100', generation: 'Gen 2027', class: 'ClassA' },
  { id: '2027-024', name: 'Malis Thon', rating: 4.8, status: 'Healthy', lastEval: 'Today, 10:58 AM', avatar: 'https://picsum.photos/seed/malis/100/100', generation: 'Gen 2027', class: 'ClassC' },
  { id: '2027-031', name: 'Chanrith Oun', rating: 2.6, status: 'Action Needed', lastEval: 'Today, 09:50 AM', avatar: 'https://picsum.photos/seed/chanrith/100/100', generation: 'Gen 2027', class: 'ClassD' },
];

const GENERATION_CLASSES: Record<string, string[]> = {
  'Gen 2026': ['WebA', 'WebB', 'WebC'],
  'Gen 2027': ['ClassA', 'ClassB', 'ClassC', 'ClassD'],
};

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const unreadNotificationCount = useTeacherUnreadNotifications();
  const [selectedGen, setSelectedGen] = useState('Gen 2026');
  const [selectedClass, setSelectedClass] = useState('WebA');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'gen' | 'class' | null>(null);
  const [assessmentWindow, setAssessmentWindow] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const gens = Object.keys(GENERATION_CLASSES);
  const classes = GENERATION_CLASSES[selectedGen] ?? [];

  useEffect(() => {
    if (!classes.includes(selectedClass)) {
      setSelectedClass(classes[0] ?? '');
    }
  }, [classes, selectedClass]);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    const loadEvaluationWindow = async () => {
      try {
        const [startResponse, endResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/settings/key/next_assessment_start`),
          fetch(`${API_BASE_URL}/settings/key/next_assessment_end`),
        ]);
        const startData = await startResponse.json().catch(() => ({}));
        const endData = await endResponse.json().catch(() => ({}));
        setAssessmentWindow({
          start: startResponse.ok ? String(startData?.value || '').slice(0, 10) : '',
          end: endResponse.ok ? String(endData?.value || '').slice(0, 10) : '',
        });
      } catch {
        setAssessmentWindow({ start: '', end: '' });
      }
    };

    void loadEvaluationWindow();
    window.addEventListener('evaluation-window-updated', loadEvaluationWindow);
    return () => window.removeEventListener('evaluation-window-updated', loadEvaluationWindow);
  }, []);

  const classSummary = useMemo(() => {
    return classes.map((className) => {
      const studentsInClass = STUDENTS.filter(
        (student) => student.generation === selectedGen && student.class === className
      );
      const ratedStudents = studentsInClass.filter((student) => student.rating !== null);
      const avg =
        ratedStudents.length > 0
          ? ratedStudents.reduce((acc, student) => acc + (student.rating ?? 0), 0) / ratedStudents.length
          : 0;
      const needsAttention = studentsInClass.filter((student) => student.status === 'Action Needed').length;

      return {
        className,
        avg,
        studentsCount: studentsInClass.length,
        needsAttention,
      };
    });
  }, [classes, selectedGen]);

  const filteredStudents = STUDENTS.filter((student) => {
    const matchesGen = student.generation === selectedGen;
    const matchesClass = student.class === selectedClass;
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGen && matchesClass && matchesSearch;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Teacher Overview</h1>
            <p className="text-xs text-slate-500">Welcome back, monitor your student's daily well-being.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl relative">
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'gen' ? null : 'gen')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg shadow-sm text-xs font-bold transition-all',
                    activeDropdown === 'gen' ? 'bg-primary text-white' : 'bg-white text-primary'
                  )}
                >
                  GEN: {selectedGen}
                </button>
                <AnimatePresence>
                  {activeDropdown === 'gen' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                    >
                      {gens.map((gen) => (
                        <button
                          key={gen}
                          onClick={() => {
                            setSelectedGen(gen);
                            setActiveDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                        >
                          {gen}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'class' ? null : 'class')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                    activeDropdown === 'class' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-white/50'
                  )}
                >
                  CLASS: {selectedClass}
                </button>
                <AnimatePresence>
                  {activeDropdown === 'class' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                    >
                      {classes.map((cls) => (
                        <button
                          key={cls}
                          onClick={() => {
                            setSelectedClass(cls);
                            setActiveDropdown(null);
                          }}
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
              title="Notifications"
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 ? (
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
              ) : null}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1200px] mx-auto space-y-8">
            {assessmentWindow.start && assessmentWindow.end ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Evaluation Window</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{assessmentWindow.start} to {assessmentWindow.end}</p>
              </div>
            ) : null}
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
                    <div className={cn('p-2 rounded-xl', stat.bg, stat.color)}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <span className={cn('text-xs font-bold', stat.color)}>{stat.trend}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-900">
                    {stat.value}
                    {stat.total && <span className="text-sm font-medium text-slate-400 ml-1">{stat.total}</span>}
                  </h3>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-200">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-900">Urgent Alerts</h4>
                  <p className="text-sm text-rose-700">3 students rated 'Health' below 2 stars today. 5 evaluations pending for WE-2024.</p>
                </div>
              </div>
              <button className="bg-rose-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all">
                Resolve All
              </button>
            </motion.div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Class AVG Overview</h3>
                <p className="text-xs text-slate-500">{selectedGen}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {classSummary.map((item) => (
                  <button
                    key={item.className}
                    onClick={() => setSelectedClass(item.className)}
                    className={cn(
                      'text-left p-4 rounded-xl border transition-all',
                      selectedClass === item.className
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-slate-200 hover:border-primary/40 hover:bg-slate-50'
                    )}
                  >
                    <p className="text-sm font-bold text-slate-900">{item.className}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.studentsCount} students</p>
                    <div className="mt-3 flex items-end justify-between">
                      <p className="text-2xl font-black text-primary">{item.avg.toFixed(1)}</p>
                      <p className="text-[11px] font-bold text-rose-500">{item.needsAttention} need help</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Student Performance List - {selectedGen} / {selectedClass}</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64"
                    />
                  </div>
                  <button className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors">
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
                                  <Star
                                    key={i}
                                    className={cn('w-3 h-3 fill-current', i >= Math.floor(student.rating) && 'text-slate-200 fill-slate-200')}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-bold text-slate-900 mt-1">{student.rating}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 font-bold">--</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider',
                              student.status === 'Healthy'
                                ? 'bg-emerald-100 text-emerald-600'
                                : student.status === 'Action Needed'
                                  ? 'bg-rose-100 text-rose-600'
                                  : 'bg-slate-100 text-slate-500'
                            )}
                          >
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
                                'px-4 py-1.5 text-xs font-bold text-white rounded-lg shadow-sm transition-all',
                                student.status === 'Action Needed' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-100' : 'bg-slate-800 hover:bg-slate-900'
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

              <div className="p-6 border-t border-slate-50 flex items-center justify-between">
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
                          'size-8 rounded-lg text-xs font-bold transition-all',
                          page === 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-100'
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
