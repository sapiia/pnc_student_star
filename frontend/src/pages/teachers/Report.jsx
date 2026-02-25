import React from "react";
import { FileBarChart2, Download, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

const reportRows = [
  { className: "WEB A", completion: "92%", avgScore: "4.1", risk: "Low", mentor: "Serey Roth" },
  { className: "WEB B", completion: "86%", avgScore: "3.8", risk: "Medium", mentor: "Dara Vann" },
  { className: "WEB C", completion: "78%", avgScore: "3.5", risk: "High", mentor: "Malis Chheang" },
  { className: "Class A", completion: "90%", avgScore: "4.0", risk: "Low", mentor: "Nary Kim" },
  { className: "Class B", completion: "84%", avgScore: "3.7", risk: "Medium", mentor: "Rithy Hong" },
];

function Report() {
  return (
    <div className="min-h-screen bg-[#f3f5fa] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                <FileBarChart2 size={14} />
                Report
              </p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900">Evaluation Report Summary</h1>
              <p className="mt-2 text-sm text-slate-500">Overview of completion rate, risk level, and class performance.</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Download size={16} />
              Export Report
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Avg Completion</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">86%</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <TrendingUp size={14} />
              +4% vs last month
            </p>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Low Risk Classes</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">2</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <CheckCircle2 size={14} />
              Stable classes
            </p>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">High Risk Classes</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">1</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
              <AlertTriangle size={14} />
              Needs immediate support
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-bold text-slate-900">Class Report Table</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Class</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Completion</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Avg Score</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Risk</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Mentor</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map((row) => (
                  <tr key={row.className} className="border-b border-slate-50">
                    <td className="py-4 text-sm font-semibold text-slate-800">{row.className}</td>
                    <td className="py-4 text-sm font-semibold text-slate-700">{row.completion}</td>
                    <td className="py-4 text-sm text-slate-700">{row.avgScore}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          row.risk === "Low"
                            ? "bg-emerald-50 text-emerald-600"
                            : row.risk === "Medium"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {row.risk}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-600">{row.mentor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Report;
