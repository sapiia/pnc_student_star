import {
  ArrowDownRight,
  ArrowUpRight,
  Target,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "../../../lib/utils";

import type {
  CriterionNavItem,
  OverallStats,
  PerformanceTrendDatum,
} from "./adminReports.types";

interface AdminOverviewReportsTabProps {
  activeCriterionColor: string;
  activeCriterionKey: string;
  activeCriterionLabel: string;
  criteriaColorMap: Map<string, string>;
  criteriaNav: CriterionNavItem[];
  onCriterionChange: (value: string) => void;
  overallStats: OverallStats;
  performanceTrendData: PerformanceTrendDatum[];
  ratingScale: number;
  studentCount: number;
}

export default function AdminOverviewReportsTab({
  activeCriterionColor,
  activeCriterionKey,
  activeCriterionLabel,
  criteriaColorMap,
  criteriaNav,
  onCriterionChange,
  overallStats,
  performanceTrendData,
  ratingScale,
  studentCount,
}: AdminOverviewReportsTabProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <OverviewStatCard
          accent="+4.2%"
          accentClassName="text-emerald-600"
          icon={TrendingUp}
          iconClassName="bg-blue-50 text-blue-600"
          label="Avg Student Score"
          suffix={` / ${ratingScale.toFixed(1)}`}
          value={overallStats.avgScore || 0}
        />

        <OverviewStatCard
          accent="+12%"
          accentClassName="text-emerald-600"
          icon={UserCheck}
          iconClassName="bg-purple-50 text-purple-600"
          label="Teacher Completion"
          suffix="%"
          value={overallStats.completionRate}
        />

        <OverviewStatCard
          accent="-2.1%"
          accentClassName="text-rose-600"
          icon={Target}
          iconClassName="bg-emerald-50 text-emerald-600"
          label="Pending Evaluations"
          suffix=""
          value={overallStats.pendingEvaluations}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">
            Performance Trend
          </h3>

          <div className="flex gap-4">
            <LegendPill
              color={activeCriterionColor}
              label={activeCriterionLabel}
            />
            <LegendPill color="#10b981" label="Completion" />
          </div>
        </div>

        <div className="mb-6 overflow-x-auto">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 p-1">
            <CriterionToggle
              active={activeCriterionKey === "overall"}
              color="#5d5fef"
              label="Overall"
              onClick={() => onCriterionChange("overall")}
            />

            {criteriaNav.map((criterion) => (
              <button
                key={criterion.id}
                type="button"
                onClick={() => onCriterionChange(criterion.key)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                  activeCriterionKey === criterion.key
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-400 hover:text-slate-600",
                )}
              >
                <span
                  className="size-2 rounded-full"
                  style={{
                    backgroundColor:
                      criteriaColorMap.get(criterion.key) || "#5d5fef",
                  }}
                />
                {criterion.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={performanceTrendData}>

              <CartesianGrid
                stroke="#f1f5f9"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                domain={[0, ratingScale]}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                yAxisId="completion"
                axisLine={false}
                domain={[0, Math.max(1, studentCount)]}
                orientation="right"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ border: "none", borderRadius: "16px" }}
              />
              <Line
                dataKey="studentAvg"
                dot={{
                  fill: "#fff",
                  r: 6,
                  stroke: activeCriterionColor,
                  strokeWidth: 3,
                }}
                stroke={activeCriterionColor}
                strokeWidth={4}
                type="monotone"
              />
              <Line
                dataKey="completion"
                dot={false}
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeWidth={2}
                type="monotone"
                yAxisId="completion"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

interface OverviewStatCardProps {
  accent: string;
  accentClassName: string;
  icon: any;
  iconClassName: string;
  label: string;
  suffix: string;
  value: number;
}

function OverviewStatCard({
  accent,
  accentClassName,
  icon: Icon,
  iconClassName,
  label,
  suffix,
  value,
}: OverviewStatCardProps) {
  const TrendIcon = accent.startsWith("-") ? ArrowDownRight : ArrowUpRight;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            iconClassName,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <span
          className={cn(
            "flex items-center gap-1 text-[10px] font-black",
            accentClassName,
          )}
        >
          <TrendIcon className="h-3 w-3" />
          {accent}
        </span>
      </div>

      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="text-3xl font-black text-slate-900">
        {value}
        {suffix ? (
          <span className="text-sm font-medium text-slate-400">{suffix}</span>
        ) : null}
      </p>
    </div>
  );
}

interface LegendPillProps {
  color: string;
  label: string;
}

function LegendPill({ color, label }: LegendPillProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="size-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] font-bold uppercase text-slate-500">
        {label}
      </span>
    </div>
  );
}

interface CriterionToggleProps {
  active: boolean;
  color: string;
  label: string;
  onClick: () => void;
}

function CriterionToggle({
  active,
  color,
  label,
  onClick,
}: CriterionToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
        active
          ? "bg-white text-primary shadow-sm"
          : "text-slate-400 hover:text-slate-600",
      )}
    >
      <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </button>
  );
}
