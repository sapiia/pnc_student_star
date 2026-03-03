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
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CRITERIA } from '../constants';
import StarRating from '../components/StarRating';

export default function EvaluationFormPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [reflections, setReflections] = useState<Record<string, string>>({});

  const criterion = CRITERIA[currentStep];

  const handleNext = () => {
    if (currentStep < CRITERIA.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/results');
    }
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
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-none text-slate-900">Sokha Mean</p>
              <p className="text-xs text-slate-500 mt-1">Student ID: 2024-0892</p>
            </div>
            <div className="size-10 rounded-full border-2 border-primary/20 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/sokha/100/100')" }} />
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
                  <span className={`text-xs font-bold transition-colors ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                    {c.label}
                  </span>
                  {idx < CRITERIA.length - 1 && (
                    <div className={`absolute top-5 left-1/2 w-full h-[2px] transition-colors ${idx < currentStep ? 'bg-primary' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Evaluation Form Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={criterion.key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white border border-primary/10 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Form Header */}
            <div className="p-8 border-b border-primary/5">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                Step {currentStep + 1} of {CRITERIA.length}
              </span>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">{criterion.label}</h2>
              <p className="text-slate-600 max-w-2xl leading-relaxed">
                Reflect on your {criterion.label.toLowerCase()} this quarter. What is going well? What could be improved? This assessment helps us understand your development.
              </p>
            </div>

            {/* Form Fields */}
            <div className="p-8 space-y-10">
              {/* Rating Component */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-slate-800">
                  How would you rate yourself?
                </label>
                <StarRating 
                  readonly={false}
                  rating={scores[criterion.key] || 0}
                  onRate={(r) => setScores({ ...scores, [criterion.key]: r })}
                  starClassName="w-10 h-10"
                />
              </div>

              {/* Reflection Component */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-lg font-semibold text-slate-800" htmlFor="reflection">
                    Self-Reflection & Details
                  </label>
                  <span className="text-xs text-slate-400">Minimum 50 characters</span>
                </div>
                <textarea 
                  className="w-full rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary placeholder:text-slate-400 p-4" 
                  id="reflection" 
                  placeholder={`Describe your ${criterion.label.toLowerCase()} situation this quarter...`}
                  rows={6}
                  value={reflections[criterion.key] || ''}
                  onChange={(e) => setReflections({ ...reflections, [criterion.key]: e.target.value })}
                />
              </div>

              {/* Tip Box */}
              <div className="flex items-start gap-4 p-5 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-primary mt-0.5">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong className="text-primary">Tip:</strong> Be honest with yourself. This reflection helps your mentors provide better support and understand any external challenges you might be facing.
                </p>
              </div>
            </div>

            {/* Form Footer */}
            <div className="bg-slate-50 p-6 flex items-center justify-between">
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 hidden sm:block">Answers are autosaved</span>
                <button 
                  onClick={handleNext}
                  disabled={!scores[criterion.key]}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-2"
                >
                  {currentStep === CRITERIA.length - 1 ? 'Finish' : 'Next Area'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Support Section */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>Need help with your evaluation? <button className="text-primary hover:underline font-medium">Contact your Mentor</button></p>
        </div>
      </main>
    </div>
  );
}
