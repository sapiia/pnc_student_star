import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Activity, 
  Search, 
  Bell, 
  Plus, 
  Edit2, 
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowUpDown,
  Filter,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

import AdminSidebar from '../../components/layout/sidebar/admin/AdminSidebar';
import AdminMobileNav from '../../components/common/AdminMobileNav';

import { cn } from '../../lib/utils';
import { DEFAULT_AVATAR } from '../../lib/api';

// Helper function to extract generation from user data
const normalizeClassLabel = (value: string) =>
  value
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();

const splitNameParts = (fullName: string) => {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ')
  };
};

const extractClassLabel = (value: string) => {
  const match = String(value || '').match(/Class\s+(.+)$/i);
  return match ? match[1].trim() : String(value || '').trim();
};

const buildStudentClassLabel = (generation: string, major: string, className: string) => {
  const gen = String(generation || '').trim();
  if (!gen) return className || '';
  const majorValue = String(major || '').trim();
  const classValue = String(className || '').trim();
  return `Gen ${gen}${majorValue ? ` - ${majorValue}` : ''}${classValue ? ` - Class ${classValue}` : ''}`;
};

const extractGeneration = (user: any) => {
  const classText = String(user.class || '').trim();
  // Try to extract 4-digit year from class like "Gen 2026 - WEB A" or "2026-WEB-A"
  const yearMatch = classText.match(/(\d{4})/);
  if (yearMatch) {
    return yearMatch[1];
  }
  // Try to get from generation field if exists
  if (user.generation) {
    return String(user.generation);
  }
  // Default
  return 'Unknown Gen';
};

const STUDENT_STATS = {
  total: '1,349',
  gen2026: {
    total: 620,
    classes: [
      { name: 'WEB A', count: 155 },
      { name: 'WEB B', count: 155 },
      { name: 'MOBILE A', count: 155 },
      { name: 'MOBILE B', count: 155 },
    ]
  },
  gen2027: {
    total: 101,
    classes: [
      { name: 'Class A', count: 26 },
      { name: 'Class B', count: 25 },
      { name: 'Class C', count: 25 },
      { name: 'Class D', count: 25 },
    ]
  }
};

