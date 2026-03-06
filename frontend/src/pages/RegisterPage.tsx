<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { Star, School, User, Mail, Lock, LockKeyhole, Users, BadgeCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-primary/10 bg-white/80 backdrop-blur-md px-6 md:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-3 text-primary cursor-pointer" onClick={() => navigate('/')}>
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <Star className="w-5 h-5 fill-white" />
          </div>
          <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">PNC Student Star</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center justify-center rounded-xl h-10 px-4 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors">
            Help Center
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        {/* Registration Card Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-xl shadow-2xl overflow-hidden border border-primary/5"
        >
          {/* Visual Side (Left) */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-primary relative overflow-hidden text-white">
            <div className="z-10">
              <h1 className="text-4xl font-black leading-tight mb-4">Empowering the next generation of stars.</h1>
              <p className="text-primary-100 text-lg opacity-90">Manage your courses, connect with peers, and track your academic journey in one place.</p>
            </div>
            <div className="relative z-10">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <School className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">PNC Academy</p>
                    <p className="text-sm opacity-80">Official Student Portal</p>
                  </div>
                </div>
                <p className="text-sm italic opacity-90">"The Student Star platform has revolutionized how we coordinate class activities and share resources."</p>
              </div>
            </div>
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/40 rounded-full -ml-48 -mb-48 blur-3xl" />
          </div>

          {/* Form Side (Right) */}
          <div className="p-8 md:p-12 bg-white flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create an Account</h2>
              <p className="text-slate-500 mt-2">Join the PNC Student Star community today.</p>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 placeholder:text-slate-400" 
                    placeholder="John Doe" 
                    type="text"
=======
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Mail, User, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

type InvitePayload = {
  email: string;
  role: string;
  firstName?: string;
  lastName?: string | null;
  name?: string;
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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  useEffect(() => {
    if (!inviteData) return;
    const seededFirst = (inviteData.firstName || '').trim();
    const seededLast = (inviteData.lastName || '').trim();
    if (seededFirst || seededLast) {
      setFirstName(seededFirst);
      setLastName(seededLast);
      return;
    }
    const full = (inviteData.name || '').trim();
    if (!full) return;
    const parts = full.split(/\s+/);
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' '));
  }, [inviteData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inviteData) {
      setError('Invite data is missing.');
      return;
    }
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    if (!normalizedFirstName) {
      setError('First name is required.');
      return;
    }
    if (!normalizedLastName) {
      setError('Last name is required.');
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
          name: `${normalizedFirstName} ${normalizedLastName}`.trim(),
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
                <p className="text-sm text-slate-700"><span className="font-bold">Role:</span> {inviteData?.role}</p>
                {inviteData?.generation && inviteData?.className && (
                  <p className="text-sm text-slate-700"><span className="font-bold">Class:</span> Gen {inviteData.generation} - Class {inviteData.className}</p>
                )}
                {inviteData?.studentId && (
                  <p className="text-sm text-slate-700"><span className="font-bold">Student ID:</span> {inviteData.studentId}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white h-12 pl-12 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="Enter first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      type="text"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white h-12 pl-12 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="Enter last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      type="text"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 h-12 pl-12 pr-4 text-sm text-slate-700 outline-none"
                    value={inviteData?.email || ''}
                    type="email"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white h-12 pl-12 pr-12 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
                    type="password"
>>>>>>> a3e2dfeb7c5c4820d4486e41acd8e74c95f114f9
=======
                    type={showPassword ? 'text' : 'password'}
>>>>>>> 641dfaaa9411ba3b82489df9e28254769a9e2f8c
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
<<<<<<< HEAD
              {/* Email Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 placeholder:text-slate-400" 
                    placeholder="email@example.com" 
                    type="email"
=======

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white h-12 pl-12 pr-12 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
<<<<<<< HEAD
                    type="password"
>>>>>>> a3e2dfeb7c5c4820d4486e41acd8e74c95f114f9
=======
                    type={showConfirmPassword ? 'text' : 'password'}
>>>>>>> 641dfaaa9411ba3b82489df9e28254769a9e2f8c
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
<<<<<<< HEAD
              {/* Role & Class Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5 ml-1">I am a...</label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <select className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 appearance-none cursor-pointer">
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>
                </div>
                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5 ml-1">Class</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <select className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 appearance-none cursor-pointer">
                      <option value="" disabled selected>Select class</option>
                      <option value="we-2024">WE-2024</option>
                      <option value="we-2025">WE-2025</option>
                      <option value="we-2026">WE-2026</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Password Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 placeholder:text-slate-400" 
                      placeholder="••••••••" 
                      type={showPassword ? 'text' : 'password'}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5 ml-1">Confirm Password</label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 placeholder:text-slate-400" 
                      placeholder="••••••••" 
                      type="password"
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Register Button */}
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              {/* Terms */}
              <p className="text-xs text-slate-500 text-center px-4">
                By signing up, you agree to our <a className="text-primary font-semibold underline underline-offset-2" href="#">Terms of Service</a> and <a className="text-primary font-semibold underline underline-offset-2" href="#">Privacy Policy</a>.
              </p>
            </form>
            {/* Footer Link */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-500">
                Already have an account? 
                <button 
                  onClick={() => navigate('/')}
                  className="text-primary font-bold hover:underline underline-offset-4 decoration-2 transition-all ml-1"
                >
                  Log in here
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      <footer className="p-6 text-center text-sm text-slate-400">
        <p>© 2024 PNC Student Star. All rights reserved.</p>
      </footer>
=======

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
>>>>>>> a3e2dfeb7c5c4820d4486e41acd8e74c95f114f9
    </div>
  );
}
