import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Bell,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import BrandLogo, { PNLogoMark } from './BrandLogo';

interface TeacherSidebarProps {
  className?: string;
}

export default function TeacherSidebar({ className }: TeacherSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileName, setProfileName] = useState('Teacher');
  const [profilePhoto, setProfilePhoto] = useState('https://picsum.photos/seed/sarah/100/100');

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: Users, label: 'Student List', path: '/teacher/students' },
    { icon: Bell, label: 'Notifications', path: '/teacher/notifications' },
    { icon: MessageSquare, label: 'Message Admin', path: '/teacher/messages' },
    { icon: BarChart3, label: 'Reports', path: '/teacher/reports' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' },
  ];

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
          String(authUser?.name || 'Teacher');
        const resolvedPhoto = String(data?.profile_image || authUser?.profile_image || '').trim();

        setProfileName(resolvedName);
        if (resolvedPhoto) setProfilePhoto(resolvedPhoto);
      } catch {
        // silent fallback to local storage values
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
        if (authUser?.name) {
          setProfileName(String(authUser.name));
        }
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

  return (
    <motion.aside 
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.34, ease: 'easeInOut' }}
      className={cn(
        "bg-white border-r border-slate-200 flex flex-col shrink-0 hidden md:flex transition-all duration-300 ease-in-out relative z-50",
        className
      )}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 size-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm z-10"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Logo Section */}
      <div 
        className={cn(
          "p-6 flex items-center gap-3 cursor-pointer overflow-hidden transition-all duration-300 ease-in-out origin-left",
          isCollapsed ? "justify-center" : ""
        )} 
        onClick={() => navigate('/teacher/dashboard')}
      >
        {isCollapsed ? (
          <motion.div
            animate={{ scale: isCollapsed ? 0.96 : 1 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <PNLogoMark className="size-10 shrink-0" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0, scale: isCollapsed ? 0.96 : 1 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="min-w-0 origin-left"
          >
            <BrandLogo title="PNC Student Star" subtitle="Teacher Portal" />
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {!isCollapsed && (
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Teacher Menu</p>
        )}
        
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out relative group origin-left",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-600 hover:bg-slate-50",
                isCollapsed ? "justify-center px-0" : ""
              )}
              style={{ transform: `scale(${isCollapsed ? 0.94 : 1})` }}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "group-hover:text-primary")} />
              {!isCollapsed && (
                <span className="text-sm font-bold">{item.label}</span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Teacher Profile Section */}
      <div className="p-4 border-t border-slate-100">
        <div className={cn(
          "flex flex-col gap-4",
          isCollapsed ? "items-center" : ""
        )}>
          <div 
            className={cn(
              "flex items-center gap-3 bg-slate-50 p-3 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all duration-300 ease-in-out group relative origin-left",
              isCollapsed ? "justify-center p-2" : ""
            )} 
            style={{ transform: `scale(${isCollapsed ? 0.94 : 1})` }}
            onClick={() => navigate('/teacher/settings')}
          >
            <div className="size-10 rounded-xl overflow-hidden bg-slate-200 shrink-0 border-2 border-white shadow-sm">
              <img alt={profileName} src={profilePhoto} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 truncate">{profileName}</p>
                <p className="text-[10px] text-slate-500 font-bold truncate">Lead Instructor</p>
              </div>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Settings
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-rose-500 transition-all duration-300 ease-in-out text-[10px] font-black uppercase tracking-widest group relative origin-left",
              isCollapsed ? "px-0" : ""
            )}
            style={{ transform: `scale(${isCollapsed ? 0.94 : 1})` }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Sign Out
              </div>
            )}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                <h3 className="text-xl font-black text-slate-900 mb-2">Sign Out?</h3>
                <p className="text-slate-500 text-sm mb-8">
                  Are you sure you want to log out of your teacher account?
                </p>
                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={() => navigate('/')}
                    className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all"
                  >
                    YES, SIGN OUT
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
    </motion.aside>
  );
}
