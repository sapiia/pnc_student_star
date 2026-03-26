import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import RadarChart from "../../ui/RadarChart";

import type {
  RadarDatum,
  RadarSeriesKey,
  ReportChartDatum,
  StudentGenderFilter,
  StudentLevelFilter,
} from "./adminReports.types";

interface AdminStudentReportsTabProps {
  availableClasses: string[];
  currentReportData: ReportChartDatum[];
  generations: string[];
  onClassChange: (value: string | "All") => void;
  onGenderChange: (value: StudentGenderFilter) => void;
  onGenerationChange: (value: string | "All") => void;
  onLevelChange: (value: StudentLevelFilter) => void;
  onResetFilters: () => void;
  radarData: RadarDatum[];
  radarKeys: RadarSeriesKey[];
  ratingScale: number;
  selectedClass: string | "All";
  selectedGender: StudentGenderFilter;
  selectedGen: string | "All";
  selectedLevel: StudentLevelFilter;
  strongestArea: string;
  title: string;
  weakestArea: string;
}

export default function AdminStudentReportsTab({
  availableClasses,
  currentReportData,
  generations,
  onClassChange,
  onGenderChange,
  onGenerationChange,
  onLevelChange,
  onResetFilters,
  radarData,
  radarKeys,
  ratingScale,
  selectedClass,
  selectedGender,
  selectedGen,
  selectedLevel,
  strongestArea,
  title,
  weakestArea,
}: AdminStudentReportsTabProps) {
  return (
    <>
      <div className="flex flex-wrap items-end gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <FilterSelect
          label="Generation"
          options={[
            { label: "All Generations", value: "All" },
            ...generations.map((generation) => ({
              label: generation,
              value: generation,
            })),
          ]}
          value={selectedGen}
          onChange={(value) => onGenerationChange(value)}
        />

        <FilterSelect
          label="Class"
          options={[
            { label: "All Classes", value: "All" },
            ...availableClasses.map((className) => ({
              label: className,
              value: className,
            })),
          ]}
          value={selectedClass}
          onChange={(value) => onClassChange(value)}
        />

        <FilterSelect
          label="Gender"
          options={[
            { label: "All Gender", value: "All" },
            { label: "Male", value: "Male" },
            { label: "Female", value: "Female" },
            { label: "Other", value: "Other" },
          ]}
          value={selectedGender}
          onChange={(value) => onGenderChange(value as StudentGenderFilter)}
          selectClassName="w-64"
        />

        <FilterSelect
          label="Level"
          options={[
            { label: "All Levels", value: "All" },
            { label: "Low", value: "Low" },
            { label: "Medium", value: "Medium" },
            { label: "High", value: "High" },
          ]}
          value={selectedLevel}
          onChange={(value) => onLevelChange(value as StudentLevelFilter)}
        />

        <button
          type="button"
          onClick={onResetFilters}
          className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-rose-500"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">{title}</h3>
              <p className="text-xs font-bold text-slate-500">
                Detailed breakdown by criteria
              </p>
            </div>

            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={currentReportData}>

                <CartesianGrid
                  stroke="#f1f5f9"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="subject"
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  domain={[0, ratingScale]}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    border: "none",
                    borderRadius: "16px",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                  }}
                  cursor={{ fill: "#f8fafc" }}
                />
                <Bar barSize={44} dataKey="score" radius={[10, 10, 0, 0]}>
                  {currentReportData.map((entry) => (
                    <Cell key={`bar-${entry.subject}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/25" />

          <div className="relative z-10">
            <h3 className="mb-8 text-lg font-black text-slate-900">
              Radar Analysis
            </h3>
            <RadarChart
              data={radarData}
              dataKeys={radarKeys}
              maxValue={ratingScale}
            />

            <div className="mt-8 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Key Insights
              </h4>

              <InsightCard
                bodyClassName="border-emerald-200 bg-emerald-100/70"
                label="Strongest Area"
                textClassName="text-emerald-800"
                valueClassName="text-emerald-950"
                value={strongestArea}
              />

              <InsightCard
                bodyClassName="border-rose-200 bg-rose-100/70"
                label="Growth Opportunity"
                textClassName="text-rose-800"
                valueClassName="text-rose-950"
                value={weakestArea}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface FilterSelectProps {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  selectClassName?: string;
  value: string;
}

function FilterSelect({
  label,
  onChange,
  options,
  selectClassName = "w-full md:w-48",
  value,
}: FilterSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`block ${selectClassName} rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface InsightCardProps {
  bodyClassName: string;
  label: string;
  textClassName: string;
  value: string;
  valueClassName: string;
}

function InsightCard({
  bodyClassName,
  label,
  textClassName,
  value,
  valueClassName,
}: InsightCardProps) {
  return (
    <div className={`rounded-2xl border p-4 ${bodyClassName}`}>
      <p className={`text-xs font-bold ${textClassName}`}>{label}</p>
      <p className={`mt-1 text-sm font-black ${valueClassName}`}>{value}</p>
    </div>
  );
}
