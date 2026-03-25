import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import AuthPageFooter from '../../components/auth/AuthPageFooter';
import AuthPageHeader from '../../components/auth/AuthPageHeader';
import ForgotPasswordForm from '../../components/auth/forgot-password/ForgotPasswordForm';
import ForgotPasswordIntro from '../../components/auth/forgot-password/ForgotPasswordIntro';
import ForgotPasswordSupport from '../../components/auth/forgot-password/ForgotPasswordSupport';
import useForgotPasswordPage from './useForgotPasswordPage';

const LOGIN_PATH = '/';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { email, error, success, submitting, setEmail, handleSubmit } = useForgotPasswordPage();

  const handleGoHome = () => {
    navigate(LOGIN_PATH);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <AuthPageHeader
        prompt="Remember your password?"
        actionLabel="Log In"
        onHomeClick={handleGoHome}
        onActionClick={handleGoHome}
      />

      <main className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[480px] rounded-xl border border-primary/5 bg-white p-8 shadow-xl shadow-primary/5 lg:p-10"
        >
          <ForgotPasswordIntro />
          <ForgotPasswordForm
            email={email}
            errorMessage={error}
            successMessage={success}
            isSubmitting={submitting}
            onEmailChange={setEmail}
            onSubmit={handleSubmit}
          />
          <ForgotPasswordSupport onBackToLogin={handleGoHome} />
        </motion.div>
      </main>

      <AuthPageFooter />
    </div>
  );
}
