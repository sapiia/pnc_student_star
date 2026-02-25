import React, { useState } from "react";
import { Settings as SettingsIcon, ShieldCheck, Bell, Save } from "lucide-react";

function ToggleRow({ label, desc, value, onChange }) {
  return (
    <div className="flex items-start justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{desc}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full ${value ? "bg-indigo-600" : "bg-slate-300"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${value ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function AdminSettings() {
  const [auditLog, setAuditLog] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8faff] p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            <SettingsIcon size={14} />
            Admin Settings
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Platform Controls</h1>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
            <ShieldCheck size={18} />
            Security
          </h2>
          <div className="mt-4 space-y-3">
            <ToggleRow
              label="Audit Logging"
              desc="Track all sensitive admin actions."
              value={auditLog}
              onChange={() => setAuditLog((prev) => !prev)}
            />
            <ToggleRow
              label="Maintenance Mode"
              desc="Temporarily restrict user access."
              value={maintenanceMode}
              onChange={() => setMaintenanceMode((prev) => !prev)}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
            <Bell size={18} />
            Notifications
          </h2>
          <div className="mt-4 space-y-3">
            <ToggleRow
              label="System Alerts"
              desc="Receive platform incidents and critical status updates."
              value={systemAlerts}
              onChange={() => setSystemAlerts((prev) => !prev)}
            />
          </div>
          <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            <Save size={16} />
            Save Admin Settings
          </button>
        </section>
      </div>
    </div>
  );
}

export default AdminSettings;
