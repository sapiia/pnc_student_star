import {
  Search,
  Edit2,
  Trash2,
  Filter,
  Download,
  UserPlus,
  X,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminSidebar from '../components/AdminSidebar';
import { cn } from '../lib/utils';
import React, { useState } from 'react';

type UserRole = 'Student' | 'Teacher' | 'Admin';
type UserStatus = 'Active' | 'Inactive' | 'Invited';
type StudentGeneration = '2026' | '2027';
type Gender = 'male' | 'female';

type UserRecord = {
  id: number;
  name: string;
  nickname?: string;
  email: string;
  role: UserRole;
  group: string;
  status: UserStatus;
  initials: string;
  color: string;
  studentId?: string;
  generation?: StudentGeneration;
  className?: string;
  gender?: Gender;
};

type InvitePreview = {
  to: string;
  subject: string;
  text: string;
  inviteLink: string;
  loginLink?: string;
  roleDashboardPath?: string;
};

const INITIAL_USERS: UserRecord[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@pnc.edu', role: 'Student', group: 'Gen 2027 - Class A', status: 'Active', initials: 'JD', color: 'bg-blue-100 text-blue-700', generation: '2027', className: 'A', studentId: '2027-001' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@pnc.edu', role: 'Teacher', group: 'Teaching Staff', status: 'Active', initials: 'JS', color: 'bg-purple-100 text-purple-700' },
  { id: 3, name: 'Robert Brown', email: 'r.brown@pnc.edu', role: 'Admin', group: 'Administration', status: 'Active', initials: 'RB', color: 'bg-orange-100 text-orange-700' },
  { id: 4, name: 'Lucy Liu', email: 'l.liu@pnc.edu', role: 'Student', group: 'Gen 2026 - Class B', status: 'Inactive', initials: 'LL', color: 'bg-slate-100 text-slate-700', generation: '2026', className: 'B', studentId: '2026-014' },
];

