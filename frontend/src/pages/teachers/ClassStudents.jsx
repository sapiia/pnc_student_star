import React from "react";
import { ChevronLeft } from "lucide-react";

const students = [
  { id: "PNC2026-048", name: "Sokha Chann", generation: "Generation 2026", classGroup: "WEB A", latestScore: "4.1 / 5", status: "Active" },
  { id: "PNC2026-052", name: "Dara Vann", generation: "Generation 2026", classGroup: "WEB A", latestScore: "3.8 / 5", status: "Needs Review" },
  { id: "PNC2026-061", name: "Malis Chheang", generation: "Generation 2026", classGroup: "WEB B", latestScore: "4.0 / 5", status: "Active" },
  { id: "PNC2026-077", name: "Nita Som", generation: "Generation 2026", classGroup: "WEB B", latestScore: "3.5 / 5", status: "At Risk" },
  { id: "PNC2026-081", name: "Serey Roth", generation: "Generation 2026", classGroup: "WEB C", latestScore: "4.3 / 5", status: "Active" },
  { id: "PNC2026-093", name: "Piseth Long", generation: "Generation 2026", classGroup: "WEB C", latestScore: "3.6 / 5", status: "Needs Review" },
  { id: "PNC2027-101", name: "Lina Sok", generation: "Generation 2027", classGroup: "Class A", latestScore: "4.0 / 5", status: "Active" },
  { id: "PNC2027-104", name: "Nary Kim", generation: "Generation 2027", classGroup: "Class B", latestScore: "3.7 / 5", status: "Needs Review" },
  { id: "PNC2027-109", name: "Vichea Lim", generation: "Generation 2027", classGroup: "Class C", latestScore: "4.2 / 5", status: "Active" },
  { id: "PNC2027-113", name: "Rithy Hong", generation: "Generation 2027", classGroup: "Class D", latestScore: "3.4 / 5", status: "At Risk" },
];

function statusTone(status) {
  if (status === "Active") return "bg-emerald-50 text-emerald-600";
  if (status === "Needs Review") return "bg-amber-50 text-amber-600";
  return "bg-rose-50 text-rose-600";
}

function ClassStudents({ classGroup = "", onBack = () => {} }) {
  const classStudents = students.filter((student) => student.classGroup === classGroup);

  return (
    <div className="min-h-screen bg-[#f3f5fa] p-4 md:p-6">
      <button
        type="button"
        onClick={onBack}
        className="z-20 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm md:fixed md:left-8 md:top-20 md:z-40 lg:left-[18rem]"
      >
        <ChevronLeft size={16} />
        Back to Classes
      </button>

      <div className="mx-auto max-w-7xl space-y-6 pt-4 md:pt-14">
        <section className="rounded-3xl border border-[#e4e8f0] bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-[#1f2538]">{classGroup} Students</h1>
          <p className="mt-1 text-sm text-slate-500">List of students in this class.</p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Student ID</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Name</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Generation</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Score</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                      No students in this class yet.
                    </td>
                  </tr>
                ) : (
                  classStudents.map((student) => (
                    <tr key={student.id} className="border-b border-slate-50">
                      <td className="py-4 text-sm font-medium text-slate-600">{student.id}</td>
                      <td className="py-4 text-sm font-semibold text-slate-800">{student.name}</td>
                      <td className="py-4 text-sm text-slate-600">{student.generation}</td>
                      <td className="py-4 text-sm font-semibold text-slate-700">{student.latestScore}</td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ClassStudents;
