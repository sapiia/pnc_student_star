import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import EvaluationFormPage from './pages/EvaluationFormPage';
import EvaluationResultPage from './pages/EvaluationResultPage';
import EvaluationHistoryPage from './pages/EvaluationHistoryPage';
import HelpCenterPage from './pages/HelpCenterPage';
import FeedbackPage from './pages/FeedbackPage';
import ProfilePage from './pages/ProfilePage';
import FAQPage from './pages/FAQPage';
import MeetingPage from './pages/MeetingPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import TeacherStudentListPage from './pages/TeacherStudentListPage';
import TeacherProfilePage from './pages/TeacherProfilePage';
import TeacherReportsPage from './pages/TeacherReportsPage';
import TeacherMessagesPage from './pages/TeacherMessagesPage';
import TeacherNotificationsPage from './pages/TeacherNotificationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminClassStudentsPage from './pages/AdminClassStudentsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminMessagesPage from './pages/AdminMessagesPage';

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
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/meeting" element={<MeetingPage />} />
        
        {/* Teacher Portal Routes */}
        <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
        <Route path="/teacher/students" element={<TeacherStudentListPage />} />
        <Route path="/teacher/reports" element={<TeacherReportsPage />} />
        <Route path="/teacher/messages" element={<TeacherMessagesPage />} />
        <Route path="/teacher/notifications" element={<TeacherNotificationsPage />} />
        <Route path="/teacher/settings" element={<TeacherProfilePage />} />

        {/* Admin Portal Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUserManagementPage />} />
        <Route path="/admin/students/:generation/:className" element={<AdminClassStudentsPage />} />
        <Route path="/admin/evaluations" element={<AdminDashboardPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/messages" element={<AdminMessagesPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
