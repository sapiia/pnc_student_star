import { useState } from "react";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  FileBarChart2,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  Users,
  UserRoundPlus,
  User,
  ClipboardCheck,
} from "lucide-react";
import logo from "../../assets/images/logo.png";

function Sidebar({
  isMobileOpen = false,
  onMobileClose = () => {},
  activePage = "dashboard",
  onNavigate = () => {},
  onLogout = () => {},
  userRole = "student",
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const allMenuItems = [
    { key: "dashboard", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { key: "my-evaluation", name: "My Evaluation", icon: <ClipboardCheck size={20} /> },
    { key: "students", name: "Students", icon: <Users size={20} /> },
    { key: "generations", name: "Generations", icon: <CalendarDays size={20} /> },
    { key: "user-management", name: "Users", icon: <UserRoundPlus size={20} /> },
    { key: "report", name: "Report", icon: <FileBarChart2 size={20} /> },
    { key: "profile", name: "Profile", icon: <User size={20} /> },
    { key: "settings", name: "Settings", icon: <Settings size={20} /> },
  ];
  const roleMenuKeys = {
    student: ["dashboard", "my-evaluation", "profile", "settings"],
    education_officer: ["dashboard", "students", "report", "profile", "settings"],
    admin: ["dashboard", "generations", "user-management", "report", "profile", "settings"],
  };
  const allowedKeys = roleMenuKeys[userRole] || roleMenuKeys.student;
  const menuItems = allMenuItems.filter((item) => allowedKeys.includes(item.key));

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] lg:hidden"
          onClick={onMobileClose}/>
      )}

      <aside
        className={`fixed inset-y-0 left-0 lg:relative flex flex-col h-screen bg-[#1e293b] transition-all duration-300 ease-in-out z-50 ${
          isCollapsed ? "w-20" : "w-64"
        } ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
          
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-12 z-50 h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-[#1e293b] text-slate-400 hover:text-white shadow-md transition-all">
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`flex items-center p-4 ml-2 ${isCollapsed ? "justify-center" : "gap-3"}`}>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg shadow-black/20 flex-shrink-0 p-1">
          <img
            src={logo}
            alt="PNC Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {!isCollapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="text-lg font-bold text-white leading-tight">PNC</h1>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
              Student's Star
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1">
        {menuItems.map((item, index) => {
          const isRoutable = Boolean(item.key);
          const isActive = isRoutable && item.key === activePage;

          return (
          <button
            type="button"
            key={index}
            className={`flex items-center rounded-xl px-3 py-3 transition-all duration-200 group ${
              isCollapsed ? "justify-center" : "gap-4"
            } ${
              isActive
                ? "bg-indigo-500/15 text-indigo-300"
                : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
            } w-full text-left`}
            onClick={() => {
              if (isRoutable) {
                onNavigate(item.key);
              }
            }}
          >
            <div
              className={`${isCollapsed ? "" : "group-hover:scale-110"} transition-transform`}
            >
              {item.icon}
            </div>
            {!isCollapsed && (
              <span className="text-sm font-semibold whitespace-nowrap">
                {item.name}
              </span>
            )}

            {isCollapsed && (
              <div className="absolute left-16 scale-0 rounded bg-white px-2 py-1 text-xs text-slate-900 font-bold transition-all group-hover:scale-100 whitespace-nowrap z-[100]">
                {item.name}
              </div>
            )}
          </button>
        )})}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={onLogout}
          className={`flex items-center rounded-xl p-2 transition-all w-full hover:bg-red-500/10 text-slate-400 hover:text-red-400 ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700/50 group-hover:bg-red-500/20 flex-shrink-0">
            <LogOut size={18} />
          </div>
          {!isCollapsed && <span className="text-sm font-bold">Logout</span>}
        </button>
      </div>
    </aside>
    </>
  );
}

export default Sidebar;
