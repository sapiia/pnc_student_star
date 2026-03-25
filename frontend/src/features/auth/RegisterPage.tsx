import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import AuthPageHeader from '../../components/auth/AuthPageHeader';
import AuthStatusMessage from '../../components/auth/AuthStatusMessage';
import RegisterForm from '../../components/auth/register/RegisterForm';
import RegisterIntro from '../../components/auth/register/RegisterIntro';
import useRegisterPage from './useRegisterPage';

const LOGIN_PATH = '/';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = useMemo(
    () => (searchParams.get('invite') || '').trim(),
    [searchParams]
  );

  const {
    inviteData,
    loadingInvite,
    error,
    success,
    firstName,
    lastName,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    submitting,
    setFirstName,
    setLastName,
    setPassword,
    setConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleSubmit
  } = useRegisterPage({
    inviteToken,
    onRegistered: (path) => navigate(path)
  });

  const handleBackToLogin = () => {
    navigate(LOGIN_PATH);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AuthPageHeader
        prompt="Already have an account?"
        actionLabel="Back"
        onHomeClick={handleBackToLogin}
        onActionClick={handleBackToLogin}
        showActionArrow
      />

      <main className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[520px] rounded-xl border border-primary/5 bg-white p-8 shadow-xl shadow-primary/5 lg:p-10"
        >
          <RegisterIntro />

          {loadingInvite ? (
            <p className="text-sm font-semibold text-slate-500">
              Validating invitation...
            </p>
          ) : error && !inviteData ? (
            <AuthStatusMessage tone="error" message={error} />
          ) : inviteData ? (
            <RegisterForm
              inviteData={inviteData}
              firstName={firstName}
              lastName={lastName}
              password={password}
              confirmPassword={confirmPassword}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              submitting={submitting}
              error={error}
              success={success}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onTogglePassword={togglePasswordVisibility}
              onToggleConfirmPassword={toggleConfirmPasswordVisibility}
              onSubmit={handleSubmit}
            />
          ) : null}
        </motion.div>
      </main>
    </div>
  );
}
