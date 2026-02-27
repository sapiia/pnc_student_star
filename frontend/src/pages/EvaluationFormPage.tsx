import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  ArrowLeft, 
  ArrowRight, 
  Lightbulb, 
  Check,
  Home,
  Briefcase,
  Users,
  Heart,
  Smile,
  Brain,
  CreditCard,
  Wrench,
  ClipboardList,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CRITERIA } from '../constants';
import StarRating from '../components/StarRating';
import { cn } from '../lib/utils';

export default function EvaluationFormPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(-1); // -1 for Welcome step
  const [scores, setScores] = useState<Record<string, number>>({});
  const [reflections, setReflections] = useState<Record<string, string>>({});

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const criterion = currentStep >= 0 && currentStep < CRITERIA.length ? CRITERIA[currentStep] : null;

  const handleNext = () => {
    if (currentStep < CRITERIA.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStart = () => {
    setCurrentStep(0);
  };

  const handleFinish = () => {
    setShowConfirm(true);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      navigate('/results', { state: { scores, reflections } });
    }, 1500);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/dashboard');
    }
  };

  const getIcon = (iconName: string, className?: string) => {
    switch (iconName) {
      case 'Home': return <Home className={className} />;
      case 'Briefcase': return <Briefcase className={className} />;
      case 'Users': return <Users className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Smile': return <Smile className={className} />;
      case 'Brain': return <Brain className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'Wrench': return <Wrench className={className} />;
      default: return <Star className={className} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <Star className="w-5 h-5 fill-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-primary">PNC Student Star</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
            >
              Cancel
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-none text-slate-900">Alex Johnson</p>
              <p className="text-xs text-slate-500 mt-1">Student ID: STU-2024-001</p>
            </div>
            <div className="size-10 rounded-full border-2 border-primary/20 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/alex/100/100')" }} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Stepper */}
        <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex items-center justify-between min-w-[800px]">
            {CRITERIA.map((c, idx) => {
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              return (
                <div key={c.key} className="flex flex-col items-center gap-2 flex-1 relative">
                  <div className={`size-10 rounded-full flex items-center justify-center font-bold z-10 transition-all ${
                    isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 
                    isCompleted ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                    {c.label}
                  </span>
                  {idx < CRITERIA.length - 1 && (
                    <div className={`absolute top-5 left-1/2 w-full h-[2px] transition-colors ${idx < currentStep ? 'bg-primary' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
            {/* Summary Step */}
            <div className="flex flex-col items-center gap-2 flex-1 relative">
              <div className={`size-10 rounded-full flex items-center justify-center font-bold z-10 transition-all ${
                currentStep === CRITERIA.length ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-200 text-slate-400'
              }`}>
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${currentStep === CRITERIA.length ? 'text-primary' : 'text-slate-400'}`}>
                Summary
              </span>
              <div className={`absolute top-5 -left-1/2 w-full h-[2px] transition-colors ${currentStep === CRITERIA.length ? 'bg-primary' : 'bg-slate-200'}`} />
            </div>
          </div>
        </div>

        {/* Evaluation Form Content */}
        <AnimatePresence mode="wait">
          {currentStep === -1 ? (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border border-primary/10 rounded-3xl shadow-xl overflow-hidden"
            >
              <div className="p-12 text-center space-y-8">
                <div className="size-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto">
                  <Star className="w-12 h-12 fill-primary" />
                </div>
                <div className="max-w-xl mx-auto space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Start Your Q1 2024 Evaluation</h2>
                  <p className="text-slate-500 font-bold leading-relaxed">
                    Welcome to your quarterly self-evaluation. This is a space for honest reflection on your growth, challenges, and achievements across 8 key development areas.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="size-8 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm mb-3">
                      <Star className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Rate Yourself</p>
                    <p className="text-[10px] text-slate-500 font-bold">Score each area from 1 to 5 stars.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="size-8 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm mb-3">
                      <FileText className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Reflect</p>
                    <p className="text-[10px] text-slate-500 font-bold">Write at least 50 characters of detail.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="size-8 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm mb-3">
                      <Users className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Get Feedback</p>
                    <p className="text-[10px] text-slate-500 font-bold">Mentors will review and guide you.</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleStart}
                    className="bg-primary hover:bg-primary/90 text-white px-12 py-5 rounded-2xl font-black shadow-xl shadow-primary/30 transition-all flex items-center gap-3 mx-auto uppercase tracking-widest text-sm"
                  >
                    Begin Evaluation
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated time: 10-15 minutes</p>
                </div>
              </div>
            </motion.div>
          ) : criterion ? (
            <motion.div 
              key={criterion.key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-primary/10 rounded-3xl shadow-xl overflow-hidden"
            >
              {/* Form Header */}
              <div className="p-10 border-b border-primary/5 flex gap-8 items-start">
                <div className={cn("size-20 rounded-2xl flex items-center justify-center shrink-0", criterion.bgColor, criterion.color)}>
                  {getIcon(criterion.icon, "w-10 h-10")}
                </div>
                <div>
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                    Step {currentStep + 1} of {CRITERIA.length}
                  </span>
                  <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">{criterion.label}</h2>
                  <p className="text-slate-500 font-bold leading-relaxed">
                    Reflect on your {criterion.label.toLowerCase()} this quarter. What is going well? What could be improved?
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-10 space-y-10">
                {/* Rating Component */}
                <div className="space-y-4">
                  <label className="block text-xl font-black text-slate-900 tracking-tight">
                    How would you rate yourself?
                  </label>
                  <StarRating 
                    readonly={false}
                    rating={scores[criterion.key] || 0}
                    onRate={(r) => setScores({ ...scores, [criterion.key]: r })}
                    starClassName="w-12 h-12"
                  />
                </div>

                {/* Reflection Component */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xl font-black text-slate-900 tracking-tight" htmlFor="reflection">
                      Self-Reflection & Details
                    </label>
                    <span className={cn(
                      "text-xs font-bold",
                      (reflections[criterion.key]?.length || 0) >= 50 ? "text-emerald-500" : "text-slate-400"
                    )}>
                      {reflections[criterion.key]?.length || 0} / 50 characters
                    </span>
                  </div>
                  <textarea 
                    className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary placeholder:text-slate-400 p-6 text-slate-700 font-medium outline-none transition-all" 
                    id="reflection" 
                    placeholder={`Describe your ${criterion.label.toLowerCase()} situation this quarter...`}
                    rows={6}
                    value={reflections[criterion.key] || ''}
                    onChange={(e) => setReflections({ ...reflections, [criterion.key]: e.target.value })}
                  />
                </div>

                {/* Tip Box */}
                <div className="flex items-start gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="text-primary mt-0.5">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-600 font-bold leading-relaxed">
                    <strong className="text-primary">Tip:</strong> Be honest with yourself. This reflection helps your mentors provide better support and understand any external challenges you might be facing.
                  </p>
                </div>
              </div>

              {/* Form Footer */}
              <div className="bg-slate-50 p-8 flex items-center justify-between">
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400 font-bold hidden sm:block uppercase tracking-widest">Autosaved</span>
                  <button 
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-xl font-black shadow-lg shadow-primary/25 transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
                  >
                    Next Area
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-primary/10 rounded-3xl shadow-xl overflow-hidden"
            >
              <div className="p-10 border-b border-primary/5">
                <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Review Your Evaluation</h2>
                <p className="text-slate-500 font-bold leading-relaxed">
                  Please review your ratings and reflections before submitting. You can go back to any section to make changes.
                </p>
              </div>

              <div className="p-10 space-y-6">
                {CRITERIA.map((c) => (
                  <div key={c.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={cn("size-10 rounded-xl flex items-center justify-center", c.bgColor, c.color)}>
                        {getIcon(c.icon, "w-5 h-5")}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{c.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rating: {scores[c.key] || 0}/5</p>
                      </div>
                    </div>
                    <StarRating rating={scores[c.key] || 0} starClassName="w-4 h-4" />
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-8 flex items-center justify-between">
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button 
                  onClick={handleFinish}
                  className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-xl font-black shadow-lg shadow-primary/25 transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
                >
                  Finish & Submit
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Support Section */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>Need help with your evaluation? <button className="text-primary hover:underline font-medium">Contact your Mentor</button></p>
        </div>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 mx-auto">
                <ClipboardList className="w-10 h-10" />
              </div>
              
              <div className="text-center space-y-3 mb-8">
                <h3 className="text-2xl font-black text-slate-900">Ready to Submit?</h3>
                <p className="text-slate-500 leading-relaxed">
                  You've completed all 8 areas of your self-evaluation. Once submitted, your mentor will review your reflections and provide feedback.
                </p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="size-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Submit Evaluation
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="w-full py-4 bg-white text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Review Answers
                </button>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
