import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Star, 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { motion } from 'motion/react';

interface TeacherSidebarProps {
  className?: string;
}

export default function TeacherSidebar({ className }: TeacherSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: Users, label: 'Student List', path: '/teacher/students' },
    { icon: Bell, label: 'Notifications', path: '/teacher/notifications' },
    { icon: MessageSquare, label: 'Message Admin', path: '/teacher/messages' },
    { icon: BarChart3, label: 'Reports', path: '/teacher/reports' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' },
  ];

  return (
    <motion.aside 
      animate={{ width: isCollapsed ? 80 : 256 }}
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
          "p-6 flex items-center gap-3 cursor-pointer overflow-hidden",
          isCollapsed ? "justify-center" : ""
        )} 
        onClick={() => navigate('/teacher/dashboard')}
      >
        <div className="bg-primary size-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
          <Star className="w-6 h-6 fill-white" />
        </div>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-w-0"
          >
            <h1 className="text-sm font-black leading-tight text-slate-900 truncate">PNC Student Star</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Teacher Portal</p>
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
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-600 hover:bg-slate-50",
                isCollapsed ? "justify-center px-0" : ""
              )}
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
              "flex items-center gap-3 bg-slate-50 p-3 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all group relative",
              isCollapsed ? "justify-center p-2" : ""
            )} 
            onClick={() => navigate('/teacher/settings')}
          >
            <div className="size-10 rounded-xl overflow-hidden bg-slate-200 shrink-0 border-2 border-white shadow-sm">
              <img alt="Ms. Sarah J." src="https://picsum.photos/seed/sarah/100/100" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 truncate">Ms. Sarah J.</p>
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
            onClick={() => navigate('/')}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-rose-500 transition-all text-[10px] font-black uppercase tracking-widest group relative",
              isCollapsed ? "px-0" : ""
            )}
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
    </motion.aside>
  );
}
