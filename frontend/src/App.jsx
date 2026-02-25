import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/footer";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import { AppRoutes } from "./routes/AppRoutes";
import { VALID_ROLES, ROLE_LABELS, getCurrentPageFromPath, getPageTitle, getAllowedPages, ROUTE_CONFIG } from "./routes/routeConfig";

/**
 * AUTH LAYOUT COMPONENT
 * Displays login/register forms with branding
 * Used before user authentication
 */

function AuthLayout({ onLogin, onRegister, registeredRole }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === "/register";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-white to-cyan-50 p-4 md:p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-between gap-6 md:gap-10">
        <div className="flex flex-1 items-center justify-center gap-6 md:gap-10">
          <div className="hidden max-w-md rounded-[28px] border border-amber-200/60 bg-white/90 p-8 shadow-xl backdrop-blur lg:block">
            <p className="inline-flex rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              PNC Student Star
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900">One Portal, Three Roles</h1>
            <p className="mt-4 text-slate-600">Use one account flow for students, education officers, and admins with tailored dashboards after sign-in.</p>
            <div className="mt-6 space-y-3 text-sm text-slate-700">
              <p className="rounded-xl bg-amber-50 px-3 py-2">Student: submit and review evaluations</p>
              <p className="rounded-xl bg-cyan-50 px-3 py-2">Education Officer: monitor class performance</p>
              <p className="rounded-xl bg-orange-50 px-3 py-2">Admin: manage users, generations, and reports</p>
            </div>
          </div>
          {isRegister ? (
            <Register onRegister={onRegister} onSwitchToLogin={() => navigate("/login")} />
          ) : (
            <Login
              onLogin={onLogin}
              onSwitchToRegister={() => navigate("/register")}
              registeredRole={registeredRole}
            />
          )}
        </div>
        <Footer compact />
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * UTILITIES
   */

  // Get stored value from localStorage with error handling
  const getStoredValue = (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  };

  // Validate and normalize user data with default role
  const normalizeUser = (user) => {
    if (!user) return null;
    const role = VALID_ROLES.includes(user.role) ? user.role : "student";
    return { ...user, role };
  };

  /**
   * STATE MANAGEMENT
   */

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(() =>
    normalizeUser(getStoredValue("pnc_registered_user"))
  );
  const [sessionUser, setSessionUser] = useState(() =>
    normalizeUser(getStoredValue("pnc_session_user"))
  );

  /**
   * USER AUTHENTICATION STATE
   */

  const isAuthenticated = Boolean(sessionUser);
  const userRole = sessionUser?.role || "student";
  const allowedPages = useMemo(() => getAllowedPages(userRole), [userRole]);

  // Determine active page from current URL path
  const currentPage = useMemo(
    () => getCurrentPageFromPath(location.pathname),
    [location.pathname]
  );

  /**
   * PERSISTENCE FUNCTIONS
   * Save user data to localStorage
   */

  const saveRegisteredUser = (user) => {
    setRegisteredUser(user);
    localStorage.setItem("pnc_registered_user", JSON.stringify(user));
  };

  const saveSessionUser = (user) => {
    setSessionUser(user);
    localStorage.setItem("pnc_session_user", JSON.stringify(user));
  };

  /**
   * AUTHENTICATION HANDLERS
   */

  // Handle user registration
  const handleRegister = (payload) => {
    // Validate required fields
    if (!payload.name || !payload.email || !payload.password || !payload.role) {
      return "Please complete all fields.";
    }
    // Validate role exists
    if (!VALID_ROLES.includes(payload.role)) {
      return "Invalid role selected.";
    }

    // Save and login user
    saveRegisteredUser(payload);
    saveSessionUser({
      name: payload.name,
      email: payload.email,
      role: payload.role,
    });
    navigate("/dashboard");
    return "";
  };

  // Handle user login
  const handleLogin = (email, password) => {
    // Check if account exists
    if (!registeredUser) {
      return "No account found. Please register first.";
    }
    // Validate credentials
    if (
      registeredUser.email !== email ||
      registeredUser.password !== password
    ) {
      return "Invalid email or password.";
    }

    // Create session
    saveSessionUser({
      name: registeredUser.name,
      email: registeredUser.email,
      role: registeredUser.role || "student",
    });
    navigate("/dashboard");
    return "";
  };

  // Handle user logout
  const handleLogout = () => {
    setSessionUser(null);
    localStorage.removeItem("pnc_session_user");
    navigate("/login");
  };

  /**
   * RENDER: NOT AUTHENTICATED
   * Show login/register forms
   */
  if (!isAuthenticated) {
    if (location.pathname !== "/login" && location.pathname !== "/register") {
      return <Navigate to="/login" replace />;
    }
    return (
      <AuthLayout
        onLogin={handleLogin}
        onRegister={handleRegister}
        registeredRole={registeredUser?.role}
      />
    );
  }

  /**
   * RENDER: REDIRECT AUTHENTICATED
   * Prevent authenticated users from viewing auth pages
   */
  if (location.pathname === "/login" || location.pathname === "/register") {
    return <Navigate to="/dashboard" replace />;
  }

  /**
   * RENDER: MAIN APP LAYOUT
   * Sidebar + Navbar + Routes + Footer
   */
  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebar
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
        activePage={
          currentPage === "classStudents"
            ? "students"
            : currentPage === "viewEvaluation"
              ? "my-evaluation"
              : currentPage
        }
        onNavigate={(pageKey) => {
          // Validate access before navigation
          if (!allowedPages.includes(pageKey)) {
            navigate("/dashboard");
            setIsSidebarOpen(false);
            return;
          }
          navigate(ROUTE_CONFIG[pageKey]?.path || "/dashboard");
          setIsSidebarOpen(false);
        }}
        onLogout={handleLogout}
        userRole={sessionUser?.role}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* NAVBAR */}
        <Navbar
          onMenuClick={() => setIsSidebarOpen(true)}
          currentPageTitle={getPageTitle(currentPage)}
          userName={sessionUser?.name}
          userRoleLabel={ROLE_LABELS[sessionUser?.role] || "Student"}
        />

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6">
          <AppRoutes
            userRole={userRole}
            allowedPages={allowedPages}
            navigate={navigate}
            location={location}
          />
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
