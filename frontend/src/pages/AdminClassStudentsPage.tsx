import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Trash2, 
  UserPlus,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar,
  Tooltip
} from 'recharts';
import AdminSidebar from '../components/AdminSidebar';
import { cn } from '../lib/utils';
import { CRITERIA } from '../constants';

// Mock data for students in different classes
const MOCK_STUDENTS: Record<string, any[]> = {
  'Gen 2026-WEB A': [
    { id: 1, name: 'John Doe', email: 'john.doe@pnc.edu', status: 'Active', gender: 'M', gpa: '3.8', attendance: '98%', scores: [85, 90, 75, 80, 85, 70, 95, 88] },
    { id: 2, name: 'Alice Smith', email: 'alice.smith@pnc.edu', status: 'Active', gender: 'F', gpa: '3.9', attendance: '95%', scores: [92, 85, 80, 88, 90, 75, 85, 92] },
  ],
  'Gen 2026-MOBILE A': [
    { id: 50, name: 'Sok Dara', email: 'sok.dara@pnc.edu', status: 'Active', gender: 'M', gpa: '3.7', attendance: '96%', scores: [80, 85, 90, 75, 88, 82, 78, 85] },
    { id: 51, name: 'Keo Sophea', email: 'keo.sophea@pnc.edu', status: 'Active', gender: 'F', gpa: '4.0', attendance: '100%', scores: [95, 98, 92, 90, 96, 94, 92, 98] },
  ],
  'Gen 2027-Class A': [
    { id: 101, name: 'Amin Pisal', email: 'amin.pisal@pnc.edu', status: 'Active', gender: 'M', gpa: 'N/A', attendance: '100%', scores: [78, 82, 85, 80, 75, 88, 90, 85] },
    { id: 102, name: 'Chan Setha', email: 'chan.setha@pnc.edu', status: 'Active', gender: 'M', gpa: 'N/A', attendance: '99%', scores: [85, 88, 82, 75, 80, 85, 88, 90] },
    { id: 103, name: 'Chan Koemsour', email: 'chan.koemsour@pnc.edu', status: 'Active', gender: 'F', gpa: 'N/A', attendance: '97%', scores: [90, 85, 80, 88, 92, 85, 82, 88] },
  ],
};

export default function AdminClassStudentsPage() {
  const { generation, className } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [students, setStudents] = useState<any[]>(() => {
    const key = `${generation}-${className}`;
    return MOCK_STUDENTS[key] || [
      { id: 999, name: 'Sample Student', email: 'sample@pnc.edu', status: 'Active', gender: 'M', gpa: '3.5', attendance: '90%', scores: [70, 75, 80, 85, 90, 85, 80, 75] }
    ];
  });

  const confirmDelete = () => {
    if (studentToDelete) {
      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      if (selectedStudent?.id === studentToDelete.id) {
        setSelectedStudent(null);
      }
      setStudentToDelete(null);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900">{generation} - {className}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student List</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Add Student
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden p-8">
            <div className="max-w-6xl mx-auto w-full space-y-6 flex flex-col h-full">
              {/* Search & Filter */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search students..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all outline-none"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Gender</th>
                        <th className="px-6 py-4">GPA</th>
                        <th className="px-6 py-4">Attendance</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                                {student.name.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900">{student.name}</p>
                                <p className="text-[10px] font-bold text-slate-400">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-slate-600">{student.gender}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-slate-600">{student.gpa}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-slate-600">{student.attendance}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                              {student.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setSelectedStudent(student)}
                                className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setStudentToDelete(student)}
                                className="p-2 text-slate-400 hover:text-rose-500 transition-colors hover:bg-rose-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Showing {filteredStudents.length} students
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <AnimatePresence>
            {selectedStudent && (
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col shrink-0 relative z-20"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black text-slate-900">Student Details</h3>
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Profile Header */}
                  <div className="text-center">
                    <div className="size-24 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-black mx-auto mb-4">
                      {selectedStudent.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <h4 className="text-xl font-black text-slate-900">{selectedStudent.name}</h4>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">{generation} - {className}</p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 text-slate-400 mb-1">
                        <Mail className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Email Address</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{selectedStudent.email}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 text-slate-400 mb-1">
                        <Phone className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Phone Number</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">+855 12 345 678</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 text-slate-400 mb-1">
                        <MapPin className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Address</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">Phnom Penh, Cambodia</p>
                    </div>
                  </div>

                  {/* Academic Stats */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Performance</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                        <p className="text-2xl font-black text-emerald-600">{selectedStudent.gpa}</p>
                        <p className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest">Current GPA</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                        <p className="text-2xl font-black text-blue-600">{selectedStudent.attendance}</p>
                        <p className="text-[9px] font-bold text-blue-600/60 uppercase tracking-widest">Attendance</p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Radar */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Development Radar</h5>
                      <div className="size-6 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="h-[240px] w-full bg-slate-50 rounded-3xl border border-slate-100 p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={CRITERIA.map((c, i) => ({
                          subject: c.label,
                          score: selectedStudent.scores[i] || 0,
                          fullMark: 100
                        }))}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 8, fontWeight: 600 }} />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#5d5fef"
                            strokeWidth={2}
                            fill="#5d5fef"
                            fillOpacity={0.2}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t border-slate-100 flex gap-3">
                    <button 
                      onClick={() => setStudentToDelete(selectedStudent)}
                      className="w-full py-3 bg-rose-50 text-rose-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Student
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {studentToDelete && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setStudentToDelete(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8 text-center">
                  <div className="size-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Delete Student?</h3>
                  <p className="text-sm text-slate-500 font-bold leading-relaxed">
                    Are you sure you want to delete <span className="text-slate-900 font-black">{studentToDelete.name}</span>? 
                    This action cannot be undone and all associated data will be permanently removed.
                  </p>
                </div>
                <div className="p-6 bg-slate-50 flex gap-3">
                  <button 
                    onClick={() => setStudentToDelete(null)}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 py-3 bg-rose-500 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                  >
                    Confirm Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
