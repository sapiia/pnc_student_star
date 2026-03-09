import { useEffect, useState } from 'react';
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
  Users2,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CRITERIA } from '../../constants';
import StarRating from '../../components/ui/StarRating';
import { cn } from '../../lib/utils';
import BrandLogo from '../../components/ui/BrandLogo';

type EvaluationCriterion = {
  id?: string;
  key: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description?: string;
  starDescriptions: string[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const CRITERION_STYLES = [
  { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { color: 'text-violet-600', bgColor: 'bg-violet-100' },
  { color: 'text-rose-600', bgColor: 'bg-rose-100' },
  { color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { color: 'text-sky-600', bgColor: 'bg-sky-100' },
  { color: 'text-amber-600', bgColor: 'bg-amber-100' }
] as const;

const toCriterionKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');

const fallbackCriteria: EvaluationCriterion[] = CRITERIA.map((criterion, index) => ({
  ...criterion,
  description: `Reflect on your ${criterion.label.toLowerCase()} this quarter. What is going well? What could be improved?`,
  starDescriptions: Array.from({ length: 5 }, (_, starIndex) => `Describe why ${starIndex + 1} star${starIndex === 0 ? '' : 's'} fits your ${criterion.label.toLowerCase()} this quarter.`),
  ...CRITERION_STYLES[index % CRITERION_STYLES.length],
}));

export default function EvaluationFormPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>(fallbackCriteria);
  const [ratingScale, setRatingScale] = useState(5);
  const [isEligibilityLoading, setIsEligibilityLoading] = useState(true);
  const [canEvaluate, setCanEvaluate] = useState(true);
  const [daysUntilAvailable, setDaysUntilAvailable] = useState(0);
  const [nextAvailableLabel, setNextAvailableLabel] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const loadEligibility = async () => {
      try {
        const raw = localStorage.getItem('auth_user');
        const authUser = raw ? JSON.parse(raw) : null;
        const userId = Number(authUser?.id);

        if (!Number.isInteger(userId) || userId <= 0) {
          setCanEvaluate(false);
          return;
        }

        const [intervalResponse, evaluationsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/settings/key/evaluation_interval_days`),
          fetch(`${API_BASE_URL}/evaluations/user/${userId}`)
        ]);

        const intervalData = await intervalResponse.json().catch(() => ({}));
        const evaluations = await evaluationsResponse.json().catch(() => ([]));
        const latestEvaluation = Array.isArray(evaluations) && evaluations.length > 0 ? evaluations[0] : null;

        if (!latestEvaluation) {
          setCanEvaluate(true);
          setDaysUntilAvailable(0);
          setNextAvailableLabel('');
          return;
        }

        const intervalDays = Math.min(365, Math.max(30, Number(intervalData?.value || 90)));
        const latestSubmittedAt = String(latestEvaluation?.submitted_at || latestEvaluation?.created_at || '').trim();
        const latestDate = new Date(latestSubmittedAt);

        if (Number.isNaN(latestDate.getTime())) {
          setCanEvaluate(true);
          setDaysUntilAvailable(0);
          setNextAvailableLabel('');
          return;
        }

        const nextAvailableDate = new Date(latestDate);
        nextAvailableDate.setDate(nextAvailableDate.getDate() + intervalDays);
        const remainingDays = Math.max(0, Math.ceil((nextAvailableDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

        setCanEvaluate(remainingDays === 0);
        setDaysUntilAvailable(remainingDays);
        setNextAvailableLabel(
          new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }).format(nextAvailableDate)
        );
      } catch {
        setCanEvaluate(true);
      } finally {
        setIsEligibilityLoading(false);
      }
    };

    loadEligibility();
  }, []);

  useEffect(() => {
    const loadCriteriaConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings/evaluation-criteria`);
        const data = await response.json();
        if (!response.ok || !Array.isArray(data?.criteria) || data.criteria.length === 0) {
          return;
        }

        const activeCriteria = data.criteria.filter((c: any) => String(c.status).toLowerCase() === 'active');
        if (activeCriteria.length === 0) return;

        const nextRatingScale = Math.max(1, Number(data?.ratingScale || 5));
        setRatingScale(nextRatingScale);
        
        const mappedCriteria = activeCriteria.map((c: any, index: number) => {
          const style = CRITERION_STYLES[index % CRITERION_STYLES.length];
          return {
            id: String(c.id || '').trim() || undefined,
            key: c.key || String(c.id || c.name || `criterion${index + 1}`),
            label: String(c.name || `Criterion ${index + 1}`),
            icon: String(c.icon || 'Star'),
            description: String(c.description || '').trim(),
            starDescriptions: Array.from({ length: nextRatingScale }, (_, starIndex) => String(c.starDescriptions?.[starIndex] || '').trim()),
            ...style,
          };
        });

        setCriteria(mappedCriteria);
      } catch {
        // keep fallback criteria so the student can still evaluate
      }
    };

    loadCriteriaConfig();
  }, []);

  const criterion = currentStep >= 0 && currentStep < criteria.length ? criteria[currentStep] : null;
  const selectedRating = criterion ? scores[criterion.key] || 0 : 0;
  const selectedTip = criterion && selectedRating > 0
    ? criterion.starDescriptions[selectedRating - 1]
    : '';

  const handleNext = () => {
    if (currentStep < criteria.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = () => {
    setSubmitError('');
    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const raw = localStorage.getItem('auth_user');
      const authUser = raw ? JSON.parse(raw) : null;
      const userId = Number(authUser?.id);
      if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error('Student account information is missing.');
      }

      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      const period = `${now.getFullYear()}-Q${quarter}`;
      const responses = criteria.map((item) => {
        const starValue = scores[item.key] || 0;
        return {
          criterion_id: item.id,
          criterion_key: item.key,
          criterion_name: item.label,
          criterion_icon: item.icon,
          star_value: starValue,
          reflection: reflections[item.key] || '',
          tip_snapshot: starValue > 0 ? item.starDescriptions[starValue - 1] || '' : '',
        };
      });

      const response = await fetch(`${API_BASE_URL}/evaluations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          period,
          rating_scale: ratingScale,
          responses,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to submit evaluation.');
      }

      localStorage.setItem(`last_evaluation_submitted_at_${userId}`, new Date().toISOString());
      navigate('/results', { state: { scores, reflections, evaluationId: data?.evaluationId } });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit evaluation.');
      setIsSubmitting(false);
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
      case 'Users2': return <Users2 className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Smile': return <Smile className={className} />;
      case 'Brain': return <Brain className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'Wrench': return <Wrench className={className} />;
      case 'MessageCircle': return <MessageCircle className={className} />;
      default: return <Star className={className} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <BrandLogo titleClassName="text-xl font-bold tracking-tight text-primary" markClassName="size-8" />
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-[10px] font-black text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest whitespace-nowrap"
            >
              Cancel
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-none text-slate-900">Student Portal</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">Self Evaluation</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {isEligibilityLoading ? (
          <div className="bg-white border border-primary/10 rounded-3xl shadow-xl p-10 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Checking Evaluation Access</p>
            <p className="mt-4 text-lg font-bold text-slate-900">Loading your evaluation schedule...</p>
          </div>
        ) : !canEvaluate ? (
          <div className="bg-white border border-amber-200 rounded-3xl shadow-xl overflow-hidden mt-4 md:mt-0">
            <div className="p-6 md:p-10 border-b border-amber-100 text-center">
              <div className="mx-auto size-16 md:size-20 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 md:mb-6">
                <ClipboardList className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-amber-600">Evaluation Locked</p>
              <h2 className="mt-2 md:mt-3 text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600 font-bold leading-relaxed px-2">
                Your next self-evaluation will open in {daysUntilAvailable} day{daysUntilAvailable === 1 ? '' : 's'}.
                {nextAvailableLabel ? ` The next available date is ${nextAvailableLabel}.` : ''}
              </p>
            </div>
            <div className="bg-amber-50 px-6 md:px-8 py-5 md:py-6 flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 rounded-xl font-black text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/history')}
                className="px-6 py-3 rounded-xl font-black text-white bg-primary hover:bg-primary/90 transition-all uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
              >
                View Evaluations
              </button>
            </div>
          </div>
        ) : (
        <>
        {/* Progress Stepper */}
        <div className="mb-6 md:mb-10 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex items-center justify-between min-w-[500px] md:min-w-full">
            {criteria.map((c, idx) => {
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              return (
                <div key={c.key} className="flex flex-col items-center gap-1.5 md:gap-2 flex-1 relative">
                  <div className={`size-8 md:size-10 rounded-full flex items-center justify-center font-bold z-10 transition-all text-xs md:text-sm ${
                    isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 
                    isCompleted ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : idx + 1}
                  </div>
                  <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                    {c.label}
                  </span>
                  {idx < criteria.length - 1 && (
                    <div className={`absolute top-4 md:top-5 left-1/2 w-full h-[2px] transition-colors ${idx < currentStep ? 'bg-primary' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
            {/* Summary Step */}
            <div className="flex flex-col items-center gap-1.5 md:gap-2 flex-1 relative">
              <div className={`size-8 md:size-10 rounded-full flex items-center justify-center font-bold z-10 transition-all text-xs md:text-sm ${
                currentStep === criteria.length ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-200 text-slate-400'
              }`}>
                <ClipboardList className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-colors ${currentStep === criteria.length ? 'text-primary' : 'text-slate-400'}`}>
                Summary
              </span>
              <div className={`absolute top-4 md:top-5 -left-1/2 w-full h-[2px] transition-colors ${currentStep === criteria.length ? 'bg-primary' : 'bg-slate-200'}`} />
            </div>
          </div>
        </div>

        {/* Evaluation Form Content */}
        <AnimatePresence mode="wait">
          {criterion ? (
            <motion.div 
              key={criterion.key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-primary/10 rounded-3xl shadow-xl overflow-hidden"
            >
              {/* Form Header */}
              <div className="px-6 py-8 md:p-10 border-b border-primary/5 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
                <div className={cn("size-16 md:size-20 rounded-2xl flex items-center justify-center shrink-0", criterion.bgColor, criterion.color)}>
                  {getIcon(criterion.icon, "w-8 h-8 md:w-10 md:h-10")}
                </div>
                <div>
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-3 md:mb-4">
                    Step {currentStep + 1} of {criteria.length}
                  </span>
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">{criterion.label}</h2>
                  <p className="text-sm md:text-base text-slate-500 font-bold leading-relaxed px-4 md:px-0">
                    {criterion.description || `Reflect on your ${criterion.label.toLowerCase()} this quarter.`}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-6 md:p-10 space-y-8 md:space-y-10">
                {/* Rating Component */}
                <div className="space-y-4">
                  <label className="block text-lg md:text-xl font-black text-slate-900 tracking-tight text-center md:text-left">
                    How would you rate yourself?
                  </label>
                  <div className="flex justify-center md:justify-start">
                    <StarRating 
                      readonly={false}
                      rating={selectedRating}
                      max={ratingScale}
                      onRate={(r) => setScores({ ...scores, [criterion.key]: r })}
                      starClassName="size-8 md:size-12"
                    />
                  </div>
                </div>

                {/* Reflection Component */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-lg md:text-xl font-black text-slate-900 tracking-tight" htmlFor="reflection">
                      Self-Reflection
                    </label>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      (reflections[criterion.key]?.length || 0) >= 50 ? "text-emerald-500" : "text-slate-400"
                    )}>
                      {reflections[criterion.key]?.length || 0} / 50 min
                    </span>
                  </div>
                  <textarea 
                    className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary placeholder:text-slate-400 p-4 md:p-6 text-sm md:text-base text-slate-700 font-medium outline-none transition-all" 
                    id="reflection" 
                    placeholder={`Describe your ${criterion.label.toLowerCase()} situation...`}
                    rows={5}
                    value={reflections[criterion.key] || ''}
                    onChange={(e) => setReflections({ ...reflections, [criterion.key]: e.target.value })}
                  />
                </div>

                {/* Tip Box */}
                <div className="flex items-start gap-3 md:gap-4 p-4 md:p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="text-primary mt-0.5 shrink-0">
                    <Lightbulb className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <p className="text-[11px] md:text-sm text-slate-600 font-bold leading-relaxed">
                    <strong className="text-primary text-[10px] md:text-xs">TIP:</strong>{' '}
                    {selectedTip || `Choose a star rating to see guidance for that score.`}
                  </p>
                </div>
              </div>

              {/* Form Footer */}
              <div className="bg-slate-50 p-6 md:p-8 flex items-center justify-between gap-4">
                <button 
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 rounded-xl font-black text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <div className="flex items-center gap-4 flex-1 md:flex-none">
                  <button 
                    onClick={handleNext}
                    className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-black shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
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
              <div className="p-6 md:p-10 border-b border-primary/5">
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">Review Results</h2>
                <p className="text-sm md:text-base text-slate-500 font-bold leading-relaxed">
                  Review your responses before final submission.
                </p>
              </div>

              <div className="p-6 md:p-10 space-y-4 md:space-y-6">
                {criteria.map((c) => (
                  <div key={c.key} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                    <div className="flex items-center gap-4">
                      <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0", c.bgColor, c.color)}>
                        {getIcon(c.icon, "w-5 h-5")}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{c.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rating: {scores[c.key] || 0}</p>
                      </div>
                    </div>
                    <div className="flex justify-end md:justify-start">
                      <StarRating rating={scores[c.key] || 0} max={ratingScale} starClassName="size-4" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-6 md:p-8 flex items-center justify-between gap-4">
                <button 
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 rounded-xl font-black text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <button 
                  onClick={handleFinish}
                  className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-black shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                >
                  Submit Final
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
        </>
        )}
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
                  You've completed all {criteria.length} areas of your self-evaluation. Once submitted, your mentor will review your reflections and provide feedback.
                </p>
              </div>

              <div className="space-y-3">
                {submitError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                    {submitError}
                  </div>
                ) : null}
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
