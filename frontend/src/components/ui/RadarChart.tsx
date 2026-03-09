import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface RadarDataKey {
  key: string;
  name: string;
  color: string;
  fill: string;
}

interface RadarChartProps {
  data: any[];
  dataKeys: RadarDataKey[];
  /** The maximum value on the scale (e.g. 5 or 6). Defaults to 100.
   *  When provided, the chart renders one concentric ring per integer level (1 … maxValue). */
  maxValue?: number;
}

export default function RadarChart({ data, dataKeys, maxValue }: RadarChartProps) {
  const domain: [number, number] = [0, maxValue ?? 100];

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
          />
          {maxValue != null && (
            <PolarRadiusAxis
              angle={90}
              domain={domain}
              tickCount={maxValue + 1}
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }}
              axisLine={false}
            />
          )}

          {dataKeys.map((dk) => (
            <Radar
              key={dk.key}
              name={dk.name}
              dataKey={dk.key}
              stroke={dk.color}
              fill={dk.fill}
              fillOpacity={0.38}
              strokeWidth={2}
              dot={false}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 8 }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
