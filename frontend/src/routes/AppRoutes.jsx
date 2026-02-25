import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Dashboard from "../pages/students/Dashboard";
import TeacherDashboard from "../pages/teachers/TeacherDashboard";
import StudentList from "../pages/teachers/StudentList";
import ClassStudents from "../pages/teachers/ClassStudents";
import Report from "../pages/teachers/Report";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ClassReport from "../pages/admin/ClassReport";
import AdminProfile from "../pages/admin/AdminProfile";
import AdminSettings from "../pages/admin/AdminSettings";
import UserManagement from "../pages/admin/UserManagement";
import ManageGenerations from "../pages/admin/ManageGenerations";
import TeacherProfile from "../pages/teachers/TeacherProfile";
import TeacherSettings from "../pages/teachers/TeacherSettings";
import NewEvaluation from "../pages/students/NewEvaluation";
import MyEvaluation from "../pages/students/MyEvaluation";
import ViewEvaluation from "../pages/students/ViewEvaluation";
import Profile from "../pages/students/Profile";
import Settings from "../pages/students/Settings";
import { ROUTE_CONFIG } from "./routeConfig";

// Small guard component used by routes to verify allowed pages
function ProtectedRoute({ allowed, page, children }) {
  if (!allowed.includes(page)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

const ClassStudentsRoute = ({ onBack }) => {
  const { classGroup = "" } = useParams();
  return (
    <ClassStudents classGroup={decodeURIComponent(classGroup)} onBack={onBack} />
  );
};

export function AppRoutes({ userRole, allowedPages, navigate, location }) {
  return (
    <Routes>
      <Route
        path={ROUTE_CONFIG.dashboard.path}
        element={
          <ProtectedRoute allowed={allowedPages} page="dashboard">
            {userRole === "education_officer" ? (
              <TeacherDashboard onOpenStudents={() => navigate(ROUTE_CONFIG.students.path)} />
            ) : userRole === "admin" ? (
              <AdminDashboard />
            ) : (
              <Dashboard onStartEvaluation={() => navigate(ROUTE_CONFIG["new-evaluation"].path)} />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE_CONFIG.students.path}
        element={
          <ProtectedRoute allowed={allowedPages} page="students">
            <StudentList onViewClass={(classGroup) => navigate(`/students/class/${encodeURIComponent(classGroup)}`)} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/students/class/:classGroup"
        element={
          <ProtectedRoute allowed={allowedPages} page="students-class">
            <ClassStudentsRoute onBack={() => navigate(ROUTE_CONFIG.students.path)} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE_CONFIG.generations.path}
        element={
          <ProtectedRoute allowed={allowedPages} page="generations">
            <ManageGenerations onViewClass={(classGroup) => navigate(`/students/class/${encodeURIComponent(classGroup)}`)} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE_CONFIG["user-management"].path}
        element={
          <ProtectedRoute allowed={allowedPages} page="user-management">
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE_CONFIG.report.path}
        element={
          <ProtectedRoute allowed={allowedPages} page="report">
            {userRole === "admin" ? <ClassReport /> : <Report />}
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE_CONFIG["my-evaluation"].path}
        element={
          <ProtectedRoute allowed={allowedPages} page="my-evaluation">
            <MyEvaluation
              onStartEvaluation={() => navigate(ROUTE_CONFIG["new-evaluation"].path)}
              onViewEvaluation={(record) => navigate(ROUTE_CONFIG["view-evaluation"].path, { state: { record } })}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE_CONFIG["view-evaluation"].path}
        element={
          <ProtectedRoute allowed={allowedPages} page="view-evaluation">
            <ViewEvaluation record={location.state?.record} onBack={() => navigate(ROUTE_CONFIG["my-evaluation"].path)} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE_CONFIG["new-evaluation"].path}
        element={
          <ProtectedRoute allowed={allowedPages} page="new-evaluation">
            <NewEvaluation onComplete={() => navigate(ROUTE_CONFIG["my-evaluation"].path)} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE_CONFIG.profile.path}
        element={
          <ProtectedRoute allowed={allowedPages} page="profile">
            {userRole === "education_officer" ? (
              <TeacherProfile />
            ) : userRole === "admin" ? (
              <AdminProfile />
            ) : (
              <Profile />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE_CONFIG.settings.path}
        element={
          <ProtectedRoute allowed={allowedPages} page="settings">
            {userRole === "education_officer" ? (
              <TeacherSettings />
            ) : userRole === "admin" ? (
              <AdminSettings />
            ) : (
              <Settings />
            )}
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={ROUTE_CONFIG.dashboard.path} replace />} />
    </Routes>
  );
}

export default AppRoutes;
