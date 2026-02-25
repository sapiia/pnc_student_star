// Central route configuration and helpers
export const VALID_ROLES = ["student", "education_officer", "admin"];

export const ROLE_LABELS = {
  student: "Student",
  education_officer: "Education Officer",
  admin: "Admin",
};

// Single source of truth for routes used by Sidebar, App and router
export const ROUTE_CONFIG = {
  dashboard: { path: "/dashboard", title: "Dashboard" },
  "my-evaluation": { path: "/my-evaluation", title: "My Evaluation" },
  students: { path: "/students", title: "Student List" },
  "students-class": { path: "/students/class/:classGroup", title: "Class Students" },
  generations: { path: "/generations", title: "Manage Generations" },
  "user-management": { path: "/users", title: "Users" },
  report: { path: "/report", title: "Report" },
  profile: { path: "/profile", title: "Profile" },
  settings: { path: "/settings", title: "Settings" },
  "new-evaluation": { path: "/evaluation/new", title: "New Evaluation" },
  "view-evaluation": { path: "/evaluation/view", title: "Evaluation Detail" },
};

// Role => allowed page keys (match Sidebar keys)
const ROLE_ALLOWED = {
  student: [
    "dashboard",
    "my-evaluation",
    "new-evaluation",
    "view-evaluation",
    "profile",
    "settings",
  ],
  education_officer: ["dashboard", "students", "students-class", "report", "profile", "settings"],
  admin: [
    "dashboard",
    "generations",
    "students-class",
    "user-management",
    "report",
    "profile",
    "settings",
  ],
};

export function getAllowedPages(role) {
  return ROLE_ALLOWED[role] || ROLE_ALLOWED.student;
}

export function getPageTitle(pageKey) {
  return ROUTE_CONFIG[pageKey]?.title || "Dashboard";
}

export function getCurrentPageFromPath(pathname) {
  if (!pathname) return "dashboard";
  if (pathname === "/dashboard") return "dashboard";
  if (pathname === "/my-evaluation") return "my-evaluation";
  if (pathname === "/students") return "students";
  if (pathname.startsWith("/students/class/")) return "students-class";
  if (pathname === "/generations") return "generations";
  if (pathname === "/users") return "user-management";
  if (pathname === "/report") return "report";
  if (pathname === "/profile") return "profile";
  if (pathname === "/settings") return "settings";
  if (pathname === "/evaluation/new") return "new-evaluation";
  if (pathname === "/evaluation/view") return "view-evaluation";
  return "dashboard";
}

export default ROUTE_CONFIG;
