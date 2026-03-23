import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  isFirstStep: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => void;
  isSummaryStep?: boolean;
}

export function StepFooter({ 
  isFirstStep, 
  isLastStep, 
  onBack, 
  onNext, 
  isSummaryStep = false 
}: Props) {
  const nextLabel = isSummaryStep ? 'Submit Final' : 'Next Area';
  const nextIcon = isSummaryStep ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />;

  return (
    <div className="bg-slate-50 p-5 md:p-6 flex items-center justify-between gap-4">
      <button 
        onClick={onBack}
        className="flex items-center justify-center gap-2 px-5 md:px-6 py-3 rounded-xl font-black text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back</span>
      </button>
      <div className="flex items-center gap-4 flex-1 md:flex-none">
        <button 
          onClick={onNext}
          className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white px-7 md:px-8 py-3.5 rounded-xl font-black shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
        >
          {nextLabel}
          {nextIcon}
        </button>
      </div>
    </div>
  );
}
