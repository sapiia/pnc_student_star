import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  AlertCircle,
  User,
  HelpCircle,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import BrandLogo, { PNLogoMark } from '../ui/BrandLogo';

const menuItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: FileText, label: 'History', path: '/history' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: Bell, label: 'Alerts', path: '/notifications' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const drawerMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'My Evaluations', path: '/history' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: MessageSquare, label: 'Teacher Feedback', path: '/feedback' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: User, label: 'My Profile', path: '/profile' },
  { icon: HelpCircle, label: 'Help Center', path: '/help' },
  { icon: Info, label: 'FAQ', path: '/faq' },
];

export default function StudentMobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileName, setProfileName] = useState('Student');
  const [profilePhoto, setProfilePhoto] = useState('https://picsum.photos/seed/student/100/100');
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    const loadProfileIdentity = async () => {
      try {
        const raw = localStorage.getItem('auth_user');
        if (!raw) return;
        const authUser = JSON.parse(raw);
        const userId = Number(authUser?.id);
        if (!Number.isInteger(userId) || userId <= 0) return;

        if (authUser?.name) setProfileName(String(authUser.name));
        if (authUser?.student_id) setStudentId(String(authUser.student_id));
        if (authUser?.profile_image) {
          setProfilePhoto(String(authUser.profile_image));
        } else {
          const savedPhoto = localStorage.getItem(`profile_photo_${userId}`);
          if (savedPhoto) setProfilePhoto(savedPhoto);
        }

        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        const data = await response.json();
        if (!response.ok) return;

        const resolvedName =
          String(data?.name || '').trim() ||
          [data?.first_name, data?.last_name].filter(Boolean).join(' ').trim() ||
          String(authUser?.name || 'Student');
        const resolvedPhoto = String(data?.profile_image || authUser?.profile_image || '').trim();
        const resolvedId = String(data?.student_id || data?.resolved_student_id || authUser?.student_id || '').trim();

        setProfileName(resolvedName);
        setStudentId(resolvedId);
        if (resolvedPhoto) setProfilePhoto(resolvedPhoto);
      } catch {
        // silent fallback
      }
    };

    loadProfileIdentity();
  }, []);

  useEffect(() => {
    const refreshIdentity = () => {
      try {
        const raw = localStorage.getItem('auth_user');
        if (!raw) return;
        const authUser = JSON.parse(raw);
        const userId = Number(authUser?.id);
        if (!Number.isInteger(userId) || userId <= 0) return;
        if (authUser?.name) setProfileName(String(authUser.name));
        if (authUser?.student_id) setStudentId(String(authUser.student_id));
        if (authUser?.profile_image) {
          setProfilePhoto(String(authUser.profile_image));
        } else {
          const savedPhoto = localStorage.getItem(`profile_photo_${userId}`);
          if (savedPhoto) setProfilePhoto(savedPhoto);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('profile-photo-updated', refreshIdentity);
    window.addEventListener('profile-updated', refreshIdentity);
    return () => {
      window.removeEventListener('profile-photo-updated', refreshIdentity);
      window.removeEventListener('profile-updated', refreshIdentity);
    };
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Top Header Bar - visible only on small screens */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <PNLogoMark className="size-9 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900 leading-tight truncate">PNC Student Star</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Student Portal</p>
          </div>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="size-10 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[200] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <BrandLogo title="PNC Student Star" subtitle="Student Portal" />
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="size-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation */}
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Main Menu</p>
                {drawerMenuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsDrawerOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative",
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                      <span className="text-sm font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Drawer Profile & Logout */}
              <div className="p-4 border-t border-slate-100">
                <div
                  className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all mb-3"
                  onClick={() => {
                    navigate('/profile');
                    setIsDrawerOpen(false);
                  }}
                >
                  <div className="size-10 rounded-xl overflow-hidden bg-slate-200 shrink-0 border-2 border-white shadow-sm">
                    <img alt={profileName} src={profilePhoto} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">{profileName}</p>
                    <p className="text-[10px] text-slate-500 font-bold truncate">{studentId ? `ID: ${studentId}` : 'Student'}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-slate-400 hover:text-rose-500 transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar - visible only on small screens */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around px-2 py-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative min-w-0",
                  isActive ? "text-primary" : "text-slate-400"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                <span className={cn(
                  "text-[9px] font-bold truncate max-w-[64px]",
                  isActive ? "text-primary font-black" : "text-slate-400"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="student-tab-indicator"
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full"
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  />
                )}
              </button>
            );
          })}
        </div>
        {/* Safe area for phones with home indicator */}
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-rose-500" />
              <div className="flex flex-col items-center text-center">
                <div className="size-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Logout?</h3>
                <p className="text-slate-500 text-sm mb-8">
                  Are you sure you want to log out of your student account?
                </p>
                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={() => navigate('/')}
                    className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all"
                  >
                    YES, LOG OUT
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
