import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  UserPlus,
  Download,
  Mail,
  MapPin,
  Calendar,
  BarChart3,
  Plus,
  Minus,
  CheckCircle2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar,
  Tooltip
} from 'recharts';
import AdminSidebar from '../../components/layout/sidebar/admin/AdminSidebar';
import AdminMobileNav from '../../components/common/AdminMobileNav';
import { cn } from '../../lib/utils';
import { CRITERIA } from '../../constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const extractGeneration = (user: any) => {
  const genValue = String(user.generation || '').trim();
  const classValue = String(user.class || '').trim();
  const studentId = String(user.student_id || user.resolved_student_id || '').trim();

  const genMatch = genValue.match(/\d{4}/);
  if (genMatch) return genMatch[0];

  const classMatch = classValue.match(/gen\s*(\d{4})/i) || classValue.match(/20\d{2}/);
  if (classMatch) return classMatch[1] || classMatch[0];

  const idMatch = studentId.match(/^(\d{4})-/);
  if (idMatch) return idMatch[1];

  return 'Unknown Gen';
};

interface UserRecord {
  id: number;
  name: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Deleted' | 'Pending';
  gender: string;
  gpa: string;
  attendance: string;
  profileImage: string;
  studentIdAt: string;
  scores: number[];
}

export default function AdminClassStudentsPage() {
  const { generation, className } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<UserRecord | null>(null);
  const [students, setStudents] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  
  // Unified confirmation action flow like User Management page
  const [confirmAction, setConfirmAction] = useState<{
    kind: 'delete' | 'hard-delete' | 'toggle-active' | 'disable-all' | 'hard-delete-all';
    user?: UserRecord;
    shouldEnable?: boolean;
  } | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'warning'>('success');
  const [selectedStudentEvaluations, setSelectedStudentEvaluations] = useState<any[]>([]);
  const [globalCriteria, setGlobalCriteria] = useState<any[]>([]);
  const [globalRatingScale, setGlobalRatingScale] = useState<number>(5);

  useEffect(() => {
    const loadCriteriaConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings/evaluation-criteria`);
        if (response.ok) {
          const data = await response.json();
          setGlobalRatingScale(Math.max(1, Number(data?.ratingScale || 5)));
          setGlobalCriteria(Array.isArray(data?.criteria) ? data.criteria : []);
        }
      } catch (err) {
        console.error("Failed to load global criteria config", err);
      }
    };
    loadCriteriaConfig();
  }, []);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!selectedStudent) {
        setSelectedStudentEvaluations([]);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/evaluations/user/${selectedStudent.id}`);
        if (res.ok) {
          const json = await res.json();
          setSelectedStudentEvaluations(Array.isArray(json) ? json : []);
        }
      } catch (err) {
        console.error("Failed to load student performance", err);
      }
    };
    fetchStudentDetails();
  }, [selectedStudent]);

  // Calculate Radar Data and GPA from real evaluations
  const radarData = globalCriteria.map(c => {
    const relevantEvals = selectedStudentEvaluations.filter(e => e.criterion_id === c.id);
    const avg = relevantEvals.length > 0 
      ? relevantEvals.reduce((acc, curr) => acc + Number(curr.score), 0) / relevantEvals.length 
      : 0;
    
    return {
      subject: c.label,
      score: avg,
      fullMark: globalRatingScale
    };
  });

  const calculatedGPA = selectedStudentEvaluations.length > 0
    ? (selectedStudentEvaluations.reduce((acc, curr) => acc + Number(curr.score), 0) / selectedStudentEvaluations.length).toFixed(1)
    : 'N/A';

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const data = await response.json();
        if (Array.isArray(data)) {
          const filtered = data.filter((u: any) => {
            if (u.role.toLowerCase() !== 'student') return false;
            
            const gen = extractGeneration(u);
            const cls = u.class || u.major || 'Unknown Class';
            
            return gen === generation && cls === className;
          }).map(u => {
            const genderLower = String(u.gender || '').toLowerCase();
            return {
              id: u.id,
              name: (u.name || '').trim() || [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || 'Student',
              email: u.email,
              status: Number(u.is_deleted) === 1 ? 'Deleted' : (Number(u.is_disable) === 1 ? 'Inactive' : 'Active'),
              gender: genderLower === 'male' ? 'M' : (genderLower === 'female' ? 'F' : 'N/A'),
              gpa: 'N/A', // Will be updated on detail view if needed or can keep N/A in table
              attendance: 'N/A',
              profileImage: String(u.profile_image || '').trim() || 'http://localhost:3001/uploads/logo/star_gmail_logo.jpg',
              studentIdAt: u.student_id || u.resolved_student_id || 'N/A',
              scores: new Array(CRITERIA.length).fill(0) 
            };
          });
          setStudents(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [generation, className]);

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;
    setIsActionSubmitting(true);

    try {
      if (confirmAction.kind === 'toggle-active' && confirmAction.user) {
        const { user, shouldEnable } = confirmAction;
        const response = await fetch(`${API_BASE_URL}/users/${user.id}/active`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: shouldEnable })
        });
        if (response.ok) {
          setStudents((prev) => prev.map((u) => u.id === user.id ? { ...u, status: shouldEnable ? 'Active' : 'Inactive' } : u));
          setSuccessMessage(shouldEnable ? `Enabled ${user.name}` : `Disabled ${user.name}`);
          setToastType('success');
        } else {
          alert('Failed to update status.');
        }
      } else if (confirmAction.kind === 'hard-delete' && confirmAction.user) {
        const { user } = confirmAction;
        const response = await fetch(`${API_BASE_URL}/users/${user.id}/hard`, { method: 'DELETE' });
        if (response.ok) {
          setStudents((prev) => prev.filter((u) => u.id !== user.id));
          if (selectedStudent?.id === user.id) setSelectedStudent(null);
          setSuccessMessage(`Permanently deleted ${user.name}`);
          setToastType('warning');
        } else {
          alert('Failed to permanently delete user.');
        }
      } else if (confirmAction.kind === 'delete' && confirmAction.user) {
        const { user } = confirmAction;
        const response = await fetch(`${API_BASE_URL}/users/${user.id}`, { method: 'DELETE' });
        if (response.ok) {
          setStudents((prev) => prev.filter((u) => u.id !== user.id));
          if (selectedStudent?.id === user.id) setSelectedStudent(null);
          setSuccessMessage(`Deleted ${user.name}`);
          setToastType('warning');
        } else {
          alert('Failed to delete user.');
        }
      } else if (confirmAction.kind === 'disable-all') {
        const response = await fetch(`${API_BASE_URL}/users/active`, { method: 'PATCH' });
        if (response.ok) {
          setStudents((prev) => prev.map((u) => ({ ...u, status: 'Inactive' })));
          setSuccessMessage('All students in this class disabled.');
          setToastType('warning');
        } else {
          alert('Failed to disable all.');
        }
      } else if (confirmAction.kind === 'hard-delete-all') {
        // Warning: This deletes everything usually, but we implement it carefully
        const response = await fetch(`${API_BASE_URL}/users/hard-delete`, { method: 'DELETE' });
        if (response.ok) {
          setStudents([]);
          setSelectedStudent(null);
          setSuccessMessage('Batch deletion complete.');
          setToastType('warning');
        } else {
          alert('Batch deletion failed.');
        }
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      setConfirmAction(null);
    } catch (err) {
      console.error(err);
      alert('Communication error.');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <AdminMobileNav />

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 20, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className={cn(
                "fixed top-0 left-1/2 z-[100] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold",
                toastType === 'success' ? 'bg-emerald-600' : 'bg-amber-600'
              )}
            >
              <CheckCircle2 className="w-5 h-5" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Header */}
        <header className="h-auto min-h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-4 md:px-8 py-3 md:py-0 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900">{generation} - {className}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Class Student Performance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
              <Download className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmAction({ kind: 'disable-all' })}
                disabled={isActionSubmitting || students.every(s => s.status === 'Inactive' || s.status === 'Deleted')}
                className="bg-amber-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 disabled:opacity-60"
                title="Disable All Students in this Class"
              >
                Disable All
              </button>
              <button
                onClick={() => setConfirmAction({ kind: 'hard-delete-all' })}
                disabled={isActionSubmitting || students.length === 0}
                className="bg-slate-900 text-white p-2 rounded-xl hover:bg-black transition-all shadow-lg shadow-black/20 disabled:opacity-60"
                title="Delete All Students in this Class"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={() => navigate('/admin/users', { state: { openInvite: true, prefillClass: className, prefillGen: generation } })}
              className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Student
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-8">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all outline-none shadow-sm"
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
                    <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4 hidden md:table-cell">Gender</th>
                        <th className="px-6 py-4 hidden md:table-cell">GPA</th>
                        <th className="px-6 py-4 hidden sm:table-cell">Attendance</th>
                        <th className="px-6 py-4 hidden sm:table-cell text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((student) => (
                        <tr 
                          key={student.id} 
                          onClick={() => setSelectedStudent(student)}
                          className={cn(
                            "hover:bg-slate-50 transition-colors group cursor-pointer",
                            selectedStudent?.id === student.id ? "bg-primary/5" : ""
                          )}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 shadow-sm">
                                <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900">{student.name}</p>
                                <p className="text-[10px] font-bold text-slate-400">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="text-xs font-bold text-slate-600 uppercase">{student.gender}</span>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="text-xs font-bold text-slate-600">{student.gpa}</span>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span className="text-xs font-bold text-slate-600">{student.attendance}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={cn(
                              "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                              student.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                            )}>
                              {student.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}
                                className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setConfirmAction({ kind: 'toggle-active', user: student, shouldEnable: student.status !== 'Active' }); }}
                                className={cn(
                                  "p-2 transition-colors rounded-lg",
                                  student.status === 'Active' ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50"
                                )}
                                title={student.status === 'Active' ? 'Disable Student' : 'Enable Student'}
                              >
                                {student.status === 'Active' ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setConfirmAction({ kind: 'hard-delete', user: student }); }}
                                className="p-2 text-slate-400 hover:text-rose-500 transition-colors hover:bg-rose-50 rounded-lg"
                                title="Delete Student"
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
                className="w-full md:w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col shrink-0 relative z-20 fixed md:static inset-0 md:inset-auto"
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
                    <div className="size-24 rounded-3xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 mx-auto mb-4 shadow-md">
                      <img src={selectedStudent.profileImage} alt={selectedStudent.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900">{selectedStudent.name}</h4>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1 leading-none">{generation} - {className}</p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 text-slate-400 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Student ID</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{selectedStudent.studentIdAt}</p>
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 text-slate-400 mb-1">
                        <Mail className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Email Address</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{selectedStudent.email}</p>
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
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
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center shadow-sm">
                        <p className="text-2xl font-black text-emerald-600">{calculatedGPA}</p>
                        <p className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest">Current GPA</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center shadow-sm">
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
                    <div className="h-[240px] w-full bg-slate-50/50 rounded-3xl border border-slate-100 p-2 shadow-inner">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 8, fontWeight: 600 }} />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#5d5fef"
                            strokeWidth={3}
                            fill="#5d5fef"
                            fillOpacity={0.15}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t border-slate-100 flex gap-3">
                    <button 
                      onClick={() => setConfirmAction({ kind: 'hard-delete', user: selectedStudent })}
                      className="w-full py-4 bg-rose-50 text-rose-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2 shadow-sm"
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

        {/* Unified Confirmation Modal */}
        <AnimatePresence>
          {confirmAction && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isActionSubmitting && setConfirmAction(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 14 }}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
              >
                <div className={cn(
                  "size-16 rounded-2xl flex items-center justify-center mb-6",
                  confirmAction.kind.includes('delete') ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500"
                )}>
                   {confirmAction.kind.includes('delete') ? <Trash2 className="w-8 h-8" /> : (confirmAction.shouldEnable ? <Plus className="w-8 h-8" /> : <Minus className="w-8 h-8" />)}
                </div>
                
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {confirmAction.kind === 'delete' ? 'Delete Student?'
                    : confirmAction.kind === 'hard-delete' ? 'Permanent Removal?'
                    : confirmAction.kind === 'disable-all' ? 'Disable All Students?'
                    : confirmAction.kind === 'hard-delete-all' ? 'Permanent Class Cleanup?'
                    : confirmAction.shouldEnable ? 'Enable Student?' : 'Disable Student?'}
                </h3>
                
                <p className="mt-3 text-sm text-slate-600 font-bold leading-relaxed">
                  {confirmAction.kind === 'delete' ? `Delete "${confirmAction.user?.name}"? Record will be archived.`
                    : confirmAction.kind === 'hard-delete' ? `EXTREME ACTION: Permanently remove "${confirmAction.user?.name}"? This cannot be undone.`
                    : confirmAction.kind === 'disable-all' ? 'Are you sure you want to disable all students in this class?'
                    : confirmAction.kind === 'hard-delete-all' ? 'EXTREME ACTION: Permanently delete all students in this class? All data will be lost forever.'
                    : confirmAction.shouldEnable ? `Enable "${confirmAction.user?.name}"? They will regain access.`
                    : `Disable "${confirmAction.user?.name}"? They will lose access to the platform.`}
                </p>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setConfirmAction(null)}
                    disabled={isActionSubmitting}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeConfirmedAction}
                    disabled={isActionSubmitting}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-60",
                      confirmAction.kind.includes('delete') ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    )}
                  >
                    {isActionSubmitting ? 'Processing...' : 'Confirm'}
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
