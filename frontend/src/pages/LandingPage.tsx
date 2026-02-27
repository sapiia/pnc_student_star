import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  School, 
  Shield, 
  X, 
  Send, 
  MessageCircle, 
  Mail, 
  Phone,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, FormEvent } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSupportSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setShowSupportModal(false);
        setIsSubmitted(false);
      }, 2000);
    }, 1500);
  };

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
          <button 
            onClick={() => setShowSupportModal(true)}
            className="hidden md:block text-sm font-medium text-slate-600 hover:text-primary transition-colors"
          >
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
                  className="w-full border border-slate-200 flex items-center justify-center gap-3 py-3.5 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all mb-3"
                >
                  <School className="w-5 h-5 text-primary" />
                  Login as teacher
                </button>

                <button 
                  type="button"
                  onClick={() => navigate('/admin/dashboard')}
                  className="w-full border border-slate-200 flex items-center justify-center gap-3 py-3.5 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all"
                >
                  <Shield className="w-5 h-5 text-primary" />
                  Login as admin
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
            <button 
              onClick={() => setShowSupportModal(true)}
              className="text-sm font-medium text-slate-500 hover:text-primary transition-colors"
            >
              Help Center
            </button>
            <a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="#">Resources</a>
          </div>
        </div>
      </footer>

      {/* Contact Support Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSupportModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col h-full max-h-[90vh]">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">Contact Support</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">We're here to help</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowSupportModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-8">
                  {isSubmitted ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-12 text-center space-y-4"
                    >
                      <div className="size-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h4 className="text-2xl font-black text-slate-900">Message Sent!</h4>
                      <p className="text-slate-500 font-bold max-w-xs mx-auto">
                        Thank you for reaching out. Our support team will get back to you within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSupportSubmit} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                          <input 
                            required
                            type="text" 
                            placeholder="John Doe"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                          <input 
                            required
                            type="email" 
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none">
                          <option>Technical Issue</option>
                          <option>Account Access</option>
                          <option>Evaluation Help</option>
                          <option>General Inquiry</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                        <textarea 
                          required
                          rows={4}
                          placeholder="How can we help you today?"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        />
                      </div>

                      <div className="pt-4">
                        <button 
                          disabled={isSubmitting}
                          type="submit"
                          className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-70"
                        >
                          {isSubmitting ? (
                            <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Send Message
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <Mail className="w-4 h-4 text-primary" />
                          <div className="min-w-0">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email Us</p>
                            <p className="text-[10px] font-bold text-slate-900 truncate">support@pnc.edu</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <Phone className="w-4 h-4 text-primary" />
                          <div className="min-w-0">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Call Us</p>
                            <p className="text-[10px] font-bold text-slate-900 truncate">+855 12 345 678</p>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
