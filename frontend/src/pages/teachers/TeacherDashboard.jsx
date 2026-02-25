import React from "react";
import { ClipboardCheck, Clock3, MessageSquare, Users, ArrowRight } from "lucide-react";

const pendingReviews = [
  { student: "Sokha Chann", cycle: "Q1 2026", submitted: "2 days ago", priority: "High" },
  { student: "Dara Vann", cycle: "Q1 2026", submitted: "4 days ago", priority: "Medium" },
  { student: "Malis Chheang", cycle: "Q1 2026", submitted: "6 days ago", priority: "Low" },
];

const recentFeedback = [
  { student: "Serey Roth", time: "Today", note: "Great improvement in collaboration and responsibility." },
  { student: "Nita Som", time: "Yesterday", note: "Needs follow-up on attendance consistency." },
];

const students = [
  { name: "Sokha Chann", group: "Web 2026 - A", score: "4.1 / 5", status: "Active" },
  { name: "Dara Vann", group: "Web 2026 - A", score: "3.8 / 5", status: "Needs Review" },
  { name: "Malis Chheang", group: "Web 2026 - B", score: "4.0 / 5", status: "Active" },
  { name: "Nita Som", group: "Web 2026 - B", score: "3.5 / 5", status: "At Risk" },
  { name: "Serey Roth", group: "Web 2026 - A", score: "4.3 / 5", status: "Active" },
];

function SummaryCard({ title, value, icon: Icon, tone }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function TeacherDashboard({ onOpenStudents = () => {} }) {
  return (
    <div className="min-h-screen bg-[#f8faff] p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-3xl font-bold text-slate-900">Education Officer Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Monitor student submissions, prioritize reviews, and provide timely feedback.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Assigned Students"
            value="48"
            icon={Users}
            tone="bg-blue-50 text-blue-600"
          />
          <SummaryCard
            title="Pending Reviews"
            value="13"
            icon={Clock3}
            tone="bg-amber-50 text-amber-600"
          />
          <SummaryCard
            title="Submitted This Week"
            value="21"
            icon={ClipboardCheck}
            tone="bg-emerald-50 text-emerald-600"
          />
          <SummaryCard
            title="Feedback Sent"
            value="34"
            icon={MessageSquare}
            tone="bg-indigo-50 text-indigo-600"
          />
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Student List</h2>
            <button
              type="button"
              onClick={onOpenStudents}
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600"
            >
              View All Students
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Student</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Group</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Latest Score</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((row) => (
                  <tr key={row.name} className="border-b border-slate-50">
                    <td className="py-4 text-sm font-semibold text-slate-800">{row.name}</td>
                    <td className="py-4 text-sm text-slate-600">{row.group}</td>
                    <td className="py-4 text-sm font-semibold text-slate-700">{row.score}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          row.status === "Active"
                            ? "bg-emerald-50 text-emerald-600"
                            : row.status === "Needs Review"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Pending Evaluation Reviews</h2>
            <button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
              View Queue
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Student</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Cycle</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Submitted</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Priority</th>
                </tr>
              </thead>
              <tbody>
                {pendingReviews.map((row) => (
                  <tr key={row.student} className="border-b border-slate-50">
                    <td className="py-4 text-sm font-semibold text-slate-800">{row.student}</td>
                    <td className="py-4 text-sm text-slate-600">{row.cycle}</td>
                    <td className="py-4 text-sm text-slate-600">{row.submitted}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          row.priority === "High"
                            ? "bg-rose-50 text-rose-600"
                            : row.priority === "Medium"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {row.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-bold text-slate-900">Recent Feedback Activity</h2>
          <div className="mt-4 space-y-3">
            {recentFeedback.map((item) => (
              <article key={item.student} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">{item.student}</p>
                  <span className="text-xs font-medium text-slate-400">{item.time}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.note}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default TeacherDashboard;
