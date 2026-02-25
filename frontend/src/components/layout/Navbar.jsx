import { useState } from "react";
import { Search, Bell, User, ChevronDown, Menu } from "lucide-react";
import logo from "../../assets/images/logo.png";
import Notification from "../ui/Notification";

function Navbar({
  onMenuClick = () => {},
  currentPageTitle = "Dashboard",
  userName = "User",
  userRoleLabel = "Student",
}) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      title: "Welcome",
      message: "You are logged in successfully.",
      variant: "success",
    },
    {
      id: "n2",
      title: "Reminder",
      message: "Please complete pending evaluations this week.",
      variant: "info",
    },
  ]);

  const handleDismiss = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1 hover:bg-gray-100 rounded-md"
        >
          <Menu size={24} className="text-gray-600" />
        </button>

        <div className="lg:hidden flex items-center flex-shrink-0">
          <div className="h-9 w-9 shadow-sm">
            <img
              src={logo}
              alt="PNC Logo"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="ml-2">
            <h2 className="text-xs font-bold text-gray-700 leading-none">
              PNC
            </h2>
            <p className="text-[10px] font-medium text-gray-500">
              Student's Star
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-sm font-medium ml-4">
          <span className="text-gray-400">{userRoleLabel}</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700">{currentPageTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
        <div className="relative hidden md:block w-40 lg:w-96 group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <div className="relative">
          <button
            aria-label="View notifications"
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            className="group relative p-2.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <Bell
              size={20}
              className="group-hover:rotate-[15deg] transition-transform"
            />
            {notifications.length > 0 ? (
              <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
              </span>
            ) : null}
          </button>
            {isNotificationOpen ? (
              <div className="absolute right-0 mt-2 w-[320px] max-h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50">
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notifications
                </p>
                <div className="space-y-2">
                  {notifications.length > 0 ? (
                    notifications.map((item) => (
                      <Notification
                        key={item.id}
                        title={item.title}
                        message={item.message}
                        variant={item.variant}
                        onClose={() => handleDismiss(item.id)}
                      />
                    ))
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      No new notifications.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="hidden md:block h-8 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent mx-2"></div>
          <button className="group flex items-center gap-3 p-1.5 pr-2 hover:bg-white hover:shadow-md hover:shadow-gray-100 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-100 active:scale-[0.98] focus:outline-none">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                {userName}
              </p>
              <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-wider mt-0.5">
                {userRoleLabel}
              </p>
            </div>

            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:shadow-blue-200 transition-shadow">
                <User size={20} strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            <ChevronDown
              size={16}
              className="hidden md:block text-gray-400 group-hover:text-blue-500 group-hover:translate-y-0.5 transition-all"
            />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
