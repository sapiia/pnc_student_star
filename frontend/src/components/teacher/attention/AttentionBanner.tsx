interface AttentionBannerProps {
    studentCount: number;
  }
  
  export default function AttentionBanner({ studentCount }: AttentionBannerProps) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-rose-900 mb-2">Priority Intervention List</h2>
          <p className="text-sm text-rose-700 font-medium">
            Students with an average self-evaluation rating below 2.5 stars. Prompt coaching and direct messaging is strongly recommended.
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 text-center shrink-0 min-w-32">
          <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Total</p>
          <p className="text-3xl font-black text-rose-700">{studentCount}</p>
        </div>
      </div>
    );
  }