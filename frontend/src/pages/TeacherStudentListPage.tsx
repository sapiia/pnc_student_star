import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Bell,
  Settings,
  Star,
  MessageSquare,
  Send,
  ChevronLeft
} from 'lucide-react';
import TeacherSidebar from '../components/TeacherSidebar';
import { motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import RadarChart from '../components/RadarChart';

const STUDENTS = [
  { id: '2026-012', name: 'Sokhea Mean', score: '4.8 / 5.0', avatar: 'https://picsum.photos/seed/sokhea/100/100', generation: 'Gen 2026', class: 'WEB A' },
  { id: '2026-045', name: 'Vannak Chan', score: '3.2 / 5.0', avatar: 'https://picsum.photos/seed/vannak/100/100', generation: 'Gen 2026', class: 'WEB B' },
  { id: '2026-089', name: 'Rothana Seng', score: '4.2 / 5.0', avatar: 'https://picsum.photos/seed/rothana/100/100', generation: 'Gen 2026', class: 'WEB C' },
  { id: '2026-112', name: 'Borey Long', score: '2.8 / 5.0', avatar: 'https://picsum.photos/seed/borey/100/100', generation: 'Gen 2026', class: 'WEB A' },
  { id: '2027-001', name: 'Dara Som', score: '4.5 / 5.0', avatar: 'https://picsum.photos/seed/dara/100/100', generation: 'Gen 2027', class: 'WEB A' },
  { id: '2027-002', name: 'Srey Leak', score: '3.9 / 5.0', avatar: 'https://picsum.photos/seed/leak/100/100', generation: 'Gen 2027', class: 'WEB B' },
  { id: '2027-003', name: 'Piseth Keo', score: '4.1 / 5.0', avatar: 'https://picsum.photos/seed/piseth/100/100', generation: 'Gen 2027', class: 'WEB C' },
  { id: '2027-004', name: 'Maly Van', score: '3.5 / 5.0', avatar: 'https://picsum.photos/seed/maly/100/100', generation: 'Gen 2027', class: 'WEB D' },
];

const GENERATIONS = ['Gen 2026', 'Gen 2027'];
const CLASSES_BY_GEN: Record<string, string[]> = {
  'Gen 2026': ['WEB A', 'WEB B', 'WEB C'],
  'Gen 2027': ['WEB A', 'WEB B', 'WEB C', 'WEB D'],
};

const RADAR_DATA = [
  { subject: 'Communication', value: 90 },
  { subject: 'Coding Logic', value: 95 },
  { subject: 'Independence', value: 85 },
  { subject: 'Teamwork', value: 80 },
  { subject: 'Soft Skills', value: 75 },
];

const RADAR_KEYS = [
  { key: 'value', name: 'Performance', color: '#5d5fef', fill: '#5d5fef' },
];

export default function TeacherStudentListPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState('2026-012');
  const [selectedGen, setSelectedGen] = useState('Gen 2026');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = STUDENTS.filter(student => {
    const matchesGen = student.generation === selectedGen;
    const matchesClass = selectedClass === 'All Classes' || student.class === selectedClass;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         student.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGen && matchesClass && matchesSearch;
  });

  const selectedStudent = STUDENTS.find(s => s.id === selectedId) || filteredStudents[0];

  const handleGenChange = (gen: string) => {
    setSelectedGen(gen);
    setSelectedClass('All Classes');
  };

  const clearFilters = () => {
    setSelectedGen('Gen 2026');
    setSelectedClass('All Classes');
    setSearchQuery('');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={() => navigate('/teacher/dashboard')} className="hover:text-primary">Home</button>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-slate-900">Students</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search ID or Name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
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
          <div className="max-w-[1400px] mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Feedback Management</h1>
              <p className="text-slate-500 mt-2">View student performance and provide qualitative feedback for growth.</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column: Student List */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <select 
                      value={selectedGen}
                      onChange={(e) => handleGenChange(e.target.value)}
                      className="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-primary/10"
                    >
                      {GENERATIONS.map(gen => (
                        <option key={gen} value={gen}>{gen}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select 
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="All Classes">All Classes</option>
                      {CLASSES_BY_GEN[selectedGen].map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <button 
                    onClick={clearFilters}
                    className="text-sm font-bold text-primary hover:underline ml-auto"
                  >
                    Clear all filters
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                        <th className="px-6 py-4">Student ID</th>
                        <th className="px-6 py-4">Full Name</th>
                        <th className="px-6 py-4">Avg Score</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredStudents.map((student) => (
                        <tr 
                          key={student.id} 
                          className={cn(
                            "group transition-all cursor-pointer",
                            selectedId === student.id ? "bg-primary/5" : "hover:bg-slate-50/50"
                          )}
                          onClick={() => setSelectedId(student.id)}
                        >
                          <td className="px-6 py-5 text-sm font-medium text-slate-500">{student.id}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full overflow-hidden shrink-0">
                                <img src={student.avatar} alt={student.name} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900">{student.name}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{student.generation} • {student.class}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={cn(
                              "text-xs font-bold px-2.5 py-1 rounded-lg",
                              parseFloat(student.score) >= 4 ? "bg-emerald-50 text-emerald-600" : 
                              parseFloat(student.score) >= 3 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                            )}>
                              {student.score}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <button className={cn(
                              "text-xs font-bold transition-colors",
                              selectedId === student.id ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                            )}>
                              {selectedId === student.id ? 'Selected' : 'Give Feedback'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                            No students found matching the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="p-4 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400">Showing {filteredStudents.length} of {STUDENTS.length} students</p>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
                      <button className="p-1.5 bg-primary text-white rounded-lg"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Performance Overview & Feedback */}
              <div className="w-full lg:w-[450px] shrink-0">
                <motion.div 
                  layout
                  key={selectedId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden sticky top-8"
                >
                  <div className="p-8 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black text-slate-900">Performance Overview</h3>
                      <div className="size-12 rounded-2xl overflow-hidden border-2 border-primary/20">
                        <img src={selectedStudent?.avatar} alt={selectedStudent?.name} />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Selected Student</p>
                    <h4 className="text-lg font-bold text-slate-900">{selectedStudent?.name} ({selectedStudent?.id})</h4>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="h-64 flex items-center justify-center">
                      <RadarChart data={RADAR_DATA} dataKeys={RADAR_KEYS} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {['Communication', 'Coding Logic', 'Teamwork', 'Independence'].map((skill) => (
                        <div key={skill} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{skill}</p>
                          <div className="flex text-primary">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={cn("w-3 h-3 fill-current", i >= 4 && "text-slate-200 fill-slate-200")} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-900">Teacher's Qualitative Feedback</h4>
                      <textarea 
                        rows={5}
                        placeholder="Write your feedback here..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none"
                        defaultValue={`${selectedStudent?.name} has shown exceptional improvement in algorithmic thinking this semester. She successfully led her team's project repository and...`}
                      />
                    </div>

                    <button className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" />
                      Submit Feedback
                    </button>
                    <p className="text-center text-[10px] text-slate-400">Last updated: 2 days ago by Prof. Samrith</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
