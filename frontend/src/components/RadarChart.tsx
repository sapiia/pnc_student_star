import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface RadarChartProps {
  data: any[];
  dataKeys: { key: string; name: string; color: string; fill: string }[];
}

export default function RadarChart({ data, dataKeys }: RadarChartProps) {
  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
          />
          {dataKeys.map((dk) => (
            <Radar
              key={dk.key}
              name={dk.name}
              dataKey={dk.key}
              stroke={dk.color}
              fill={dk.fill}
              fillOpacity={0.4}
            />
          ))}
          <Legend />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
