import { ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  daysUntilAvailable: number;
  nextAvailableLabel: string;
  evaluationsUsed: number;
  maxEvaluationsPerCycle: number;
}

export function IneligibleView({ 
  daysUntilAvailable, 
  nextAvailableLabel, 
  evaluationsUsed, 
  maxEvaluationsPerCycle 
}: Props) {
  const navigate = useNavigate();

  return (
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
        <p className="mt-3 text-[11px] md:text-xs font-black uppercase tracking-widest text-amber-500">
          {evaluationsUsed} of {maxEvaluationsPerCycle} evaluations used in this cycle
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
  );
}

