import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, AlertCircle, Settings } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import BrandLogo, { PNLogoMark } from '../../ui/BrandLogo';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  hasNotification?: boolean;
  badgeCount?: number;
  isAction?: boolean;
}

interface BaseSidebarProps {
  className?: string;
  menuItems: MenuItem[];
  profileName: string;
  profilePhoto: string;
  profileRole: string;
  defaultPhoto?: string;
  isSettingsEnabled?: boolean;
  settingsItems?: MenuItem[];
  onSettingsClick?: () => void;
  settingsPath?: string;
}

export default function BaseSidebar({
  className,
  menuItems,
  profileName,
  profilePhoto,
  profileRole,
  defaultPhoto = 'http://localhost:3001/uploads/logo/star_gmail_logo.jpg',
  isSettingsEnabled = false,
  settingsItems = [],
  onSettingsClick,
  settingsPath
}: BaseSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  useEffect(() => {
    if (['/profile', '/help', '/faq'].includes(location.pathname)) {
      setIsSettingsExpanded(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);


  const menuButtonClass = "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out relative group origin-left";
  const profileButtonClass = "flex items-center gap-3 bg-slate-50 p-3 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all duration-300 ease-in-out group relative origin-left";

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={cn("bg-white border-r border-slate-200 flex flex-col shrink-0 relative z-50", className)}
    >
      {/* Toggle */}
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-20 size-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm z-10">
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Logo */}
      <div className={cn("p-5 flex items-center gap-3 cursor-pointer overflow-hidden transition-all duration-300 ease-in-out origin-left", isCollapsed ? "justify-center" : "")} onClick={() => navigate(menuItems[0]?.path || '/')}>
        {isCollapsed ? (
          <motion.div animate={{ scale: 0.96 }} transition={{ duration: 0.28 }}>
            <PNLogoMark className="size-10 shrink-0" />
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, scale: 0.96 }} transition={{ duration: 0.28 }} className="min-w-0 origin-left">
            <BrandLogo title="PNC Student Star" subtitle={profileRole} />
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {!isCollapsed && <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Main Menu</p>}
        
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)} className={cn(menuButtonClass, isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-50", isCollapsed ? "justify-center px-0" : "")} style={{ transform: `scale(${isCollapsed ? 0.94 : 1})` }}>
              <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "group-hover:text-primary")} />
              {!isCollapsed && <span className="text-sm font-bold">{item.label}</span>}
              {item.hasNotification && item.badgeCount && item.badgeCount > 0 && !isCollapsed && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                  {item.badgeCount > 99 ? '99+' : item.badgeCount}
                </span>
              )}
              {item.hasNotification && (!item.badgeCount || item.badgeCount <= 0) && (
                <span className={cn("absolute rounded-full ring-2 ring-white", isCollapsed ? "top-2 right-2 size-2 bg-red-500" : "right-4 top-1/2 -translate-y-1/2 size-2 bg-red-500")} />
              )}
              {isCollapsed && <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">{item.label}</div>}
            </button>
          );
        })}

        {/* Settings Section */}
        {isSettingsEnabled && settingsItems.length > 0 && (
          <div className="pt-4 space-y-1">
            {!isCollapsed && <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Settings</p>}
            <button onClick={() => isCollapsed ? (setIsCollapsed(false), setIsSettingsExpanded(true)) : setIsSettingsExpanded(!isSettingsExpanded)} className={cn(menuButtonClass, isSettingsExpanded && !isCollapsed ? "text-primary bg-primary/5" : "text-slate-600 hover:bg-slate-50", isCollapsed ? "justify-center px-0" : "")} style={{ transform: `scale(${isCollapsed ? 0.94 : 1})` }}>
              <Settings className={cn("w-5 h-5 shrink-0", isSettingsExpanded && !isCollapsed ? "text-primary" : "group-hover:text-primary")} />
              {!isCollapsed && <span className="text-sm font-bold">Settings</span>}
              {isCollapsed && <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Settings</div>}
            </button>
            <AnimatePresence>
              {isSettingsExpanded && !isCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-4 space-y-1">
                  {settingsItems.map((subItem) => {
                    const isSubActive = location.pathname === subItem.path;
                    return (
                      <button key={subItem.path} onClick={() => navigate(subItem.path)} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group", isSubActive ? "text-primary font-black bg-primary/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}>
                        <subItem.icon className={cn("w-4 h-4 shrink-0", isSubActive ? "text-primary" : "group-hover:text-primary")} />
                        <span className="text-xs font-bold">{subItem.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-slate-100">
        <div className={cn("flex flex-col gap-4", isCollapsed ? "items-center" : "")}>
          <div className={cn(profileButtonClass, isCollapsed ? "justify-center p-2" : "")} style={{ transform: `scale(${isCollapsed ? 0.94 : 1})` }} onClick={() => navigate(settingsPath || '/')}>
            <div className="size-10 rounded-xl overflow-hidden bg-slate-200 shrink-0 border-2 border-white shadow-sm"><img alt={profileName} src={profilePhoto || defaultPhoto} /></div>
            {!isCollapsed && <div className="flex-1 min-w-0"><p className="text-xs font-black text-slate-900 truncate">{profileName}</p><p className="text-[10px] text-slate-500 font-bold truncate">{profileRole}</p></div>}
            {isCollapsed && <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Profile</div>}
          </div>
          <button onClick={() => setShowLogoutConfirm(true)} className={cn("w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-rose-500 transition-all duration-300 ease-in-out text-[10px] font-black uppercase tracking-widest group relative origin-left", isCollapsed ? "px-0" : "")} style={{ transform: `scale(${isCollapsed ? 0.94 : 1})` }}>
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
            {isCollapsed && <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Sign Out</div>}
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogoutConfirm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-rose-500" />
              <div className="flex flex-col items-center text-center">
                <div className="size-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6"><AlertCircle className="w-8 h-8" /></div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Sign Out?</h3>
                <p className="text-slate-500 text-sm mb-8">Are you sure you want to log out?</p>
                <div className="flex flex-col w-full gap-3">
                  <button onClick={() => navigate('/')} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all">YES, SIGN OUT</button>
                  <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">CANCEL</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
