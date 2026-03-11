import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Mail, User, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

type InvitePayload = {
  email: string;
  role: string;
  generation?: string | null;
  className?: string | null;
  studentId?: string | null;
  expiresAt?: number;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = useMemo(() => (searchParams.get('invite') || '').trim(), [searchParams]);

  const [inviteData, setInviteData] = useState<InvitePayload | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const validateInvite = async () => {
      if (!inviteToken) {
        setError('Missing invite token. Please open the registration link from your email.');
        setLoadingInvite(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/invite/validate?token=${encodeURIComponent(inviteToken)}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Invalid or expired invite link.');
          setLoadingInvite(false);
          return;
        }

        setInviteData(data);
      } catch (_err) {
        setError('Failed to validate invite link.');
      } finally {
        setLoadingInvite(false);
      }
    };

    validateInvite();
  }, [inviteToken]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inviteData) {
      setError('Invite data is missing.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/invite/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: inviteToken,
          name,
          password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to complete registration.');
        return;
      }

      const redirectPath = data.redirectPath || '/dashboard';
      setSuccess('Registration completed. Redirecting...');
      setTimeout(() => navigate(redirectPath), 1200);
    } catch (_err) {
      setError('Failed to complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex items-center justify-between border-b border-primary/10 px-6 py-4 lg:px-10 bg-white">
        <div className="flex items-center gap-3 text-primary cursor-pointer" onClick={() => navigate('/')}>
          <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
            <Star className="w-5 h-5 fill-primary text-primary" />
          </div>
          <h2 className="text-slate-900 text-lg font-bold tracking-tight">PNC Student Star</h2>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 rounded-lg h-10 px-4 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[520px] w-full bg-white p-8 lg:p-10 rounded-xl shadow-xl shadow-primary/5 border border-primary/5"
        >
          <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight mb-2">Complete Registration</h1>
          <p className="text-slate-500 text-sm mb-8">Use your invitation link to activate your account.</p>

          {loadingInvite ? (
            <p className="text-sm font-semibold text-slate-500">Validating invitation...</p>
          ) : error && !inviteData ? (
            <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
              <p className="text-sm font-semibold text-rose-700">{error}</p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Invitation Details</p>
                <p className="text-sm text-slate-700"><span className="font-bold">Email:</span> {inviteData?.email}</p>
                <p className="text-sm text-slate-700"><span className="font-bold">Role:</span> {inviteData?.role}</p>
                {inviteData?.generation && inviteData?.className && (
                  <p className="text-sm text-slate-700"><span className="font-bold">Class:</span> Gen {inviteData.generation} - Class {inviteData.className}</p>
                )}
                {inviteData?.studentId && (
                  <p className="text-sm text-slate-700"><span className="font-bold">Student ID:</span> {inviteData.studentId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name (Optional)</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white h-12 pl-12 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white h-12 pl-12 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white h-12 pl-12 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center rounded-lg h-12 px-5 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-70"
              >
                {submitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}

