import { useNavigate } from 'react-router-dom';
import { Star, Mail, LockKeyhole, ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-primary/10 px-6 py-4 lg:px-10 bg-white">
        <div className="flex items-center gap-3 text-primary cursor-pointer" onClick={() => navigate('/')}>
          <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
            <Star className="w-5 h-5 fill-primary text-primary" />
          </div>
          <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">PNC Student Star</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 hidden sm:block">Remember your password?</span>
          <button 
            onClick={() => navigate('/')}
            className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
          >
            Log In
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[480px] w-full bg-white p-8 lg:p-10 rounded-xl shadow-xl shadow-primary/5 border border-primary/5"
        >
          {/* Icon & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-6">
              <LockKeyhole className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight mb-3">Forgot Password?</h1>
            <p className="text-slate-500 text-base font-normal leading-relaxed">
              Enter the email address associated with your PNC Student Star account, and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Forgot Password Form */}
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Reset link sent!'); navigate('/'); }}>
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 text-sm font-semibold" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  className="flex w-full rounded-lg text-slate-900 border border-slate-200 bg-white focus:ring-2 focus:ring-primary focus:border-primary h-14 pl-12 pr-4 placeholder:text-slate-400 text-base transition-all" 
                  id="email" 
                  name="email" 
                  placeholder="e.g. name@university.edu" 
                  required 
                  type="email"
                />
              </div>
            </div>
            <div className="pt-2">
              <button 
                type="submit"
                className="w-full flex cursor-pointer items-center justify-center rounded-lg h-14 px-5 bg-primary text-white text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                Send Reset Link
              </button>
            </div>
          </form>

          {/* Navigation Links */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 text-primary text-sm font-semibold hover:underline decoration-2 underline-offset-4"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Login
            </button>
            <div className="flex items-center gap-2 text-slate-400 text-xs mt-2 uppercase tracking-widest font-bold">
              <ShieldCheck className="w-4 h-4" />
              Secure Recovery
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer Information */}
      <footer className="p-6 text-center">
        <p className="text-slate-400 text-xs">
          © 2024 PNC Student Star. All rights reserved. <br className="sm:hidden" />
          <a className="hover:text-primary underline px-1" href="#">Privacy Policy</a> • 
          <a className="hover:text-primary underline px-1" href="#">Support</a>
        </p>
      </footer>
    </div>
  );
}
