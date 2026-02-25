import React from "react";
import { Download } from "lucide-react";

const rows = [
  { className: "WEB A", completion: "92%", avgScore: "4.1", trend: "+0.2", risk: "Low" },
  { className: "WEB B", completion: "86%", avgScore: "3.8", trend: "+0.1", risk: "Medium" },
  { className: "WEB C", completion: "78%", avgScore: "3.5", trend: "-0.2", risk: "High" },
  { className: "Class A", completion: "90%", avgScore: "4.0", trend: "+0.3", risk: "Low" },
];

function ClassReport() {
  return (
    <div className="min-h-screen bg-[#f8faff] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Class Report</h1>
              <p className="mt-2 text-sm text-slate-500">Administrative summary of class evaluation performance.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              <Download size={16} />
              Export
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Class</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Completion</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Avg Score</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Trend</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Risk</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.className} className="border-b border-slate-50">
                    <td className="py-4 text-sm font-semibold text-slate-800">{row.className}</td>
                    <td className="py-4 text-sm text-slate-700">{row.completion}</td>
                    <td className="py-4 text-sm text-slate-700">{row.avgScore}</td>
                    <td className={`py-4 text-sm font-semibold ${row.trend.startsWith("+") ? "text-emerald-600" : "text-rose-600"}`}>{row.trend}</td>
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

export default ClassReport;
