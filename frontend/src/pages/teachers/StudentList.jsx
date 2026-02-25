import React, { useMemo, useState } from "react";
import { Users, GraduationCap } from "lucide-react";

const generationCards = [
  {
    generation: "Generation 2026",
    badge: "CURRENT",
    cards: [
      { classGroup: "WEB A", subtitle: "Web Development Core", total: 25 },
      { classGroup: "WEB B", subtitle: "Web Development Core", total: 24 },
      { classGroup: "WEB C", subtitle: "Web Development Core", total: 26 },
    ],
  },
  {
    generation: "Generation 2027",
    badge: "UPCOMING",
    cards: [
      { classGroup: "Class A", subtitle: "General Foundation", total: 30 },
      { classGroup: "Class B", subtitle: "General Foundation", total: 28 },
      { classGroup: "Class C", subtitle: "General Foundation", total: 29 },
      { classGroup: "Class D", subtitle: "General Foundation", total: 27 },
    ],
  },
];

function StudentList({ onViewClass = () => {} }) {
  const [selectedGenerationYear, setSelectedGenerationYear] = useState("all");

  const displayedGenerationCards = useMemo(() => {
    const parseYear = (label) => {
      const match = label.match(/\d{4}/);
      return match ? Number(match[0]) : 0;
    };

    const sorted = [...generationCards].sort((a, b) => parseYear(b.generation) - parseYear(a.generation));

    if (selectedGenerationYear === "all") {
      return sorted;
    }

    return sorted.filter((group) => String(parseYear(group.generation)) === selectedGenerationYear);
  }, [selectedGenerationYear]);

  return (
    <div className="min-h-screen bg-[#f3f5fa] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="rounded-3xl border border-[#e4e8f0] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-[#1b2235]">Student List</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedGenerationYear("all")}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  selectedGenerationYear === "all"
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedGenerationYear("2027")}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  selectedGenerationYear === "2027"
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                2027
              </button>
              <button
                type="button"
                onClick={() => setSelectedGenerationYear("2026")}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  selectedGenerationYear === "2026"
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                2026
              </button>
            </div>
          </div>
        </section>

        {displayedGenerationCards.map((group) => (
          <section key={group.generation} className="rounded-3xl border border-[#e4e8f0] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#1c2235]">{group.generation}</h2>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold tracking-wide text-indigo-700">
                {group.badge}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.cards.map((card) => (
                <article
                  key={`${group.generation}-${card.classGroup}`}
                  onClick={() => onViewClass(card.classGroup)}
                  className="cursor-pointer rounded-3xl border border-[#e6eaf2] bg-white p-4 transition hover:border-indigo-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-[#1e2538]">{card.classGroup}</h3>
                      <p className="mt-1 text-xs font-medium text-indigo-500">{card.subtitle}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                      <GraduationCap size={18} />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    <span className="h-7 w-7 rounded-full bg-slate-200" />
                    <span className="h-7 w-7 rounded-full bg-slate-300" />
                    <span className="h-7 w-7 rounded-full bg-slate-400" />
                    <p className="ml-2 text-xs font-semibold text-[#2f3a4f]">{card.total} Students</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onViewClass(card.classGroup)}
                    className="mt-5 w-full rounded-full bg-slate-100 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    View Students
                  </button>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default StudentList;
