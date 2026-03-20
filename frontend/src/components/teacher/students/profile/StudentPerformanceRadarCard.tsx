import RadarChart from '../../../ui/RadarChart';
import { RADAR_COLORS, formatShortDate } from '../../../../lib/teacher/utils';
import type { EvaluationRecord } from '../../../../lib/teacher/types';

type StudentPerformanceRadarCardProps = {
  radarData: { data: Array<{ subject: string; score: number }>; maxValue: number };
  selectedEvaluation: EvaluationRecord | null;
  globalRatingScale: number;
};

export default function StudentPerformanceRadarCard({
  radarData,
  selectedEvaluation,
  globalRatingScale,
}: StudentPerformanceRadarCardProps) {
  const averageScore = Number(selectedEvaluation?.average_score || 0);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-slate-900">
        Performance Radar
      </h3>

      <div className="aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-2 flex items-center justify-center">
        {radarData.data.length > 0 ? (
          <RadarChart data={radarData.data} dataKeys={RADAR_COLORS} maxValue={radarData.maxValue} />
        ) : (
          <div className="p-6 text-center text-sm font-bold text-slate-400">
            No evaluation data available.
          </div>
        )}
      </div>

      {selectedEvaluation && (
        <div className="mt-6 text-center">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {selectedEvaluation.period || 'Selected'} Average Score
          </p>
          <div className="text-3xl font-black text-slate-900">
            {averageScore.toFixed(1)}{' '}
            <span className="text-sm text-slate-400">
              / {selectedEvaluation.rating_scale || globalRatingScale}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {formatShortDate(selectedEvaluation.submitted_at || selectedEvaluation.created_at)}
          </p>
        </div>
      )}
    </section>
  );
}
