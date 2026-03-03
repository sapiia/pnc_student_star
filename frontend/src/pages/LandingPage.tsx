import { useNavigate } from 'react-router-dom';
import { Star, School } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/70 backdrop-blur-md px-6 lg:px-20 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">PNC Student Star</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="hidden md:block text-sm font-medium text-slate-600 hover:text-primary transition-colors">
            Contact Support
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="bg-primary/10 text-primary px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/20 transition-all"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero & Login Section */}
      <main className="flex-grow flex flex-col">
        <section className="relative px-6 lg:px-20 py-12 lg:py-24 grid lg:grid-cols-2 gap-16 items-center overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -z-10" />

          {/* Left Content: Hero Message */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Academic Excellence Platform
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
              Empower Your Growth with <span className="text-primary">PNC Student Star</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-lg">
              A holistic platform for students to track their development across 8 key life areas. Visualize progress, gain insights, and reach your full potential.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 bg-cover"
                    style={{ backgroundImage: `url(https://picsum.photos/seed/${i + 10}/100/100)` }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-slate-500">Joined by 2,000+ students this semester</p>
            </div>
          </motion.div>

          {/* Right Content: Login Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-[440px] bg-white p-8 lg:p-10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 backdrop-blur-xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                <p className="text-slate-500 text-sm mt-1">Please enter your details to access your dashboard.</p>
              </div>
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input 
                    className="w-full px-4 py-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400" 
                    placeholder="name@student.pnc.edu" 
                    type="email"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <button 
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input 
                    className="w-full px-4 py-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                    placeholder="••••••••" 
                    type="password"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  Login to Account
                </button>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-slate-400 font-medium">Alternative access</span></div>
                </div>
                <button 
                  type="button"
                  onClick={() => navigate('/teacher/dashboard')}
                  className="w-full border border-slate-200 flex items-center justify-center gap-3 py-3.5 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                >
                  <School className="w-5 h-5 text-primary" />
                  Login as teacher
                </button>
              </form>
            </div>
            {/* Floating visual elements for the card */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center"
            >
              <Star className="w-8 h-8 text-primary fill-primary" />
            </motion.div>
          </motion.div>
        </section>

        {/* Features Brief */}
        <section className="px-6 lg:px-20 py-20 bg-white">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4 p-6 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                <Star className="w-8 h-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Self-Evaluation</h3>
              <p className="text-slate-600 leading-relaxed">
                Understand your strengths through guided assessments that cover academic, social, and personal growth areas.
              </p>
            </div>
            <div className="flex flex-col gap-4 p-6 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                <Star className="w-8 h-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Progress Tracking</h3>
              <p className="text-slate-600 leading-relaxed">
                Visualize your growth journey over time with interactive charts and real-time data visualizations of your star profile.
              </p>
            </div>
            <div className="flex flex-col gap-4 p-6 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                <Star className="w-8 h-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Teacher Feedback</h3>
              <p className="text-slate-600 leading-relaxed">
                Receive direct insights, qualitative feedback, and mentorship from your educators to help guide your development.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-20 py-12 border-t border-slate-100 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-1 rounded">
                <Star className="w-4 h-4 text-primary fill-primary" />
              </div>
              <span className="font-bold text-slate-900">PNC Student Star</span>
            </div>
            <p className="text-sm text-slate-500">© 2024 Passerelles numériques Cambodia. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-8 justify-center">
            <a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="#">Help Center</a>
            <a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="#">Resources</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
