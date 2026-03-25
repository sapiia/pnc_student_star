import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import { ReactNode } from 'react';
// import useScrollReveal from './hooks/useScrollReveal';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import ErrorBoundary from '../components/common/ErrorBoundary';

import LandingPage from '../features/shared/LandingPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
import DashboardPage from '../features/student/DashboardPage';
import EvaluationFormPage from '../features/student/EvaluationFormPage';
import EvaluationResultPage from '../features/student/EvaluationResultPage';
import EvaluationHistoryPage from '../features/student/EvaluationHistoryPage';
import HelpCenterPage from '../features/shared/HelpCenterPage';
import FeedbackPage from '../features/student/FeedbackPage';
import NotificationsPage from '../features/student/NotificationsPage';
import ProfilePage from '../features/shared/ProfilePage';
import FAQPage from '../features/shared/FAQPage';
import MeetingPage from '../features/shared/MeetingPage';
import TeacherDashboardPage from '../features/teacher/TeacherDashboardPage';
import TeacherStudentListPage from '../features/teacher/TeacherStudentListPage';
import TeacherStudentProfilePage from '../features/teacher/TeacherStudentProfilePage';
import TeacherProfilePage from '../features/teacher/TeacherProfilePage';
import TeacherReportsPage from '../features/teacher/TeacherReportsPage';
import TeacherMessagesPage from '../features/teacher/TeacherMessagesPage';
import TeacherNotificationsPage from '../features/teacher/TeacherNotificationsPage';
import TeacherAttentionStudentsPage from '../features/teacher/TeacherAttentionStudentsPage';
import AdminDashboardPage from '../features/admin/AdminDashboardPage';
import AdminUserManagementPage from '../features/admin/AdminUserManagementPage';
import AdminSettingsPage from '../features/admin/AdminSettingsPage';
import AdminClassStudentsPage from '../features/admin/AdminClassStudentsPage';
import AdminTeacherRecordsPage from '../features/admin/AdminTeacherRecordsPage';
import AdminRecordsPage from '../features/admin/AdminRecordsPage';
import AdminReportsPage from '../features/admin/AdminReportsPage';
import AdminMessagesPage from '../features/admin/AdminMessagesPage';
import AdminNotificationsPage from '../features/admin/AdminNotificationsPage';

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
  const normalizedRole = user?.role?.toLowerCase() || '';

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(normalizedRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// ScrollRevealManager component
const ScrollRevealManager = () => {
  const location = useLocation();
  // useScrollReveal([location.pathname]);
  return null;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollRevealManager />
        <Suspense fallback={<LoadingSpinner />}>
          <ErrorBoundary>
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
          </ErrorBoundary>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

