import RadarChart from '../../ui/RadarChart';
import type { HistoricalComparison } from './types';

type HistoricalGrowthCardProps = {
  comparison: HistoricalComparison;
};

export default function HistoricalGrowthCard({
  comparison,
}: HistoricalGrowthCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
        Historical Growth
      </h3>

      {comparison.data.length > 0 ? (
        <RadarChart
          data={comparison.data}
          dataKeys={comparison.dataKeys}
          maxValue={comparison.maxValue}
        />
      ) : (
        <div className="flex h-[350px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm font-bold text-slate-400">
          No evaluation history is available yet.
        </div>
      )}
    </div>
  );
}
