interface Props {
  cycleDays: number;
}

export function CycleSettings({ 
  cycleDays 
}: Props) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Cycle Settings</h3>
      <p className="text-sm text-slate-500 leading-relaxed">
        Your history and next evaluation schedule follow the admin-defined cycle length.
      </p>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Current Interval</p>
        <p className="mt-2 text-3xl font-black text-slate-900">{cycleDays} days</p>
      </div>
    </div>
  );
}
