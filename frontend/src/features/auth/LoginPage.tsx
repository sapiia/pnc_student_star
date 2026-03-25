import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import AuthPageHeader from '../../components/auth/AuthPageHeader';
import AuthStatusMessage from '../../components/auth/AuthStatusMessage';
import AuthPasswordField from '../../components/auth/AuthPasswordField';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setSubmitting(true);

    try {
      const redirectPath = await login(email.trim().toLowerCase(), password);
      navigate(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AuthPageHeader
        prompt="Need an account?"
        actionLabel="Register"
        onHomeClick={() => navigate('/')}
        onActionClick={handleRegister}
      />

      <main className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[520px] rounded-xl border border-primary/5 bg-white p-8 shadow-xl shadow-primary/5 lg:p-10"
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
            <p className="mt-2 text-slate-600">Sign in to your account</p>
          </div>

          {error && <AuthStatusMessage tone="error" message={error} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-lg shadow-sm ring-1 ring-inset ring-slate-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                placeholder="your@email.com"
                required
              />
            </div>

            <AuthPasswordField
              id="password"
              label="Password"
              value={password}
              onChange={setPassword}
              isVisible={showPassword}
              onToggleVisibility={() => setShowPassword(!showPassword)}
              placeholder="Enter your password"
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting || authLoading}
              className="w-full rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-white shadow-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting || authLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

