import React, { useState } from "react";
import { Settings as SettingsIcon, Bell, ShieldCheck, Lock, Save } from "lucide-react";

function ToggleRow({ label, description, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative mt-1 h-6 w-11 rounded-full transition ${value ? "bg-indigo-600" : "bg-slate-300"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${value ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function TeacherSettings() {
  const [reviewAlerts, setReviewAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [sensitiveDataLock, setSensitiveDataLock] = useState(true);
  const [approvalConfirmation, setApprovalConfirmation] = useState(true);

  return (
    <div className="min-h-screen bg-[#f8faff] p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            <SettingsIcon size={14} />
            Teacher Settings
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Education Officer Preferences</h1>
          <p className="mt-2 text-sm text-slate-500">Control alerts, review workflow, and security settings.</p>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
            <Bell size={18} />
            Notifications
          </h2>
          <div className="mt-4 space-y-3">
            <ToggleRow
              label="Review Alerts"
              description="Get alerts when new student evaluations are submitted."
              value={reviewAlerts}
              onChange={() => setReviewAlerts((prev) => !prev)}
            />
            <ToggleRow
              label="Weekly Digest"
              description="Receive weekly class performance summary."
              value={weeklyDigest}
              onChange={() => setWeeklyDigest((prev) => !prev)}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
            <ShieldCheck size={18} />
            Review Controls
          </h2>
          <div className="mt-4 space-y-3">
            <ToggleRow
              label="Sensitive Data Lock"
              description="Require additional verification before opening sensitive student data."
              value={sensitiveDataLock}
              onChange={() => setSensitiveDataLock((prev) => !prev)}
            />
            <ToggleRow
              label="Approval Confirmation"
              description="Ask confirmation before final feedback submission."
              value={approvalConfirmation}
              onChange={() => setApprovalConfirmation((prev) => !prev)}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
            <Lock size={18} />
            Password
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              type="password"
              placeholder="Current password"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <input
              type="password"
              placeholder="New password"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            type="button"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Save size={16} />
            Save Teacher Settings
          </button>
        </section>
      </div>
    </div>
  );
}

export default TeacherSettings;
