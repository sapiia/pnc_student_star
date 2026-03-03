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
        <Route path="/teacher/settings" element={<TeacherProfilePage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
