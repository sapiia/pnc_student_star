import React from "react";
import { User, Mail, Phone, Building2, ShieldCheck } from "lucide-react";

function AdminProfile() {
  return (
    <div className="min-h-screen bg-[#f8faff] p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 text-white">
              <User size={34} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Admin Profile</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">System Administrator</h1>
              <p className="text-sm text-slate-500">Role: Platform Admin</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <Mail size={16} className="text-slate-400" />
              admin@pnc.edu.kh
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <Phone size={16} className="text-slate-400" />
              +855 11 000 999
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Department</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <Building2 size={16} className="text-slate-400" />
              Operations & Governance
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Permissions</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <ShieldCheck size={16} className="text-slate-400" />
              Full Access
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminProfile;
