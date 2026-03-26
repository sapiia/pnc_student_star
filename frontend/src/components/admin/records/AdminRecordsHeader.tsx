import { ArrowLeft, Download, UserPlus } from 'lucide-react';

interface AdminRecordsHeaderProps {
  onAddAdmin: () => void;
  onBack: () => void;
}

export default function AdminRecordsHeader({
  onAddAdmin,
  onBack,
}: AdminRecordsHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md md:px-8 md:py-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-lg font-black text-slate-900 md:text-xl">
            Admin Records
          </h1>
        </div>

        <p className="text-[10px] leading-none font-bold tracking-widest text-slate-400 uppercase">
          Administrator Management
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-400 transition-colors hover:text-primary">
          <Download className="h-5 w-5" />
        </button>

        <button
          onClick={onAddAdmin}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
        >
          <UserPlus className="h-4 w-4" />
          Add Admin
        </button>
      </div>
    </header>
  );
}
