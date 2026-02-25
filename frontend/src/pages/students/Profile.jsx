import React from "react";
import { User, Mail, Phone, GraduationCap, MapPin, CalendarDays, Pencil } from "lucide-react";

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
        <Icon size={16} className="text-slate-400" />
        {value}
      </p>
    </div>
  );
}

function Profile() {
  return (
    <div className="min-h-screen bg-[#f8faff] p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-100">
                <User size={34} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Student Profile</p>
                <h1 className="mt-1 text-3xl font-bold text-slate-900">Reaksmey SAN</h1>
                <p className="text-sm text-slate-500">ID: PNC2026-048</p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoItem icon={Mail} label="Email" value="reaksmey.san@student.pnc.edu.kh" />
              <InfoItem icon={Phone} label="Phone" value="+855 12 345 678" />
              <InfoItem icon={GraduationCap} label="Program" value="Web Development" />
              <InfoItem icon={MapPin} label="Location" value="Phnom Penh, Cambodia" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Academic Snapshot</h2>
            <div className="mt-5 space-y-4">
              <InfoItem icon={CalendarDays} label="Joined" value="Jan 10, 2024" />
              <InfoItem icon={GraduationCap} label="Year" value="Year 2" />
              <InfoItem icon={User} label="Mentor" value="Serey Roth" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-bold text-slate-900">Bio</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Passionate web development student focused on building practical and user-friendly applications.
            Interested in frontend architecture, clean UI implementation, and continuous learning through real projects.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Profile;
