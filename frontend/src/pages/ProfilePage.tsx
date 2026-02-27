import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ChevronDown, 
  Lock, 
  BellRing, 
  MessageSquare, 
  ClipboardList,
  ChevronRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      
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
              <BellRing className="w-5 h-5" />
              Settings saved successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={() => navigate('/dashboard')} className="hover:text-primary">Dashboard</button>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-slate-900">Settings</span>
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <button 
              onClick={handleSave}
              className="bg-primary text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              Save Changes
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
              <p className="text-slate-500 mt-2">Update your profile, security credentials, and stay notified.</p>
            </header>

            {/* Personal Information */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Personal Information</h2>
                <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/10">
                  Active Student
                </span>
              </div>
              <div className="p-8 flex flex-col md:flex-row gap-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="size-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
                    <img src="https://picsum.photos/seed/alex/200/200" alt="Alex Johnson" />
                  </div>
                  <button className="text-sm font-bold text-primary hover:underline">Change Photo</button>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input type="text" defaultValue="Alex Johnson" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input type="email" defaultValue="alex.j@pnc.edu" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student ID</label>
                    <input type="text" defaultValue="STU-2024-001" disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed outline-none font-medium" />
                    <p className="text-[10px] text-slate-400 italic">Student ID cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Generation</label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium appearance-none">
                        <option>Gen 2026</option>
                        <option>Gen 2025</option>
                        <option>Gen 2024</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class</label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium appearance-none">
                        <option>WEB A</option>
                        <option>WEB B</option>
                        <option>MOBILE A</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Account Security */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Account Security</h2>
                <p className="text-xs text-slate-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" className="text-sm font-bold text-primary hover:underline">Forgot Password?</button>
                </div>
              </div>
            </motion.section>

            {/* Notification Preferences */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Notification Preferences</h2>
                <p className="text-xs text-slate-500 mt-1">Manage how you receive alerts and updates.</p>
              </div>
              <div className="divide-y divide-slate-50">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Evaluation Reminders</h4>
                      <p className="text-xs text-slate-500">Get notified when an evaluation is about to end.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setRemindersEnabled(!remindersEnabled)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      remindersEnabled ? "bg-primary" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 size-4 bg-white rounded-full transition-all",
                      remindersEnabled ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">New Feedback Alerts</h4>
                      <p className="text-xs text-slate-500">Receive an alert when a teacher posts new feedback.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFeedbackEnabled(!feedbackEnabled)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      feedbackEnabled ? "bg-primary" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 size-4 bg-white rounded-full transition-all",
                      feedbackEnabled ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              </div>
            </motion.section>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                Discard Changes
              </button>
              <button 
                onClick={handleSave}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
