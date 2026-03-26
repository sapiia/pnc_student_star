import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { DEFAULT_AVATAR } from "../../../lib/api";

import type {
  FeedbackStatusData,
  TeacherPerformanceRow,
} from "./adminReports.types";

interface AdminTeacherReportsTabProps {
  feedbackStatusData: FeedbackStatusData;
  onQuarterChange: (value: string) => void;
  quarterOptions: string[];
  selectedQuarter: string;
  teacherPerformance: TeacherPerformanceRow[];
}

export default function AdminTeacherReportsTab({
  feedbackStatusData,
  onQuarterChange,
  quarterOptions,
  selectedQuarter,
  teacherPerformance,
}: AdminTeacherReportsTabProps) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-black text-slate-900">
            Evaluation Status
          </h3>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Quarter
            </label>
            <select
              value={selectedQuarter}
              onChange={(event) => onQuarterChange(event.target.value)}
              className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All</option>
              {quarterOptions.map((quarter) => (
                <option key={quarter} value={quarter}>
                  {quarter}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>

              <Pie
                cx="50%"
                cy="50%"
                data={feedbackStatusData.data}
                dataKey="value"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
              >
                {feedbackStatusData.data.map((entry, index) => (
                  <Cell key={`feedback-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Students With Feedback
          </p>
          <p className="text-2xl font-black text-slate-900">
            {feedbackStatusData.completed}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-2">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-black text-slate-900">
            Top Performing Teachers
          </h3>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {selectedQuarter === "All" ? "All Quarters" : selectedQuarter}
          </div>
        </div>

        <div className="space-y-6">
          {teacherPerformance.map((teacher, index) => (
            <div key={teacher.id} className="group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-lg font-black text-slate-400 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  {index + 1}
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-10 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <img
                      src={teacher.profileImage || DEFAULT_AVATAR}
                      alt={teacher.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {teacher.name}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {teacher.dept || "Teaching Staff"} Department
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">
                    {teacher.avgScore.toFixed(1)}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Avg Score
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">
                    {teacher.studentCount}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Students
                  </p>
                </div>
              </div>
            </div>
          ))}

          {teacherPerformance.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
              No teacher feedback data yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
