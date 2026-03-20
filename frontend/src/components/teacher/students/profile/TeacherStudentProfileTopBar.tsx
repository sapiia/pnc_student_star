import { ArrowLeft } from 'lucide-react';

type TeacherStudentProfileTopBarProps = {
  studentName: string;
  avatarUrl: string;
  onBack: () => void;
};

export default function TeacherStudentProfileTopBar({
  studentName,
  avatarUrl,
  onBack,
}: TeacherStudentProfileTopBarProps) {
  return (
    <header className="h-16 shrink-0 border-b border-slate-200 bg-white px-8 flex items-center z-10">
      <button
        type="button"
        onClick={onBack}
        className="mr-4 -ml-2 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3">
        <div className="size-8 shrink-0 overflow-hidden rounded-full bg-slate-100">
          <img src={avatarUrl} alt={studentName} className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-lg font-black leading-tight text-slate-900">{studentName}</h1>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest leading-none text-slate-500">
            Profile &amp; Performance
          </p>
        </div>
      </div>
    </header>
  );
}
