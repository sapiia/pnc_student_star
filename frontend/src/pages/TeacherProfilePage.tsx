import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Building2, 
  BookOpen, 
  Bell, 
  ShieldCheck, 
  Save, 
  Trash2, 
  Plus,
  Search,
  Settings,
  Camera,
  CheckCircle2
} from 'lucide-react';
import TeacherSidebar from '../components/TeacherSidebar';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function TeacherProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'academic', label: 'Academic Details', icon: BookOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Privacy', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
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
              Profile updated successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/teacher/notifications')}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">Dr. Alexander Smith</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">Senior Lecturer</p>
              </div>
              <div className="size-10 rounded-full overflow-hidden border-2 border-primary/20">
                <img src="https://picsum.photos/seed/alexander/100/100" alt="Dr. Alexander Smith" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8">
            {/* Left Column: Tabs */}
            <div className="w-full lg:w-64 shrink-0 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold",
                    activeTab === tab.id 
                      ? "bg-primary/10 text-primary shadow-sm" 
                      : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
              
              <div className="mt-10 p-4 bg-slate-100 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Storage Usage</p>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-primary w-[65%]" />
                </div>
                <p className="text-[10px] text-slate-500">1.3 GB of 2.0 GB used</p>
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="flex-1 space-y-8">
              {/* Profile Card */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/5 to-transparent" />
                <div className="relative flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative">
                    <div className="size-32 rounded-[40px] overflow-hidden border-4 border-white shadow-xl">
                      <img src="https://picsum.photos/seed/alexander/200/200" alt="Dr. Alexander Smith" />
                    </div>
                    <button className="absolute -bottom-2 -right-2 size-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dr. Alexander Smith</h2>
                    <p className="text-slate-500 font-medium mt-1">Senior Lecturer, Computer Science Department</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">Full-Time Faculty</span>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Email Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Sections */}
              <div className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-200 space-y-12">
                {/* Personal Information */}
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <User className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Personal Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue="Alexander Smith"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Professional Email</label>
                      <input 
                        type="email" 
                        defaultValue="a.smith@university.edu"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      />
                      <p className="text-[10px] text-slate-400">Primary contact for student evaluations and system alerts.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Department</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all appearance-none">
                        <option>Computer Science</option>
                        <option>Mathematics</option>
                        <option>Physics</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Subject Expertise</label>
                      <input 
                        type="text" 
                        defaultValue="Software Architecture, AI"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                </section>

                {/* Class Assignments */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Class Assignments (Fall 2024)</h3>
                    </div>
                    <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                      <Plus className="w-4 h-4" />
                      Add Class
                    </button>
                  </div>
                  <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200/50">
                          <th className="px-8 py-4">Course Code</th>
                          <th className="px-8 py-4">Title</th>
                          <th className="px-8 py-4">Section</th>
                          <th className="px-8 py-4">Enrollment</th>
                          <th className="px-8 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/50">
                        {[
                          { code: 'CS101', title: 'Intro to Programming', section: 'Section A', count: '42 Students' },
                          { code: 'CS302', title: 'Advanced Algorithms', section: 'Section B', count: '28 Students' },
                        ].map((cls) => (
                          <tr key={cls.code} className="hover:bg-white transition-colors">
                            <td className="px-8 py-5 text-sm font-bold text-primary">{cls.code}</td>
                            <td className="px-8 py-5 text-sm font-medium text-slate-700">{cls.title}</td>
                            <td className="px-8 py-5 text-sm text-slate-500">{cls.section}</td>
                            <td className="px-8 py-5 text-sm text-slate-500">{cls.count}</td>
                            <td className="px-8 py-5 text-right">
                              <button className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Notification Preferences */}
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Bell className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Notification Preferences</h3>
                  </div>
                  <div className="space-y-6">
                    {[
                      { title: 'Weekly Feedback Summary', desc: 'A batched report of all course evaluations delivered every Monday morning.', enabled: true },
                      { title: 'System Alerts & Maintenance', desc: 'Important messages about portal updates and academic deadlines.', enabled: false },
                    ].map((pref) => (
                      <div key={pref.title} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{pref.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{pref.desc}</p>
                        </div>
                        <button className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          pref.enabled ? "bg-primary" : "bg-slate-300"
                        )}>
                          <div className={cn(
                            "absolute top-1 size-4 bg-white rounded-full transition-all",
                            pref.enabled ? "left-7" : "left-1"
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-slate-200">
                <p className="text-[10px] text-slate-400 italic">Last updated: 12 Oct 2024 at 14:32 PM</p>
                <div className="flex gap-4">
                  <button className="px-8 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all">
                    Discard
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
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
