import React from "react";
import { ChevronLeft, CalendarDays, CircleCheck } from "lucide-react";

function ViewEvaluation({ record, onBack = () => {} }) {
  if (!record) {
    return (
      <div className="min-h-screen bg-[#f8faff] p-4 md:p-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-slate-600">No evaluation selected.</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <ChevronLeft size={16} />
            Back to My Evaluation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff] p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-3xl font-bold text-slate-900">Evaluation Detail</h1>
          <p className="mt-2 text-sm text-slate-500">Review the selected evaluation record.</p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Period</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{record.period}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Score</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{record.score} / 5</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
              <p className="mt-2 inline-flex items-center gap-2 text-xl font-bold text-emerald-600">
                <CircleCheck size={18} />
                {record.status}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Last Updated</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <CalendarDays size={16} className="text-slate-400" />
              {record.updated}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ViewEvaluation;
