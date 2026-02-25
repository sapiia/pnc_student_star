import React from "react";
import { ClipboardCheck, CalendarDays, CircleCheck, Plus, Eye } from "lucide-react";

const evaluationHistory = [
  { period: "Q2 2025", status: "Completed", score: 3.7, updated: "Jun 30, 2025" },
  { period: "Q3 2025", status: "Completed", score: 3.9, updated: "Sep 29, 2025" },
  { period: "Q4 2025", status: "Completed", score: 4.1, updated: "Dec 22, 2025" },
];

function MyEvaluation({ onStartEvaluation = () => {}, onViewEvaluation = () => {} }) {
  return (
    <div className="min-h-screen bg-[#f8faff] p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                <ClipboardCheck size={14} />
                My Evaluation
              </p>
              <h1 className="text-3xl font-bold text-slate-900">Track Your Evaluation Progress</h1>
              <p className="max-w-2xl text-sm text-slate-500">
                Review your current status, see your latest results, and start a new self-assessment when you are ready.
              </p>
            </div>
            <button
              type="button"
              onClick={onStartEvaluation}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
            >
              <Plus size={18} />
              Start New Evaluation
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current Cycle</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">Q1 2026</p>
            <p className="mt-1 text-sm text-slate-500">Self-Assessment in progress</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Overall Score</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">4.1 / 5</p>
            <p className="mt-1 text-sm text-slate-500">Based on your latest completed cycle</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Next Review</p>
            <p className="mt-2 inline-flex items-center gap-2 text-2xl font-bold text-slate-900">
              <CalendarDays size={20} />
              Mar 30, 2026
            </p>
            <p className="mt-1 text-sm text-slate-500">Meet your mentor to discuss your growth plan</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-bold text-slate-900">Recent Evaluation History</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Period</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Score</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Last Updated</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {evaluationHistory.map((item) => (
                  <tr key={item.period} className="border-b border-slate-50">
                    <td className="py-4 text-sm font-semibold text-slate-800">{item.period}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        <CircleCheck size={14} />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-semibold text-slate-700">{item.score} / 5</td>
                    <td className="py-4 text-sm text-slate-500">{item.updated}</td>
                    <td className="py-4">
                      <button
                        type="button"
                        onClick={() => onViewEvaluation(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        <Eye size={14} />
                        View
                      </button>
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

export default MyEvaluation;
