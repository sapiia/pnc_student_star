import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Star, 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Settings,
  ChevronDown,
  ChevronRight,
  User,
  HelpCircle,
  Info,
  Calendar,
  ChevronLeft,
  Menu,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(
    location.pathname === '/profile' || 
    location.pathname === '/help' || 
    location.pathname === '/faq'
  );

  // Auto-expand settings if on a sub-page
  useEffect(() => {
    if (['/profile', '/help', '/faq'].includes(location.pathname)) {
      setIsSettingsExpanded(true);
    }
  }, [location.pathname]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Star, label: 'Start Evaluation', path: '/evaluate', isAction: true },
    { icon: FileText, label: 'My Evaluations', path: '/history' },
    { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
    { icon: Calendar, label: 'Meeting', path: '/meeting', hasNotification: true },
  ];

  const settingsSubItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: HelpCircle, label: 'Help Center', path: '/help' },
    { icon: Info, label: 'FAQ', path: '/faq' },
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
        onClick={() => navigate('/dashboard')}
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
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Student Portal</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {!isCollapsed && (
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Main Menu</p>
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
                  : item.isAction 
                    ? "text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10"
                    : "text-slate-600 hover:bg-slate-50",
                isCollapsed ? "justify-center px-0" : ""
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0", 
                isActive ? "text-white" : item.isAction ? "text-primary" : "group-hover:text-primary"
              )} />
              {!isCollapsed && (
                <span className={cn("text-sm font-bold", item.isAction && !isActive && "text-primary")}>{item.label}</span>
              )}
              {item.hasNotification && (
                <span className={cn(
                  "absolute rounded-full ring-2 ring-white",
                  isCollapsed ? "top-2 right-2 size-2 bg-red-500" : "right-4 top-1/2 -translate-y-1/2 size-2 bg-red-500"
                )} />
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}

        <div className="pt-4 space-y-1">
          {!isCollapsed && (
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Support & Settings</p>
          )}
          
          <button
            onClick={() => {
              if (isCollapsed) {
                setIsCollapsed(false);
                setIsSettingsExpanded(true);
              } else {
                setIsSettingsExpanded(!isSettingsExpanded);
              }
            }}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
              isSettingsExpanded && !isCollapsed ? "text-primary bg-primary/5" : "text-slate-600 hover:bg-slate-50",
              isCollapsed ? "justify-center px-0" : ""
            )}
          >
            <div className="flex items-center gap-3">
              <Settings className={cn("w-5 h-5 shrink-0", isSettingsExpanded && !isCollapsed ? "text-primary" : "group-hover:text-primary")} />
              {!isCollapsed && <span className="text-sm font-bold">Settings</span>}
            </div>
            {!isCollapsed && (
              <motion.div
                animate={{ rotate: isSettingsExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 opacity-50" />
              </motion.div>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Settings
              </div>
            )}
          </button>
          
          <AnimatePresence>
            {isSettingsExpanded && !isCollapsed && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pl-4 space-y-1"
              >
                {settingsSubItems.map((subItem) => {
                  const isSubActive = location.pathname === subItem.path;
                  return (
                    <button
                      key={subItem.path}
                      onClick={() => navigate(subItem.path)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group",
                        isSubActive 
                          ? "text-primary font-black bg-primary/5" 
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <subItem.icon className={cn("w-4 h-4 shrink-0", isSubActive ? "text-primary" : "group-hover:text-primary")} />
                      <span className="text-xs font-bold">{subItem.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* User Profile Section */}
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
            onClick={() => navigate('/profile')}
          >
            <div className="size-10 rounded-xl overflow-hidden bg-slate-200 shrink-0 border-2 border-white shadow-sm">
              <img alt="Alex Johnson" src="https://picsum.photos/seed/alex/100/100" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 truncate">Alex Johnson</p>
                <p className="text-[10px] text-slate-500 font-bold truncate">Grade 11 Student</p>
              </div>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Profile
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowLogoutConfirm(true)}
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

      {/* Logout Confirmation Modal */}
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
                  Are you sure you want to log out of your student account?
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
