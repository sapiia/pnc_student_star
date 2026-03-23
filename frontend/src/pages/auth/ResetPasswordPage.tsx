import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import AuthPageFooter from '../../components/auth/AuthPageFooter';
import AuthPageHeader from '../../components/auth/AuthPageHeader';
import AuthStatusMessage from '../../components/auth/AuthStatusMessage';
import ResetPasswordForm from '../../components/auth/reset-password/ResetPasswordForm';
import ResetPasswordIntro from '../../components/auth/reset-password/ResetPasswordIntro';
import useResetPasswordPage from './useResetPasswordPage';

const LOGIN_PATH = '/';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => (searchParams.get('token') || '').trim(), [searchParams]);

  const {
    email,
    loadingToken,
    error,
    success,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    submitting,
    setPassword,
    setConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleSubmit
  } = useResetPasswordPage({
    token,
    onSuccessRedirect: () => navigate(LOGIN_PATH)
  });

  const handleBackToLogin = () => {
    navigate(LOGIN_PATH);
  };

  const showInvalidState = !loadingToken && !!error && !email && !success;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AuthPageHeader
        prompt="Remember your password now?"
        actionLabel="Log In"
        onHomeClick={handleBackToLogin}
        onActionClick={handleBackToLogin}
      />

      <main className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[520px] rounded-xl border border-primary/5 bg-white p-8 shadow-xl shadow-primary/5 lg:p-10"
        >
          <ResetPasswordIntro />

          {loadingToken ? (
            <p className="text-sm font-semibold text-slate-500">Validating reset link...</p>
          ) : showInvalidState ? (
            <AuthStatusMessage tone="error" message={error} />
          ) : (
            <ResetPasswordForm
              email={email}
              password={password}
              confirmPassword={confirmPassword}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              submitting={submitting}
              error={email ? error : ''}
              success={success}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onTogglePassword={togglePasswordVisibility}
              onToggleConfirmPassword={toggleConfirmPasswordVisibility}
              onSubmit={handleSubmit}
            />
          )}
        </motion.div>
      </main>

      <AuthPageFooter />
    </div>
  );
}