const RECENT_USERS = [
  { id: 101, name: 'Amin Pisal', email: 'amin.pisal@pnc.edu', role: 'Student', group: 'Gen 2027 - Class A', status: 'Active', initials: 'AP', color: 'bg-blue-100 text-blue-700' },
  { id: 127, name: 'Ang Thyda', email: 'ang.thyda@pnc.edu', role: 'Student', group: 'Gen 2027 - Class B', status: 'Active', initials: 'AT', color: 'bg-indigo-100 text-indigo-700' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@pnc.edu', role: 'Teacher', group: 'Science Dept', status: 'Active', initials: 'JS', color: 'bg-purple-100 text-purple-700' },
  { id: 152, name: 'Chhoun Sakraech', email: 'chhoun.sakraech@pnc.edu', role: 'Student', group: 'Gen 2027 - Class C', status: 'Active', initials: 'CS', color: 'bg-emerald-100 text-emerald-700' },
];

const SYSTEM_ACTIVITY = [
  { id: 1, type: 'success', message: 'Evaluation period opened', time: '2 hours ago', icon: CheckCircle2 },
  { id: 2, type: 'info', message: '24 new student accounts created', time: '5 hours ago', icon: Users },
  { id: 3, type: 'warning', message: 'Backup completed successfully', time: 'Yesterday, 11:45 PM', icon: Activity },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [studentStats, setStudentStats] = useState<any>(null);
  const [teacherCount, setTeacherCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('generation');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [generationActionLoading, setGenerationActionLoading] = useState<Record<string, boolean>>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editError, setEditError] = useState('');
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editUser, setEditUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Student',
    gender: 'male',
    generation: '',
    major: '',
    className: '',
    studentId: ''
  });
  const PENDING_PAGE_SIZE = 5;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users?sortBy=${sortBy}&sortOrder=${sortOrder}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          const students = data.filter((u: any) => u.role.toLowerCase() === 'student');
          const teachers = data.filter((u: any) => u.role.toLowerCase() === 'teacher');
          const admins = data.filter((u: any) => u.role.toLowerCase() === 'admin');
          setTeacherCount(teachers.length);
          setAdminCount(admins.length);
          
          const genStats: Record<string, any> = {};
          students.forEach(s => {
             const gen = extractGeneration(s);
             const rawClass = s.class || s.major || 'Unknown Class';
             const cls = normalizeClassLabel(rawClass);
             if (!genStats[gen]) genStats[gen] = { total: 0, classesMap: {}, activeCount: 0, disabledCount: 0 };
             genStats[gen].total += 1;
             if (!genStats[gen].classesMap[cls]) genStats[gen].classesMap[cls] = 0;
             genStats[gen].classesMap[cls] += 1;
             const isDeleted = Number(s.is_deleted || 0) === 1;
             const isDisabled = typeof s.is_disable !== 'undefined'
               ? Number(s.is_disable || 0) === 1
               : Number(s.is_active ?? 1) === 0;
             if (!isDeleted && !isDisabled) {
               genStats[gen].activeCount += 1;
             } else if (!isDeleted && isDisabled) {
               genStats[gen].disabledCount += 1;
             }
          });

          const formattedStats: any = {
            total: students.length.toLocaleString(),
          };
          
          Object.keys(genStats).forEach(gen => {
             const clsMap = genStats[gen].classesMap;
             formattedStats[gen.toLowerCase().replace(/\s/g, '')] = {
                title: gen,
                total: genStats[gen].total,
                classes: Object.keys(clsMap).map(c => ({ name: c, count: clsMap[c] })),
                activeCount: genStats[gen].activeCount,
                disabledCount: genStats[gen].disabledCount
             };
          });
          setStudentStats(formattedStats);

          const toDisplayNameFromEmail = (email: string) => {
            const username = email.split('@')[0] || 'User';
            return username.split(/[._-]+/).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
          };
          
          const mappedUsers = data.filter((u: any) => {
            const isDeleted = Number(u.is_deleted || 0) === 1;
            const isDisabled = Number(u.is_disable || 0) === 1;
            const isPending = typeof u.is_registered !== 'undefined'
              ? Number(u.is_registered || 0) === 0
              : (u.registration_status || '').toString().toLowerCase() === 'pending'
                || (u.account_status || '').toString().toLowerCase() === 'pending';
            return !isDeleted && isPending;
          }).map((apiUser: any) => {
             const roleLower = (apiUser.role || '').toLowerCase();
             const role = roleLower === 'teacher' ? 'Teacher' : roleLower === 'admin' ? 'Admin' : 'Student';
             const resolvedName = (apiUser.name || '').trim() || [apiUser.first_name, apiUser.last_name].filter(Boolean).join(' ').trim() || toDisplayNameFromEmail(apiUser.email);
             const isDeleted = Number(apiUser.is_deleted || 0) === 1;
             const isDisabled = Number(apiUser.is_disable || 0) === 1;
             const isPending = typeof apiUser.is_registered !== 'undefined'
                ? Number(apiUser.is_registered || 0) === 0
                : (apiUser.registration_status || '').toString().toLowerCase() === 'pending'
                  || (apiUser.account_status || '').toString().toLowerCase() === 'pending';
             const status = isDeleted ? 'Deleted' : isPending ? 'Pending' : isDisabled ? 'Inactive' : 'Active';
             const group = role === 'Student' ? (apiUser.class || 'Pending Class Assignment') : role === 'Teacher' ? 'Teaching Staff' : 'Administration';
            
             return {
                id: apiUser.id,
                name: resolvedName,
                email: apiUser.email,
                role, group, status,
                profileImage: String(apiUser.profile_image || '').trim() || DEFAULT_AVATAR,
                initials: resolvedName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2)
             };
          });
          setPendingUsers(mappedUsers);
          setPendingPage(1);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [sortBy, sortOrder]);

  const handleToggleGeneration = async (generation: string, activeCount: number) => {
    try {
      setGenerationActionLoading((prev) => ({ ...prev, [generation]: true }));
      const shouldEnable = activeCount === 0;
      const response = await fetch(
        `${API_BASE_URL}/users/generation/${generation}/active`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: shouldEnable })
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.error || 'Failed to update generation status.');
        return;
      }
      const refreshed = await fetch(`${API_BASE_URL}/users?sortBy=${sortBy}&sortOrder=${sortOrder}`);
      const data = await refreshed.json();
      if (Array.isArray(data)) {
        const students = data.filter((u: any) => u.role.toLowerCase() === 'student');
        const teachers = data.filter((u: any) => u.role.toLowerCase() === 'teacher');
        const admins = data.filter((u: any) => u.role.toLowerCase() === 'admin');
        setTeacherCount(teachers.length);
        setAdminCount(admins.length);

        const genStats: Record<string, any> = {};
        students.forEach((s: any) => {
          const gen = extractGeneration(s);
          const rawClass = s.class || s.major || 'Unknown Class';
          const cls = normalizeClassLabel(rawClass);
          if (!genStats[gen]) genStats[gen] = { total: 0, classesMap: {}, activeCount: 0, disabledCount: 0 };
          genStats[gen].total += 1;
          if (!genStats[gen].classesMap[cls]) genStats[gen].classesMap[cls] = 0;
          genStats[gen].classesMap[cls] += 1;
          const isDeleted = Number(s.is_deleted || 0) === 1;
          const isDisabled = typeof s.is_disable !== 'undefined'
            ? Number(s.is_disable || 0) === 1
            : Number(s.is_active ?? 1) === 0;
          if (!isDeleted && !isDisabled) {
            genStats[gen].activeCount += 1;
          } else if (!isDeleted && isDisabled) {
            genStats[gen].disabledCount += 1;
          }
        });

        const formattedStats: any = { total: students.length.toLocaleString() };
        Object.keys(genStats).forEach((gen) => {
          const clsMap = genStats[gen].classesMap;
          formattedStats[gen.toLowerCase().replace(/\s/g, '')] = {
            title: gen,
            total: genStats[gen].total,
            classes: Object.keys(clsMap).map((c) => ({ name: c, count: clsMap[c] })),
            activeCount: genStats[gen].activeCount,
            disabledCount: genStats[gen].disabledCount
          };
        });
        setStudentStats(formattedStats);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update generation status.');
    } finally {
      setGenerationActionLoading((prev) => ({ ...prev, [generation]: false }));
    }
  };

  const openEditPendingUser = async (userId: number) => {
    setEditError('');
    setIsEditModalOpen(true);
    setEditUserId(userId);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load user details.');
      }
      const user = await response.json();
      const resolvedName = String(user.name || `${user.first_name || ''} ${user.last_name || ''}` || '').trim();
      const { firstName, lastName } = splitNameParts(resolvedName);
      const roleLower = String(user.role || '').toLowerCase();
      const role = roleLower === 'teacher' ? 'Teacher' : roleLower === 'admin' ? 'Admin' : 'Student';
      const classValue = String(user.class || '').trim();
      const generation = String(user.generation || '').trim() || extractGeneration(user);
      const major = String(user.major || '').trim().toUpperCase();
      const className = normalizeClassLabel(extractClassLabel(classValue));

      setEditUser({
        firstName,
        lastName,
        email: String(user.email || ''),
        role,
        gender: String(user.gender || 'male').toLowerCase() === 'female' ? 'female' : 'male',
        generation: generation || '',
        major: major || '',
        className: className || '',
        studentId: String(user.student_id || '')
      });
    } catch (err: any) {
      setEditError(err?.message || 'Failed to load user details.');
    }
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserId || isEditSubmitting) return;
    setEditError('');

    const trimmedEmail = editUser.email.trim().toLowerCase();
    const trimmedFirstName = editUser.firstName.trim();
    const trimmedLastName = editUser.lastName.trim();
    const trimmedGeneration = editUser.generation.trim();
    const trimmedMajor = editUser.major.trim().toUpperCase();
    const trimmedClass = editUser.className.trim().toUpperCase();
    const trimmedStudentId = editUser.studentId.trim();
    const roleValue = editUser.role.toLowerCase();

    if (!trimmedEmail) {
      setEditError('Email is required.');
      return;
    }
    if (!trimmedFirstName) {
      setEditError('First name is required.');
      return;
    }

    if (roleValue === 'student') {
      const studentIdPattern = /^\d{4}-\d{3}$/;
      if (!trimmedGeneration || !/^\d{4}$/.test(trimmedGeneration)) {
        setEditError('Generation must be a 4-digit year.');
        return;
      }
      if (!trimmedMajor) {
        setEditError('Major is required for student.');
        return;
      }
      if (trimmedStudentId && !studentIdPattern.test(trimmedStudentId)) {
        setEditError('Student ID must match format YYYY-XXX (example: 2028-001).');
        return;
      }
      if (trimmedStudentId && !trimmedStudentId.startsWith(`${trimmedGeneration}-`)) {
        setEditError('Student ID year must match selected generation.');
        return;
      }
    }

    const resolvedName = `${trimmedFirstName} ${trimmedLastName}`.trim();
    const classLabel = roleValue === 'student'
      ? buildStudentClassLabel(trimmedGeneration, trimmedMajor, trimmedClass)
      : trimmedClass || null;

    try {
      setIsEditSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/users/${editUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: resolvedName,
          email: trimmedEmail,
          gender: editUser.gender,
          role: roleValue,
          class_name: classLabel,
          student_id: roleValue === 'student' ? trimmedStudentId : null,
          generation: roleValue === 'student' ? trimmedGeneration : null,
          major: roleValue === 'student' ? trimmedMajor : null,
          className: roleValue === 'student' ? trimmedClass : trimmedClass
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user.');
      }

      setPendingUsers((prev) =>
        prev.map((u) =>
          u.id === editUserId
            ? {
                ...u,
                name: resolvedName,
                email: trimmedEmail,
                role: editUser.role,
                group: classLabel || u.group
              }
            : u
        )
      );

      setIsEditModalOpen(false);
      setEditUserId(null);
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update user.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const pendingTotalPages = Math.max(1, Math.ceil(pendingUsers.length / PENDING_PAGE_SIZE));
  const paginatedPendingUsers = pendingUsers.slice(
    (pendingPage - 1) * PENDING_PAGE_SIZE,
    pendingPage * PENDING_PAGE_SIZE
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <AdminMobileNav />
        {/* Header */}
        <header className="h-auto min-h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-4 md:px-6 lg:px-8 py-3 md:py-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-black text-slate-900">Admin Dashboard</h1>
            <p className="text-xs text-slate-500 font-bold hidden md:block">Welcome back. Here's what's happening today.</p>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 rounded-xl text-sm w-full md:w-48 lg:w-80 transition-all outline-none"
              />
            </div>
            
            <button className="relative size-10 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors flex-shrink-0">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 size-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-24 md:pb-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Students Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                    <Users className="w-6 h-6" />
                  </div>
                  <button 
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    View All
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Students</p>
                <p className="text-3xl font-black text-slate-900 mb-4">{studentStats?.total || 0}</p>
                
                <div className="space-y-3">
                  {studentStats && Object.keys(studentStats)
                    .filter(k => k !== 'total')
                    .map((key) => studentStats[key])
                    .filter((gen: any) => Number(gen.activeCount || 0) > 0)
                    .map((gen: any) => {
                    return (
                      <div key={gen.title} className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                            {gen.title === 'Unknown Gen' ? 'Other' : (gen.title.toLowerCase().startsWith('gen') ? gen.title : `Gen ${gen.title}`)}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-black text-blue-600">{gen.total}</p>
                            <button
                              type="button"
                              onClick={() => handleToggleGeneration(gen.title, gen.activeCount || 0)}
                              disabled={generationActionLoading[gen.title] || !/^\d{4}$/.test(String(gen.title || ''))}
                              className={cn(
                                "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors",
                                (gen.activeCount || 0) > 0
                                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
                                generationActionLoading[gen.title] || !/^\d{4}$/.test(String(gen.title || ''))
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              )}
                            >
                              {generationActionLoading[gen.title]
                                ? '...'
                                : (gen.activeCount || 0) > 0 ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {gen.classes.map((c: any) => (
                            <button 
                              key={c.name} 
                              onClick={() => navigate(`/admin/students/${gen.title}/${encodeURIComponent(c.name)}`)}
                              className="flex items-center justify-between p-1.5 hover:bg-white rounded-lg transition-colors group/btn border border-transparent hover:border-slate-200"
                            >
                              <span className="text-[9px] font-bold text-slate-400 group-hover/btn:text-primary">{c.name}</span>
                              <span className="text-[9px] font-black text-slate-600">{c.count}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Total Teachers Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="size-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <button 
                    onClick={() => navigate('/admin/teachers')}
                    className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    View All
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Teachers</p>
                <p className="text-3xl font-black text-slate-900 mb-2">{teacherCount}</p>
                <div className="mt-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                  <p className="text-[10px] font-bold text-purple-600 leading-relaxed italic">
                    All teachers are currently active and assigned to their respective departments.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Management Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="font-black text-slate-900">Pending users</h3>
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="generation">Generation</option>
                      <option value="name">Name</option>
                      <option value="created_at">Date</option>
                    </select>
                    <select 
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="desc">DESC</option>
                      <option value="asc">ASC</option>
                    </select>
                  </div>
                  {/* Advanced Filters Button */}
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all">
                    <Filter className="w-3.5 h-3.5" />
                    Advanced Filters
                  </button>
                </div>
                <button 
                  onClick={() => navigate('/admin/users', { state: { openInvite: true } })}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  Add User
                  <span className="ml-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black tracking-widest text-white">
                    {pendingUsers.length}
                  </span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Class/Group</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedPendingUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{user.name}</p>
                              <p className="text-[10px] font-bold text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-600">{user.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-600">{user.group}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                            user.status === 'Active' ? "bg-emerald-50 text-emerald-600" : 
                            user.status === 'Pending' ? "bg-amber-50 text-amber-600" :
                            user.status === 'Deleted' ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-400"
                          )}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openEditPendingUser(user.id)}
                            className="p-2 text-slate-400 hover:text-primary transition-colors"
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Showing {paginatedPendingUsers.length} pending users
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPendingPage((prev) => Math.max(1, prev - 1))}
                    disabled={pendingPage <= 1}
                    className={cn(
                      "px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors",
                      pendingPage <= 1 ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-slate-900"
                    )}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPendingPage((prev) => Math.min(pendingTotalPages, prev + 1))}
                    disabled={pendingPage >= pendingTotalPages}
                    className={cn(
                      "px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors",
                      pendingPage >= pendingTotalPages ? "text-slate-300 cursor-not-allowed" : "text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-8">
              {/* Disabled Generations */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="font-black text-slate-900">Disabled Generations</h3>
                </div>

                {studentStats ? (
                  (() => {
                    const disabledGenerations = Object.keys(studentStats)
                      .filter((key) => key !== 'total')
                      .map((key) => studentStats[key])
                      .filter((gen: any) => Number(gen.disabledCount || 0) > 0 && Number(gen.activeCount || 0) === 0);

                    if (disabledGenerations.length === 0) {
                      return (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                          No disabled generations.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {disabledGenerations.map((gen: any) => (
                          <div key={gen.title} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                {gen.title === 'Unknown Gen' ? 'Other' : `Gen ${gen.title}`}
                              </p>
                              <p className="text-sm font-black text-slate-900">
                                {gen.disabledCount} students disabled
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleGeneration(gen.title, gen.activeCount || 0)}
                              disabled={generationActionLoading[gen.title] || !/^\d{4}$/.test(String(gen.title || ''))}
                              className={cn(
                                "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors",
                                generationActionLoading[gen.title] || !/^\d{4}$/.test(String(gen.title || ''))
                                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              )}
                            >
                              {generationActionLoading[gen.title] ? '...' : 'Enable'}
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Loading generations...
                  </div>
                )}
              </div>

              {/* System Activity */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-slate-900">System Activity</h3>
                  <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All</button>
                </div>
                
                <div className="space-y-6">
                  {SYSTEM_ACTIVITY.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className={cn(
                        "size-8 rounded-lg flex items-center justify-center shrink-0",
                        activity.type === 'success' ? "bg-emerald-50 text-emerald-600" :
                        activity.type === 'info' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                      )}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 leading-tight">{activity.message}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isEditSubmitting && setIsEditModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Edit Pending User</h3>
                <p className="text-xs text-slate-500 font-bold">Update the user information below.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</label>
                  <input
                    required
                    type="text"
                    value={editUser.firstName}
                    onChange={(e) => setEditUser((prev) => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</label>
                  <input
                    type="text"
                    value={editUser.lastName}
                    onChange={(e) => setEditUser((prev) => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                <input
                  required
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</label>
                  <select
                    value={editUser.gender}
                    onChange={(e) => setEditUser((prev) => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Generation</label>
                  <input
                    type="text"
                    value={editUser.generation}
                    onChange={(e) => setEditUser((prev) => ({ ...prev, generation: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              {editUser.role === 'Student' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Major</label>
                    <input
                      type="text"
                      value={editUser.major}
                      onChange={(e) => setEditUser((prev) => ({ ...prev, major: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class</label>
                    <input
                      type="text"
                      value={editUser.className}
                      onChange={(e) => setEditUser((prev) => ({ ...prev, className: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student ID</label>
                    <input
                      type="text"
                      value={editUser.studentId}
                      onChange={(e) => setEditUser((prev) => ({ ...prev, studentId: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {editError && (
                <div className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                  {editError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isEditSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-60"
                >
                  {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}


