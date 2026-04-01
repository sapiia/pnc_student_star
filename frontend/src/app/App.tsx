import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useScrollReveal from '../hooks/useScrollReveal';
import LandingPage from '../features/shared/LandingPage';
import RegisterPage from '../features/auth/RegisterPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
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

export default function App() {
  return (
    <Router>
      <ScrollRevealManager />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/evaluate" element={<EvaluationFormPage />} />
        <Route path="/results" element={<EvaluationResultPage />} />
        <Route path="/history" element={<EvaluationHistoryPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/messages" element={<MeetingPage />} />
        <Route path="/meeting" element={<Navigate to="/messages" replace />} />
        
        {/* Teacher Portal Routes */}
        <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
        <Route path="/teacher/students" element={<TeacherStudentListPage />} />
        <Route path="/teacher/students/:id" element={<TeacherStudentProfilePage />} />
        <Route path="/teacher/reports" element={<TeacherReportsPage />} />
        <Route path="/teacher/messages" element={<TeacherMessagesPage />} />
        <Route path="/teacher/notifications" element={<TeacherNotificationsPage />} />
        <Route path="/teacher/settings" element={<TeacherProfilePage />} />
        <Route path="/teacher/attention" element={<TeacherAttentionStudentsPage />} />

        {/* Admin Portal Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUserManagementPage />} />
        <Route path="/admin/students/:generation/:className" element={<AdminClassStudentsPage />} />
        <Route path="/admin/teachers" element={<AdminTeacherRecordsPage />} />
        <Route path="/admin/admins" element={<AdminRecordsPage />} />
        <Route path="/admin/evaluations" element={<AdminDashboardPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/messages" element={<AdminMessagesPage />} />
        <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function ScrollRevealManager() {
  const location = useLocation();
  useScrollReveal([location.pathname]);
  return null;
}
