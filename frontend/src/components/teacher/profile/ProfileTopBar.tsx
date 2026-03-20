import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';

interface ProfileTopBarProps {
  isSaving: boolean;
  onSave: () => void;
}

export default function ProfileTopBar({ isSaving, onSave }: ProfileTopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="h-auto min-h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-2 md:py-0 flex items-center justify-between shrink-0 z-10">
      <nav className="flex items-center gap-2 text-[10px] md:text-sm text-slate-500 overflow-hidden">
        <button onClick={() => navigate('/teacher/dashboard')} className="hover:text-primary transition-colors shrink-0">Dashboard</button>
        <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
        <span className="font-semibold text-slate-900 truncate">Settings</span>
      </nav>
      <div className="flex items-center gap-2 md:gap-4 ml-2">
        <button className="hidden sm:block p-2 text-slate-500 hover:bg-slate-100 rounded-full relative shrink-0">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>
        <button onClick={onSave} disabled={isSaving} className="bg-primary text-white px-4 md:px-6 py-1.5 md:py-2 rounded-xl font-bold text-[10px] md:text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-70 shrink-0">
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </header>
  );
}