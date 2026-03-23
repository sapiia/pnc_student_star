import RadarChart from '../../../ui/RadarChart';
import type {
  CriterionView,
  ResultRadarDatum,
  ResultRadarKey,
} from './types';

interface Props {
  criteriaData: CriterionView[];
  radarData: ResultRadarDatum[];
  radarKeys: ResultRadarKey[];
  ratingScale: number;
  averageScore: number;
  completedLabel: string;
  isLoading: boolean;
}

export function ResultRadarSection({
  criteriaData,
  radarData,
  radarKeys,
  ratingScale,
  averageScore,
  completedLabel,
  isLoading,
}: Props) {
  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
      <div className="mb-6 flex items-center justify-between md:mb-8">
        <h3 className="text-lg font-black uppercase tracking-widest text-slate-900 md:text-xl">
          Growth Radar
        </h3>
        <div className="flex flex-wrap justify-end gap-4 text-[10px] font-black uppercase tracking-widest">
          {radarKeys.map((item) => (
            <div key={item.key} className="flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span style={{ color: item.color }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {criteriaData.length > 0 ? (
        <RadarChart
          data={radarData}
          dataKeys={radarKeys}
          maxValue={ratingScale}
        />
      ) : (
        <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm font-bold text-slate-400">
          {isLoading ? 'Loading evaluation result...' : 'No saved criteria data found.'}
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-xs font-medium text-slate-500">Average Score</p>
          <p className="text-2xl font-bold text-slate-900">
            {averageScore.toFixed(1)}{' '}
            <span className="text-sm font-medium text-slate-400">
              / {ratingScale}
            </span>
          </p>
        </div>
        <div className="h-10 w-px bg-slate-200" />
        <div className="text-center">
          <p className="text-xs font-medium text-slate-500">Completed On</p>
          <p className="text-lg font-bold text-slate-900">{completedLabel}</p>
        </div>
      </div>
    </div>
  );
}
