import React, { useMemo, useState } from "react";
import { CalendarDays, Users, GraduationCap, Plus } from "lucide-react";

const initialGenerations = [
  {
    id: "gen-2026",
    name: "Generation 2026",
    status: "current",
    classes: [
      { id: "gen-2026-web-a", className: "WEB A", subtitle: "Web Development Core", students: 25 },
      { id: "gen-2026-web-b", className: "WEB B", subtitle: "Web Development Core", students: 24 },
      { id: "gen-2026-web-c", className: "WEB C", subtitle: "Web Development Core", students: 26 },
    ],
  },
  {
    id: "gen-2027",
    name: "Generation 2027",
    status: "upcoming",
    classes: [
      { id: "gen-2027-class-a", className: "Class A", subtitle: "General Foundation", students: 30 },
      { id: "gen-2027-class-b", className: "Class B", subtitle: "General Foundation", students: 28 },
      { id: "gen-2027-class-c", className: "Class C", subtitle: "General Foundation", students: 29 },
      { id: "gen-2027-class-d", className: "Class D", subtitle: "General Foundation", students: 30 },
    ],
  },
];

function StatCard({ title, value, icon: Icon, tone }) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}>
          <Icon size={16} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </article>
  );
}

function ClassCard({ className, subtitle, students, onViewClass }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">{className}</h3>
          <p className="mt-1 text-sm text-indigo-500">{subtitle}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <GraduationCap size={16} />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2">
        <span className="h-7 w-7 rounded-full bg-slate-200" />
        <span className="h-7 w-7 rounded-full bg-slate-300" />
        <span className="h-7 w-7 rounded-full bg-slate-400" />
        <p className="ml-2 text-sm font-semibold text-slate-700">{students} Students</p>
      </div>
      <button
        type="button"
        onClick={onViewClass}
        className="mt-4 w-full rounded-full bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
      >
        Manage Class
      </button>
    </article>
  );
}

function ManageGenerations({ onViewClass = () => {} }) {
  const [generations, setGenerations] = useState(initialGenerations);
  const [generationName, setGenerationName] = useState("");
  const [generationStatus, setGenerationStatus] = useState("upcoming");
  const [isAddingGeneration, setIsAddingGeneration] = useState(false);
  const [addingClassFor, setAddingClassFor] = useState(null);
  const [newClassName, setNewClassName] = useState("");
  const [newClassSubtitle, setNewClassSubtitle] = useState("");
  const [newClassStudents, setNewClassStudents] = useState("");

  const totalStudents = useMemo(
    () => generations.reduce((total, generation) => total + generation.classes.reduce((sum, item) => sum + item.students, 0), 0),
    [generations]
  );

  const totalClasses = useMemo(() => generations.reduce((total, generation) => total + generation.classes.length, 0), [generations]);

  const handleAddGeneration = (event) => {
    event.preventDefault();
    const name = generationName.trim();
    if (!name) {
      return;
    }

    setGenerations((prev) => [
      ...prev,
      {
        id: `gen-${Date.now()}`,
        name,
        status: generationStatus,
        classes: [],
      },
    ]);

    setGenerationName("");
    setGenerationStatus("upcoming");
    setIsAddingGeneration(false);
  };

  const handleAddClass = (event) => {
    event.preventDefault();
    if (!addingClassFor || !newClassName.trim()) {
      return;
    }

    const students = Number(newClassStudents);
    setGenerations((prev) =>
      prev.map((generation) =>
        generation.id === addingClassFor
          ? {
              ...generation,
              classes: [
                ...generation.classes,
                {
                  id: `${generation.id}-class-${Date.now()}`,
                  className: newClassName.trim(),
                  subtitle: newClassSubtitle.trim() || "General Foundation",
                  students: Number.isNaN(students) ? 0 : students,
                },
              ],
            }
          : generation
      )
    );

    setNewClassName("");
    setNewClassSubtitle("");
    setNewClassStudents("");
    setAddingClassFor(null);
  };

  const startAddClass = (generationId) => {
    setAddingClassFor(generationId);
    setNewClassName("");
    setNewClassSubtitle("");
    setNewClassStudents("");
  };

  return (
    <div className="min-h-screen bg-[#f3f5fa] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Manage Generations</h1>
              <p className="mt-1 text-sm text-indigo-500">Organize student cohorts and their respective classes.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingGeneration((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700"
            >
              <Plus size={16} />
              Add Generation
            </button>
          </div>

          {isAddingGeneration && (
            <form onSubmit={handleAddGeneration} className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 md:grid-cols-4">
              <input
                type="text"
                placeholder="Generation name (e.g. Generation 2028)"
                value={generationName}
                onChange={(event) => setGenerationName(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 md:col-span-2"
              />
              <select
                value={generationStatus}
                onChange={(event) => setGenerationStatus(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="current">Current</option>
                <option value="upcoming">Upcoming</option>
              </select>
              <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                Save Generation
              </button>
            </form>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard title="Total Generations" value={generations.length} icon={CalendarDays} tone="bg-indigo-50 text-indigo-600" />
            <StatCard title="Total Students" value={totalStudents} icon={Users} tone="bg-amber-50 text-amber-600" />
            <StatCard title="Active Classes" value={totalClasses} icon={GraduationCap} tone="bg-emerald-50 text-emerald-600" />
          </div>

          {generations.map((generation, generationIndex) => {
            const generationStudents = generation.classes.reduce((sum, item) => sum + item.students, 0);
            const isCurrent = generation.status === "current";
            const isClassFormOpen = addingClassFor === generation.id;

            return (
              <div key={generation.id} className={generationIndex === 0 ? "mt-7" : "mt-9"}>
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-slate-900">{generation.name}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${isCurrent ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"}`}>
                      {isCurrent ? "CURRENT" : "UPCOMING"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-indigo-500">
                      {generationStudents} Students - {generation.classes.length} Classes
                    </p>
                    <button
                      type="button"
                      onClick={() => startAddClass(generation.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      <Plus size={14} />
                      Add Class
                    </button>
                  </div>
                </div>

                {isClassFormOpen && (
                  <form onSubmit={handleAddClass} className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
                    <input
                      type="text"
                      placeholder="Class name (e.g. WEB D)"
                      value={newClassName}
                      onChange={(event) => setNewClassName(event.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                    <input
                      type="text"
                      placeholder="Subtitle"
                      value={newClassSubtitle}
                      onChange={(event) => setNewClassSubtitle(event.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Students"
                      value={newClassStudents}
                      onChange={(event) => setNewClassStudents(event.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                    <div className="flex items-center gap-2">
                      <button type="submit" className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                        Save Class
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingClassFor(null)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {generation.classes.map((item) => (
                    <ClassCard
                      key={item.id}
                      className={item.className}
                      subtitle={item.subtitle}
                      students={item.students}
                      onViewClass={() => onViewClass(item.className)}
                    />
                  ))}
                  <article className="flex min-h-[220px] items-center justify-center rounded-3xl border-2 border-dashed border-indigo-200 bg-white">
                    <button type="button" onClick={() => startAddClass(generation.id)} className="inline-flex flex-col items-center gap-2 text-indigo-600">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <Plus size={14} />
                      </span>
                      <span className="text-sm font-semibold">Add New Class</span>
                    </button>
                  </article>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

export default ManageGenerations;
