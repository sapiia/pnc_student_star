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
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';

import AdminSidebar from '../../components/layout/sidebar/admin/AdminSidebar';
import AdminMobileNav from '../../components/common/AdminMobileNav';

import { cn } from '../../lib/utils';

// Helper function to extract generation from user data
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

const STATS = [
  { label: 'Evaluation Period', value: 'Oct 01 - Dec 15', trend: 'Active', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'System Health', value: '99.9%', trend: 'Online', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

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
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<string>('generation');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/users?sortBy=${sortBy}&sortOrder=${sortOrder}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          const students = data.filter((u: any) => u.role.toLowerCase() === 'student');
          const teachers = data.filter((u: any) => u.role.toLowerCase() === 'teacher');
          setTeacherCount(teachers.length);
          
          const genStats: Record<string, any> = {};
          students.forEach(s => {
             const gen = extractGeneration(s);
             const cls = s.class || s.major || 'Unknown Class';
             if (!genStats[gen]) genStats[gen] = { total: 0, classesMap: {} };
             genStats[gen].total += 1;
             if (!genStats[gen].classesMap[cls]) genStats[gen].classesMap[cls] = 0;
             genStats[gen].classesMap[cls] += 1;
          });

          const formattedStats: any = {
            total: students.length.toLocaleString(),
          };
          
          Object.keys(genStats).forEach(gen => {
             const clsMap = genStats[gen].classesMap;
             formattedStats[gen.toLowerCase().replace(/\s/g, '')] = {
                title: gen,
                total: genStats[gen].total,
                classes: Object.keys(clsMap).map(c => ({ name: c, count: clsMap[c] }))
             };
          });
          setStudentStats(formattedStats);

          const toDisplayNameFromEmail = (email: string) => {
            const username = email.split('@')[0] || 'User';
            return username.split(/[._-]+/).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
          };
          
          const mappedUsers = data.slice(0, 5).map((apiUser: any) => {
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
                profileImage: String(apiUser.profile_image || '').trim() || 'http://localhost:3001/uploads/logo/star_gmail_logo.jpg',
                initials: resolvedName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2)
             };
          });
          setRecentUsers(mappedUsers);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [sortBy, sortOrder]);

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
                  {studentStats && Object.keys(studentStats).filter(k => k !== 'total').map((key) => {
                    const gen = studentStats[key];
                    return (
                      <div key={key} className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                            {gen.title === 'Unknown Gen' ? 'Other' : (gen.title.toLowerCase().startsWith('gen') ? gen.title : `Gen ${gen.title}`)}
                          </p>
                          <p className="text-xs font-black text-blue-600">{gen.total}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {gen.classes.map((c: any) => (
                            <button 
                              key={c.name} 
                              onClick={() => navigate(`/admin/students/${gen.title}/${c.name}`)}
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
                    onClick={() => navigate('/admin/users')}
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
                <div className="flex items-center gap-4">
                  <h3 className="font-black text-slate-900">User Management</h3>
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
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" />
                  Add User
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
                    {recentUsers.map((user) => (
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
                          <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing 1 to 4 of 1,440 users</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Previous</button>
                  <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-colors">Next</button>
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
                      <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Next Assessment End</label>
                    <div className="relative">
                      <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                  </div>
                  
                  <button className="w-full py-3 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all mt-2">
                    Set Window
                  </button>
                  
                  <p className="text-[10px] text-center text-slate-400 font-bold leading-relaxed px-4">
                    Setting a new window will notify all teachers and students via the internal messaging system.
                  </p>
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
    </div>
  );
}