const defaultNewUser = {
  name: '',
  nickname: '',
  email: '',
  role: 'Student' as UserRole,
  generation: '2026' as StudentGeneration,
  className: '',
  studentId: '',
  gender: 'male' as Gender,
  status: 'Active' as UserStatus
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const toDisplayNameFromEmail = (email: string) => {
  const username = email.split('@')[0] || 'User';
  return username
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitePreview, setInvitePreview] = useState<InvitePreview | null>(null);
  const [newUser, setNewUser] = useState(defaultNewUser);

  const filteredUsers = users.filter(user => {
    const normalizedQuery = searchQuery.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery) ||
      (user.studentId?.toLowerCase().includes(normalizedQuery) ?? false);
    const matchesRole = roleFilter === 'All Roles' || `${user.role}s` === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedEmail = newUser.email.trim().toLowerCase();
    const trimmedName = newUser.name.trim();
    const trimmedNickname = newUser.nickname.trim();
    const trimmedClass = newUser.className.trim().toUpperCase();
    const trimmedStudentId = newUser.studentId.trim();

    if (!trimmedEmail) {
      setFormError('Email is required.');
      return;
    }
    if (!trimmedName) {
      setFormError('Full name is required.');
      return;
    }

    if (newUser.role === 'Student') {
      const studentIdPattern = /^(2026|2027)-\d{3}$/;
      if (trimmedStudentId && !studentIdPattern.test(trimmedStudentId)) {
        setFormError('Student ID must match format YYYY-XXX (example: 2026-001).');
        return;
      }
      if (trimmedStudentId && !trimmedStudentId.startsWith(`${newUser.generation}-`)) {
        setFormError('Student ID year must match selected generation.');
        return;
      }
    }

    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      setFormError('Email already exists.');
      return;
    }
    setIsSubmitting(true);

    const resolvedName = trimmedName || toDisplayNameFromEmail(trimmedEmail);
    const initials = resolvedName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-emerald-100 text-emerald-700',
      'bg-indigo-100 text-indigo-700'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const group =
      newUser.role === 'Student'
        ? trimmedClass
          ? `Gen ${newUser.generation} - Class ${trimmedClass}`
          : 'Pending Class Assignment'
        : newUser.role === 'Teacher'
          ? 'Teaching Staff'
          : 'Administration';

    try {
      const roleValue = newUser.role.toLowerCase();
      const response = await fetch(`${API_BASE_URL}/users/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: resolvedName,
          gender: newUser.gender,
          email: trimmedEmail,
          role: roleValue,
          generation: roleValue === 'student' ? newUser.generation : undefined,
          className: roleValue === 'student' && trimmedClass ? trimmedClass : undefined,
          studentId: roleValue === 'student' && trimmedStudentId ? trimmedStudentId : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setFormError(data.error || 'Failed to send invitation email.');
        return;
      }
      setInvitePreview(data.preview || null);

      const invitedUser: UserRecord = {
        id: Date.now(),
        name: resolvedName,
        nickname: trimmedNickname,
        email: trimmedEmail,
        role: newUser.role,
        gender: newUser.gender,
        group,
        status: 'Invited',
        initials,
        color: randomColor,
        generation: newUser.role === 'Student' ? newUser.generation : undefined,
        className: newUser.role === 'Student' && trimmedClass ? trimmedClass : undefined,
        studentId: newUser.role === 'Student' && trimmedStudentId ? trimmedStudentId : undefined
      };

      setUsers([invitedUser, ...users]);
      setIsModalOpen(false);
      setNewUser(defaultNewUser);
      setSuccessMessage(data.message || 'Invitation email sent successfully.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setFormError('Failed to send invitation email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto relative">
        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 20, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className="fixed top-0 left-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
            >
              <CheckCircle2 className="w-5 h-5" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">User Management</h1>
            <p className="text-xs text-slate-500 font-bold">Manage system users, roles, and permissions.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, email, or role..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm w-full transition-all outline-none"
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option>All Roles</option>
                <option>Students</option>
                <option>Teachers</option>
                <option>Admins</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Class/Department</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("size-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0", user.color)}>
                            {user.initials}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {user.name} 
                              {user.nickname && <span className="text-xs font-bold text-primary ml-2">({user.nickname})</span>}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                          user.role.includes('Admin') ? "bg-orange-50 text-orange-600" :
                          user.role === 'Teacher' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600">{user.group}</span>
                        {user.studentId && (
                          <p className="text-[10px] font-bold text-slate-400 mt-1">ID: {user.studentId}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                          user.status === 'Active'
                            ? "bg-emerald-50 text-emerald-600"
                            : user.status === 'Invited'
                              ? "bg-amber-50 text-amber-600"
                              : "bg-slate-100 text-slate-400"
                        )}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteUser(user.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
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
            
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {filteredUsers.length} of {users.length} users</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Previous</button>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-colors">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Invite New User</h3>
                    <p className="text-slate-500 text-sm">Send an email invite with registration link.</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleAddUser} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Sokha Mean"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nickname (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Sokha"
                        value={newUser.nickname}
                        onChange={(e) => setNewUser({...newUser, nickname: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="e.g. sokha.mean@pnc.edu"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400 font-bold ml-1">Invite will be sent to this email.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender</label>
                      <select
                        value={newUser.gender}
                        onChange={(e) => setNewUser({ ...newUser, gender: e.target.value as Gender })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role</label>
                      <select 
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      >
                        <option value="Student">Student</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    {newUser.role === 'Student' ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Generation</label>
                        <select 
                          value={newUser.generation}
                          onChange={(e) => setNewUser({...newUser, generation: e.target.value as StudentGeneration})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        >
                          <option value="2026">2026</option>
                          <option value="2027">2027</option>
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role Details</label>
                        <input 
                          disabled
                          type="text" 
                          value={newUser.role === 'Teacher' ? 'Teaching Staff' : 'Administration'}
                          className="w-full px-4 py-3 bg-slate-100 border border-slate-100 rounded-2xl text-sm text-slate-500 outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>

                  {newUser.role === 'Student' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Class</label>
                        <input
                          type="text"
                          placeholder="e.g. A"
                          value={newUser.className}
                          onChange={(e) => setNewUser({ ...newUser, className: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                        <p className="text-[10px] text-slate-400 font-bold ml-1">Optional. Add later if not ready.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Student ID</label>
                        <input
                          type="text"
                          placeholder={`${newUser.generation}-001`}
                          value={newUser.studentId}
                          onChange={(e) => setNewUser({ ...newUser, studentId: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                        <p className="text-[10px] text-slate-400 font-bold ml-1">Format: YYYY-XXX (example: 2026-001)</p>
                      </div>
                    </div>
                  )}

                  {formError && (
                    <div className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                      {formError}
                    </div>
                  )}

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all uppercase tracking-widest"
                    >
                      {isSubmitting ? 'Sending Invite...' : 'Send Invite Email'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {invitePreview && (
        <div className="fixed bottom-4 right-4 z-[80] w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Invite Email Preview</p>
            <button
              onClick={() => setInvitePreview(null)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close email preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 px-4 py-3 text-xs">
            <p><span className="font-black text-slate-500">To:</span> <span className="font-semibold text-slate-800">{invitePreview.to}</span></p>
            <p><span className="font-black text-slate-500">Subject:</span> <span className="font-semibold text-slate-800">{invitePreview.subject}</span></p>
            <p className="font-black text-slate-500">Text:</p>
            <pre className="max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px] font-medium text-slate-700 whitespace-pre-wrap break-words">{invitePreview.text}</pre>
            <p className="font-black text-slate-500">Link:</p>
            <a
              href={invitePreview.inviteLink}
              target="_blank"
              rel="noreferrer"
              className="block break-all rounded-xl bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
            >
              {invitePreview.inviteLink}
            </a>
            {invitePreview.loginLink && (
              <>
                <p className="font-black text-slate-500">Login Link:</p>
                <a
                  href={invitePreview.loginLink}
                  target="_blank"
                  rel="noreferrer"
                  className="block break-all rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  {invitePreview.loginLink}
                </a>
              </>
            )}
            {invitePreview.roleDashboardPath && (
              <p><span className="font-black text-slate-500">Dashboard After Login:</span> <span className="font-semibold text-slate-800">{invitePreview.roleDashboardPath}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
