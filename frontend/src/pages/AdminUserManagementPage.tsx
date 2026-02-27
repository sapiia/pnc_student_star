import { 
  Users, 
  Search, 
  Bell, 
  Plus, 
  Edit2, 
  Trash2,
  Filter,
  MoreVertical,
  Download,
  UserPlus,
  X,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminSidebar from '../components/AdminSidebar';
import { cn } from '../lib/utils';
import React, { useState } from 'react';

const INITIAL_USERS = [
  { id: 1, name: 'John Doe', email: 'john.doe@pnc.edu', role: 'Student', group: 'Class A - Senior', status: 'Active', initials: 'JD', color: 'bg-blue-100 text-blue-700' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@pnc.edu', role: 'Teacher', group: 'Science Dept', status: 'Active', initials: 'JS', color: 'bg-purple-100 text-purple-700' },
  { id: 3, name: 'Robert Brown', email: 'r.brown@pnc.edu', role: 'Admin', group: 'Central Office', status: 'Active', initials: 'RB', color: 'bg-orange-100 text-orange-700' },
  { id: 4, name: 'Lucy Liu', email: 'l.liu@pnc.edu', role: 'Student', group: 'Class B - Junior', status: 'Inactive', initials: 'LL', color: 'bg-slate-100 text-slate-700' },
  // Gen 2027 - Class A
  { id: 101, name: 'Amin Pisal', email: 'amin.pisal@pnc.edu', role: 'Student', group: 'Gen 2027 - Class A', status: 'Active', initials: 'AP', color: 'bg-blue-100 text-blue-700' },
  { id: 102, name: 'Chan Setha', email: 'chan.setha@pnc.edu', role: 'Student', group: 'Gen 2027 - Class A', status: 'Active', initials: 'CS', color: 'bg-blue-100 text-blue-700' },
  { id: 103, name: 'Chan Koemsour', email: 'chan.koemsour@pnc.edu', role: 'Student', group: 'Gen 2027 - Class A', status: 'Active', initials: 'CK', color: 'bg-blue-100 text-blue-700' },
  // Gen 2027 - Class B
  { id: 127, name: 'Ang Thyda', email: 'ang.thyda@pnc.edu', role: 'Student', group: 'Gen 2027 - Class B', status: 'Active', initials: 'AT', color: 'bg-indigo-100 text-indigo-700' },
  { id: 128, name: 'Bis Chantrea', email: 'bis.chantrea@pnc.edu', role: 'Student', group: 'Gen 2027 - Class B', status: 'Active', initials: 'BC', color: 'bg-indigo-100 text-indigo-700' },
  // Gen 2027 - Class C
  { id: 152, name: 'Chhoun Sakraech', email: 'chhoun.sakraech@pnc.edu', role: 'Student', group: 'Gen 2027 - Class C', status: 'Active', initials: 'CS', color: 'bg-emerald-100 text-emerald-700' },
  { id: 153, name: 'Chouon Soran', email: 'chouon.soran@pnc.edu', role: 'Student', group: 'Gen 2027 - Class C', status: 'Active', initials: 'CS', color: 'bg-emerald-100 text-emerald-700' },
  // Gen 2027 - Class D
  { id: 177, name: 'Chouch Soyan', email: 'chouch.soyan@pnc.edu', role: 'Student', group: 'Gen 2027 - Class D', status: 'Active', initials: 'CS', color: 'bg-amber-100 text-amber-700' },
  { id: 178, name: 'Ea Orn', email: 'ea.orn@pnc.edu', role: 'Student', group: 'Gen 2027 - Class D', status: 'Active', initials: 'EO', color: 'bg-amber-100 text-amber-700' },
];

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');

  const [newUser, setNewUser] = useState({
    name: '',
    nickname: '',
    email: '',
    role: 'Student',
    adminRole: 'Moderator',
    group: '',
    status: 'Active'
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || user.role + 's' === roleFilter || (user.role === 'Admin' && roleFilter === 'Admins');
    return matchesSearch && matchesRole;
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = newUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-emerald-100 text-emerald-700',
      'bg-indigo-100 text-indigo-700'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const userToAdd = {
      ...newUser,
      id: Date.now(),
      initials,
      color: randomColor,
      role: newUser.role === 'Admin' ? `Admin (${newUser.adminRole})` : newUser.role
    };

    setUsers([userToAdd, ...users]);
    setIsModalOpen(false);
    setNewUser({ name: '', nickname: '', email: '', role: 'Student', adminRole: 'Moderator', group: '', status: 'Active' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
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
              User added successfully!
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
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add New User</h3>
                    <p className="text-slate-500 text-sm">Create a new account for the system.</p>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Base Role</label>
                      <select 
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      >
                        <option value="Student">Student</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    {newUser.role === 'Admin' ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Admin Specific Role</label>
                        <select 
                          value={newUser.adminRole}
                          onChange={(e) => setNewUser({...newUser, adminRole: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        >
                          <option value="Super Admin">Super Admin</option>
                          <option value="Moderator">Moderator</option>
                          <option value="Evaluator">Evaluator</option>
                          <option value="Support">Support</option>
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Class / Department</label>
                        <input 
                          required
                          type="text" 
                          placeholder="e.g. Gen 2027 - Class A"
                          value={newUser.group}
                          onChange={(e) => setNewUser({...newUser, group: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all uppercase tracking-widest"
                    >
                      Create User Account
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
