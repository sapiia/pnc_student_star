import { useNavigate } from 'react-router-dom';
import BrandLogo from '../../ui/BrandLogo';

interface Props {
  isStudentPortal?: boolean;
}

export function EvaluationTopBar({ isStudentPortal = true }: Props) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <BrandLogo 
          titleClassName="text-xl font-bold tracking-tight text-primary" 
          markClassName="size-8" 
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[10px] font-black text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest whitespace-nowrap"
          >
            Cancel
          </button>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-none text-slate-900">Student Portal</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">
              Self Evaluation
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

