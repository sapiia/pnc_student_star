interface Props {
  studentName: string;
  studentId: string;
}

export function HistoryPageHeader({ 
  studentName, 
  studentId 
}: Props) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
        My Evaluation History
      </h1>
      <p className="text-sm md:text-base text-slate-500 mt-2">
        Review your submitted evaluations and upcoming schedule.
      </p>
      {studentId ? (
        <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-slate-100 rounded-lg w-fit">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {studentName} - {studentId}
          </span>
        </div>
      ) : null}
    </div>
  );
}
