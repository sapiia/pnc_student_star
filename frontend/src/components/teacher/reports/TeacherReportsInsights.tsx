import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';

interface TeacherReportsInsightsProps {
  avgScore: number;
  completionRate: number;
  ratingScale: number;
}

export default function TeacherReportsInsights({
  avgScore,
  completionRate,
  ratingScale,
}: TeacherReportsInsightsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 pb-12 md:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
        <div className="mb-2 flex items-center gap-2 text-emerald-600">
          <TrendingUp className="h-5 w-5" />
          <span className="text-xs font-black uppercase tracking-widest">
            Growth Insight
          </span>
        </div>
        <h4 className="mb-2 font-bold text-emerald-900">
          Academic Performance
        </h4>
        <p className="text-sm leading-relaxed text-emerald-700">
          Class average is at {avgScore}/{ratingScale.toFixed(1)} with{' '}
          {completionRate}% completion rate across all criteria.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6">
        <div className="mb-2 flex items-center gap-2 text-amber-600">
          <ArrowDownRight className="h-5 w-5" />
          <span className="text-xs font-black uppercase tracking-widest">
            Attention Needed
          </span>
        </div>
        <h4 className="mb-2 font-bold text-amber-900">Evaluation Progress</h4>
        <p className="text-sm leading-relaxed text-amber-700">
          {100 - completionRate}% of students still need to submit their
          evaluations. Follow up with pending students.
        </p>
      </div>

      <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <ArrowUpRight className="h-5 w-5" />
          <span className="text-xs font-black uppercase tracking-widest">
            Next Milestone
          </span>
        </div>
        <h4 className="mb-2 font-bold text-slate-900">Q4 Evaluations</h4>
        <p className="text-sm leading-relaxed text-slate-600">
          Final quarter evaluations in progress. Current prep-rate is at{' '}
          {completionRate}% across all departments.
        </p>
      </div>
    </div>
  );
}
