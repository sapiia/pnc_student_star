import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Activity, 
  Search, 
  Bell, 
  Plus, 
  Minus,
  Upload,
  Edit2, 
  X,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { motion } from 'motion/react';
import AdminSidebar from '../components/AdminSidebar';
import { cn } from '../lib/utils';
import { useAdminUnreadNotifications } from '../lib/useAdminUnreadNotifications';

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

const STATS = [
  { label: 'Evaluation Period', value: 'Oct 01 - Dec 15', trend: 'Active', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'System Health', value: '99.9%', trend: 'Online', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Admin';
  group: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Deleted';
  initials: string;
  color: string;
};

type ApiUser = {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
  class?: string | null;
  is_active?: number | boolean | null;
  is_disable?: number | boolean | null;
  is_deleted?: number | boolean | null;
  is_registered?: number | boolean | null;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const DEFAULT_MAJOR_OPTIONS = ['SNA', 'WEB DEV'];
const DEFAULT_CLASS_OPTIONS = ['WEB A', 'WEB B'];
const USER_ROW_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-emerald-100 text-emerald-700',
  'bg-indigo-100 text-indigo-700'
];

const SYSTEM_ACTIVITY = [
  { id: 1, type: 'success', message: 'Evaluation period opened', time: '2 hours ago', icon: CheckCircle2 },
  { id: 2, type: 'info', message: '24 new student accounts created', time: '5 hours ago', icon: Users },
  { id: 3, type: 'warning', message: 'Backup completed successfully', time: 'Yesterday, 11:45 PM', icon: Activity },
];

const formatDateDisplay = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { unreadMessageCount } = useAdminUnreadNotifications();
  const [userTablePage, setUserTablePage] = useState(1);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [isBulkCommitting, setIsBulkCommitting] = useState(false);
  const [bulkValidatedRows, setBulkValidatedRows] = useState<any[]>([]);
  const [bulkValidationErrorCount, setBulkValidationErrorCount] = useState(0);
  const [majorOptions, setMajorOptions] = useState<string[]>(DEFAULT_MAJOR_OPTIONS);
  const [classOptions, setClassOptions] = useState<string[]>(DEFAULT_CLASS_OPTIONS);
  const [customMajorDraft, setCustomMajorDraft] = useState('');
  const [customClassDraft, setCustomClassDraft] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userFormError, setUserFormError] = useState('');
  const [assessmentStart, setAssessmentStart] = useState('');
  const [assessmentEnd, setAssessmentEnd] = useState('');
  const [isSavingWindow, setIsSavingWindow] = useState(false);
  const [windowStatus, setWindowStatus] = useState('');
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    gender: 'male' as 'male' | 'female',
    generation: '2026',
    major: 'SNA',
    name: '',
    email: '',
    role: 'Student' as 'Student' | 'Teacher' | 'Admin',
    className: '',
    studentId: '',
    password: ''
  });
  const USER_ROWS_PER_PAGE = 4;
  const totalUserPages = Math.max(1, Math.ceil(users.length / USER_ROWS_PER_PAGE));
  const pagedUsers = users.slice((userTablePage - 1) * USER_ROWS_PER_PAGE, userTablePage * USER_ROWS_PER_PAGE);
  const showFrom = (userTablePage - 1) * USER_ROWS_PER_PAGE + 1;
  const showTo = Math.min(userTablePage * USER_ROWS_PER_PAGE, users.length);

  const mapApiUserToRow = (apiUser: ApiUser): UserRow => {
    const fullName = [apiUser.first_name, apiUser.last_name].filter(Boolean).join(' ').trim();
    const name = String(apiUser.name || '').trim() || fullName || apiUser.email;
    const roleLower = String(apiUser.role || '').toLowerCase();
    const role: UserRow['role'] = roleLower === 'admin' ? 'Admin' : roleLower === 'teacher' ? 'Teacher' : 'Student';
    const isDeleted = Number(apiUser.is_deleted || 0) === 1;
    const isDisabled = typeof apiUser.is_disable !== 'undefined'
      ? Number(apiUser.is_disable || 0) === 1
      : Number(apiUser.is_active ?? 1) === 0;
    const isPending = typeof apiUser.is_registered !== 'undefined' ? Number(apiUser.is_registered || 0) === 0 : false;
    const status: UserRow['status'] = isDeleted ? 'Deleted' : isPending ? 'Pending' : isDisabled ? 'Inactive' : 'Active';
    const group = role === 'Student'
      ? String(apiUser.class || '').trim() || 'Pending Class Assignment'
      : role === 'Teacher'
        ? String(apiUser.class || '').trim() || 'Teaching Staff'
        : 'Administration';
    const initials = name.split(' ').map((word) => word[0]).join('').toUpperCase().slice(0, 2);
    const color = USER_ROW_COLORS[apiUser.id % USER_ROW_COLORS.length];

    return {
      id: apiUser.id,
      name,
      email: apiUser.email,
      role,
      group,
      status,
      initials,
      color
    };
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data = await response.json().catch(() => []);
      if (!response.ok || !Array.isArray(data)) return;
      setUsers(data.map((item: ApiUser) => mapApiUserToRow(item)));
    } catch {
      // keep last known table state
    }
  };

  const loadEvaluationWindow = async () => {
    try {
      const [startResponse, endResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/settings/key/next_assessment_start`),
        fetch(`${API_BASE_URL}/settings/key/next_assessment_end`),
      ]);
      const startData = await startResponse.json().catch(() => ({}));
      const endData = await endResponse.json().catch(() => ({}));

      setAssessmentStart(startResponse.ok ? String(startData?.value || '').slice(0, 10) : '');
      setAssessmentEnd(endResponse.ok ? String(endData?.value || '').slice(0, 10) : '');
    } catch {
      setAssessmentStart('');
      setAssessmentEnd('');
    }
  };

  const saveEvaluationWindow = async () => {
    if (!assessmentStart || !assessmentEnd) {
      setWindowStatus('Please choose both start and end dates.');
      return;
    }
    if (new Date(assessmentEnd).getTime() < new Date(assessmentStart).getTime()) {
      setWindowStatus('End date must be on or after start date.');
      return;
    }

    setIsSavingWindow(true);
    setWindowStatus('');
    try {
      const [startResponse, endResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/settings/key/next_assessment_start`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: assessmentStart }),
        }),
        fetch(`${API_BASE_URL}/settings/key/next_assessment_end`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: assessmentEnd }),
        }),
      ]);
      const startData = await startResponse.json().catch(() => ({}));
      const endData = await endResponse.json().catch(() => ({}));
      if (!startResponse.ok || !endResponse.ok) {
        setWindowStatus(startData?.error || endData?.error || 'Failed to save evaluation window.');
        return;
      }
      setWindowStatus(`Saved: ${formatDateDisplay(assessmentStart)} - ${formatDateDisplay(assessmentEnd)}`);
      window.dispatchEvent(new Event('evaluation-window-updated'));
    } catch {
      setWindowStatus('Failed to save evaluation window.');
    } finally {
      setIsSavingWindow(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    void loadEvaluationWindow();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setUserFormError('');
    setUserForm({
      firstName: '',
      lastName: '',
      gender: 'male',
      generation: '2026',
      major: 'SNA',
      name: '',
      email: '',
      role: 'Student',
      className: '',
      studentId: '',
      password: ''
    });
    setBulkValidatedRows([]);
    setBulkValidationErrorCount(0);
    setIsUserModalOpen(true);
  };

  const openEditModal = (user: UserRow) => {
    setIsEditing(true);
    setEditingUserId(user.id);
    setUserFormError('');
    setUserForm({
      firstName: '',
      lastName: '',
      gender: 'male',
      generation: '2026',
      major: 'SNA',
      name: user.name,
      email: user.email,
      role: user.role,
      className: user.group === 'Administration' || user.group === 'Teaching Staff' ? '' : user.group,
      studentId: '',
      password: ''
    });
    setIsUserModalOpen(true);
  };

  const saveUser = async () => {
    const firstName = userForm.firstName.trim();
    const lastName = userForm.lastName.trim();
    const name = userForm.name.trim() || `${firstName} ${lastName}`.trim();
    const email = userForm.email.trim().toLowerCase();
    const role = userForm.role.toLowerCase();
    const className = userForm.className.trim();
    const studentId = userForm.studentId.trim();
    const password = userForm.password;
    const generation = userForm.generation.trim();
    const major = userForm.major.trim().toUpperCase();
    const gender = userForm.gender;

    if (!name) {
      setUserFormError('First name is required.');
      return;
    }
    if (!email) {
      setUserFormError('Email is required.');
      return;
    }
    if (!isEditing && userForm.role === 'Student' && !studentId) {
      setUserFormError('Student ID is required for new student invite.');
      return;
    }

    setIsSavingUser(true);
    setUserFormError('');
    try {
      if (isEditing && editingUserId) {
        const updateResponse = await fetch(`${API_BASE_URL}/users/${editingUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            role,
            class_name: className || null,
            student_id: role === 'student' ? (studentId || null) : null
          })
        });
        const data = await updateResponse.json().catch(() => ({}));
        if (!updateResponse.ok) {
          setUserFormError(data.error || 'Failed to update user.');
          return;
        }
      } else {
        const createResponse = await fetch(`${API_BASE_URL}/users/invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            lastName: lastName || undefined,
            name,
            gender,
            email,
            role,
            generation: role === 'student' ? generation : undefined,
            major: role === 'student' ? major : undefined,
            className: role === 'student' && className ? className : undefined,
            studentId: role === 'student' && studentId ? studentId : undefined
          })
        });
        const data = await createResponse.json().catch(() => ({}));
        if (!createResponse.ok) {
          setUserFormError(data.error || 'Failed to add user.');
          return;
        }
      }

      await loadUsers();
      setIsUserModalOpen(false);
    } catch {
      setUserFormError(isEditing ? 'Failed to update user.' : 'Failed to add user.');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleBulkImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUserFormError('');
    setIsBulkImporting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/users/invite/bulk/validate`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setUserFormError(data.error || 'Failed to import Excel.');
        return;
      }
      const failedCount = Number(data?.summary?.failedCount || 0);
      const validRows = Array.isArray(data?.validRows) ? data.validRows : [];
      setBulkValidationErrorCount(failedCount);
      setBulkValidatedRows(failedCount > 0 ? [] : validRows);
      if (failedCount > 0) {
        setUserFormError(`Some rows failed (${failedCount}). Please fix your Excel file.`);
      }
    } catch {
      setUserFormError('Failed to import Excel.');
    } finally {
      setIsBulkImporting(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleBulkCommit = async () => {
    if (!bulkValidatedRows.length || bulkValidationErrorCount > 0) {
      setUserFormError('Please import a valid Excel file first.');
      return;
    }
    setIsBulkCommitting(true);
    setUserFormError('');
    try {
      const response = await fetch(`${API_BASE_URL}/users/invite/bulk/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: bulkValidatedRows.map((row: any) => ({
            row: row.row,
            payload: row.payload
          }))
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setUserFormError(data.error || 'Failed to send bulk invites.');
        return;
      }
      await loadUsers();
      setIsUserModalOpen(false);
    } catch {
      setUserFormError('Failed to send bulk invites.');
    } finally {
      setIsBulkCommitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">Admin Dashboard</h1>
            <p className="text-xs text-slate-500 font-bold">Welcome back. Here's what's happening today.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search data, users, or reports..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 rounded-xl text-sm w-80 transition-all outline-none"
              />
            </div>
            
            <button
              onClick={() => navigate('/admin/messages')}
              className="relative size-10 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadMessageCount > 0 ? (
                <span className="absolute top-2.5 right-2.5 size-2 bg-rose-500 rounded-full ring-2 ring-white" />
              ) : null}
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-3xl font-black text-slate-900 mb-4">{STUDENT_STATS.total}</p>
                
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Gen 2026</p>
                      <p className="text-xs font-black text-blue-600">{STUDENT_STATS.gen2026.total}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {STUDENT_STATS.gen2026.classes.map(c => (
                        <button 
                          key={c.name} 
                          onClick={() => navigate(`/admin/students/Gen 2026/${c.name}`)}
                          className="flex items-center justify-between p-1.5 hover:bg-white rounded-lg transition-colors group/btn border border-transparent hover:border-slate-200"
                        >
                          <span className="text-[9px] font-bold text-slate-400 group-hover/btn:text-primary">{c.name}</span>
                          <span className="text-[9px] font-black text-slate-600">{c.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Gen 2027</p>
                      <p className="text-xs font-black text-blue-600">{STUDENT_STATS.gen2027.total}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {STUDENT_STATS.gen2027.classes.map(c => (
                        <button 
                          key={c.name} 
                          onClick={() => navigate(`/admin/students/Gen 2027/${c.name}`)}
                          className="flex items-center justify-between p-1.5 hover:bg-white rounded-lg transition-colors group/btn border border-transparent hover:border-slate-200"
                        >
                          <span className="text-[9px] font-bold text-slate-400 group-hover/btn:text-primary">{c.name}</span>
                          <span className="text-[9px] font-black text-slate-600">{c.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
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
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    View All
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Teachers</p>
                <p className="text-3xl font-black text-slate-900 mb-2">86</p>
                <div className="mt-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                  <p className="text-[10px] font-bold text-purple-600 leading-relaxed italic">
                    All teachers are currently active and assigned to their respective departments.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Other Stats */}
            {STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx + 2) * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("size-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                    stat.trend === 'Active' ? "bg-emerald-50 text-emerald-600" : 
                    stat.trend === 'Online' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-500"
                  )}>
                    {stat.trend}
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Management Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-900">User Management</h3>
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>
              
              <div className="overflow-x-hidden">
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
                    {pagedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("size-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0", user.color)}>
                              {user.initials}
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
                            user.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                          )}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => openEditModal(user)}
                              title={`Edit ${user.name}`}
                              className="p-2 text-slate-400 hover:text-primary transition-colors"
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
                  Showing {users.length === 0 ? 0 : showFrom} to {showTo} of {users.length} users
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUserTablePage((current) => Math.max(1, current - 1))}
                    disabled={userTablePage === 1}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setUserTablePage((current) => Math.min(totalUserPages, current + 1))}
                    disabled={userTablePage === totalUserPages}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-8">
              {/* Evaluation Period Control */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="font-black text-slate-900">Evaluation Periods</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Next Assessment Start</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={assessmentStart}
                        onChange={(e) => setAssessmentStart(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Next Assessment End</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={assessmentEnd}
                        onChange={(e) => setAssessmentEnd(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={saveEvaluationWindow}
                    disabled={isSavingWindow}
                    className="w-full py-3 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all mt-2 disabled:opacity-60"
                  >
                    {isSavingWindow ? 'Saving...' : 'Set Window'}
                  </button>
                  
                  <p className="text-[10px] text-center text-slate-400 font-bold leading-relaxed px-4">
                    Setting a new window will notify all teachers and students via the internal messaging system.
                  </p>
                  {windowStatus ? (
                    <p className="text-[10px] text-center font-bold text-primary">{windowStatus}</p>
                  ) : null}
                </div>
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

      {isUserModalOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setIsUserModalOpen(false)}
          />
          <div className="relative w-full max-w-6xl rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">{isEditing ? 'Edit User' : 'Invite New User'}</h3>
                {!isEditing ? <p className="text-slate-500 text-sm">Send an email invite with registration link.</p> : null}
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isEditing ? (
              <>
                <div className="mt-4 flex items-center justify-end gap-3">
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleBulkImport} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isBulkImporting || isSavingUser || isBulkCommitting}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-60 inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {isBulkImporting ? 'Importing...' : 'Import Excel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkCommit}
                    disabled={isBulkImporting || isSavingUser || isBulkCommitting || !bulkValidatedRows.length || bulkValidationErrorCount > 0}
                    className="px-3 py-2 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-60"
                  >
                    {isBulkCommitting ? 'Sending...' : 'Send Invite Email'}
                  </button>
                </div>

                <p className="mt-4 text-[12px] text-slate-400 font-bold">Excel template headers: First Name, Last Name, Email Address, Gender (Male/Female/Other), Role (Student/Teacher/Admin), Generation, Major, Class, Student ID.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    value={userForm.firstName}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, firstName: e.target.value, name: `${e.target.value} ${prev.lastName}`.trim() }))}
                    placeholder="e.g. Sokha"
                    className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    value={userForm.lastName}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, lastName: e.target.value, name: `${prev.firstName} ${e.target.value}`.trim() }))}
                    placeholder="e.g. Mean"
                    className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    value={userForm.email}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. sokha.mean@pnc.edu"
                    className="md:col-span-2 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <select
                    value={userForm.gender}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                    className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value as 'Student' | 'Teacher' | 'Admin' }))}
                    className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <div className="md:col-span-2 flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setUserForm((prev) => ({ ...prev, generation: String(Math.max(2000, (Number(prev.generation) || 2026) - 1)) }))}
                      className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      value={userForm.generation}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, generation: e.target.value }))}
                      className="flex-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-center font-black"
                    />
                    <button
                      type="button"
                      onClick={() => setUserForm((prev) => ({ ...prev, generation: String(Math.min(2100, (Number(prev.generation) || 2026) + 1)) }))}
                      className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {userForm.role === 'Student' ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Major</span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextMajor = customMajorDraft.trim().toUpperCase();
                              if (!nextMajor) return;
                              if (!majorOptions.includes(nextMajor)) setMajorOptions((prev) => [...prev, nextMajor]);
                              setUserForm((prev) => ({ ...prev, major: nextMajor }));
                              setCustomMajorDraft('');
                            }}
                            className="size-7 rounded-full bg-emerald-500 text-white flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <select
                          value={userForm.major}
                          onChange={(e) => setUserForm((prev) => ({ ...prev, major: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                        >
                          {majorOptions.map((major) => <option key={major} value={major}>{major}</option>)}
                        </select>
                        <input
                          value={customMajorDraft}
                          onChange={(e) => setCustomMajorDraft(e.target.value)}
                          placeholder="Add new major manually"
                          className="mt-2 w-full px-4 py-3 rounded-xl border border-emerald-100 bg-white text-sm"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class</span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextClass = customClassDraft.trim().toUpperCase();
                              if (!nextClass) return;
                              if (!classOptions.includes(nextClass)) setClassOptions((prev) => [...prev, nextClass]);
                              setUserForm((prev) => ({ ...prev, className: nextClass }));
                              setCustomClassDraft('');
                            }}
                            className="size-7 rounded-full bg-emerald-500 text-white flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <select
                          value={userForm.className}
                          onChange={(e) => setUserForm((prev) => ({ ...prev, className: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                        >
                          <option value="">Select class</option>
                          {classOptions.map((classOption) => <option key={classOption} value={classOption}>{classOption}</option>)}
                        </select>
                        <input
                          value={customClassDraft}
                          onChange={(e) => setCustomClassDraft(e.target.value)}
                          placeholder="Add new class manually"
                          className="mt-2 w-full px-4 py-3 rounded-xl border border-emerald-100 bg-white text-sm"
                        />
                      </div>
                      <input
                        value={userForm.studentId}
                        onChange={(e) => setUserForm((prev) => ({ ...prev, studentId: e.target.value }))}
                        placeholder={`${userForm.generation}-001`}
                        className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                      />
                    </>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  value={userForm.name}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Full name"
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  value={userForm.email}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Email"
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value as 'Student' | 'Teacher' | 'Admin' }))}
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
                <input
                  value={userForm.className}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, className: e.target.value }))}
                  placeholder="Class / Group"
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            {userFormError ? (
              <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600">
                {userFormError}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingUser}
                onClick={() => void saveUser()}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-60"
              >
                {isSavingUser ? 'Saving...' : isEditing ? 'Save Changes' : 'Send Invite Email'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
