import React from "react";
import { Users, School, FileBarChart2, AlertTriangle } from "lucide-react";

function StatCard({ title, value, icon: Icon, tone }) {
  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={20} />
        </div>
      </div>
    </article>
  );
}

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#f8faff] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor overall platform activity, class performance, and operational risks.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Users" value="1,248" icon={Users} tone="bg-indigo-50 text-indigo-600" />
          <StatCard title="Active Classes" value="42" icon={School} tone="bg-blue-50 text-blue-600" />
          <StatCard title="Reports Generated" value="318" icon={FileBarChart2} tone="bg-emerald-50 text-emerald-600" />
          <StatCard title="Flagged Cases" value="7" icon={AlertTriangle} tone="bg-rose-50 text-rose-600" />
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-bold text-slate-900">Recent System Updates</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
              Evaluation cycle Q1 2026 has been opened for all active classes.
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
              3 new education officers were assigned to Generation 2027.
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
              Monthly report export completed successfully.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
