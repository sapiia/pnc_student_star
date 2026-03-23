import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import useScrollReveal from './hooks/useScrollReveal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/shared/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/student/DashboardPage';
import EvaluationFormPage from './pages/student/EvaluationFormPage';
import EvaluationResultPage from './pages/student/EvaluationResultPage';
import EvaluationHistoryPage from './pages/student/EvaluationHistoryPage';
import HelpCenterPage from './pages/shared/HelpCenterPage';
import FeedbackPage from './pages/student/FeedbackPage';
import NotificationsPage from './pages/student/NotificationsPage';
import ProfilePage from './pages/shared/ProfilePage';
import FAQPage from './pages/shared/FAQPage';
import MeetingPage from './pages/shared/MeetingPage';
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage';
import TeacherStudentListPage from './pages/teacher/TeacherStudentListPage';
import TeacherStudentProfilePage from './pages/teacher/TeacherStudentProfilePage';
import TeacherProfilePage from './pages/teacher/TeacherProfilePage';
import TeacherReportsPage from './pages/teacher/TeacherReportsPage';
import TeacherMessagesPage from './pages/teacher/TeacherMessagesPage';
import TeacherNotificationsPage from './pages/teacher/TeacherNotificationsPage';
import TeacherAttentionStudentsPage from './pages/teacher/TeacherAttentionStudentsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUserManagementPage from './pages/admin/AdminUserManagementPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminClassStudentsPage from './pages/admin/AdminClassStudentsPage';
import AdminTeacherRecordsPage from './pages/admin/AdminTeacherRecordsPage';
import AdminRecordsPage from './pages/admin/AdminRecordsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import ErrorBoundary from './components/common/ErrorBoundary';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
  </div>
);

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const normalizedRole = String(user?.role || '').trim().toLowerCase();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(normalizedRole)) {
    return <Navigate to="/" replace />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};

// ScrollRevealManager component (fixed duplicate)
const ScrollRevealManager = () => {
  const location = useLocation();
  useScrollReveal([location.pathname]);
  return null;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollRevealManager />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Student Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/evaluate" element={
              <ProtectedRoute allowedRoles={['student']}>
                <EvaluationFormPage />
              </ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute allowedRoles={['student']}>
                <EvaluationResultPage />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute allowedRoles={['student']}>
                <EvaluationHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="/help" element={
              <ProtectedRoute allowedRoles={['student']}>
                <HelpCenterPage />
              </ProtectedRoute>
            } />
            <Route path="/feedback" element={
              <ProtectedRoute allowedRoles={['student']}>
                <FeedbackPage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute allowedRoles={['student']}>
                <NotificationsPage />
              </ProtectedRoute>
            } />
            
            {/* Teacher Portal Routes */}
            <Route path="/teacher" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <Navigate to="/teacher/dashboard" replace />
              </ProtectedRoute>
            } />
            <Route path="/teacher/dashboard" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/teacher/students" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherStudentListPage />
              </ProtectedRoute>
            } />
            <Route path="/teacher/students/:id" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherStudentProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/teacher/reports" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/teacher/messages" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherMessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/teacher/notifications" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherNotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="/teacher/settings" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/teacher/attention" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherAttentionStudentsPage />
              </ProtectedRoute>
            } />

            {/* Admin Portal Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUserManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/students/:generation/:className" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminClassStudentsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/teachers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTeacherRecordsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/admins" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminRecordsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/evaluations" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/messages" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminMessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/notifications" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminNotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettingsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/faq" element={
              <ProtectedRoute>
                <FAQPage />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <MeetingPage />
              </ProtectedRoute>
            } />
            <Route path="/meeting" element={
              <ProtectedRoute>
                <Navigate to="/messages" replace />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

