import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/shared/LandingPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/student/DashboardPage';
import EvaluationFormPage from './pages/student/EvaluationFormPage';
import EvaluationResultPage from './pages/student/EvaluationResultPage';
import EvaluationHistoryPage from './pages/student/EvaluationHistoryPage';
import HelpCenterPage from './pages/shared/HelpCenterPage';
import FeedbackPage from './pages/student/FeedbackPage';
import NotificationsPage from './pages/shared/NotificationsPage';
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

export default function App() {
  return (
    <Router>
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
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
