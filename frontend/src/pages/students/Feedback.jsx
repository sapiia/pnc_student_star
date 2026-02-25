import React from "react";
import { MessageSquare, Star, CalendarDays } from "lucide-react";

const feedbackItems = [
  {
    mentor: "Serey Roth",
    date: "Dec 22, 2025",
    area: "Job & Study",
    rating: 5,
    message: "Excellent consistency this quarter. Your project ownership and follow-through were very strong.",
  },
  {
    mentor: "Dara Vann",
    date: "Sep 29, 2025",
    area: "Human & Support",
    rating: 4,
    message: "Good teamwork progress. Continue practicing proactive communication in group tasks.",
  },
  {
    mentor: "Malis Chheang",
    date: "Jun 30, 2025",
    area: "Choice & Behavior",
    rating: 4,
    message: "Decision-making improved. Keep building daily habits to maintain this momentum.",
  },
];

function Feedback() {
  return (
    <div className="min-h-screen bg-[#f8faff] p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            <MessageSquare size={14} />
            Feedback
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Mentor Feedback</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Review all comments and ratings from mentors across your evaluations.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Feedback</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{feedbackItems.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Average Rating</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">4.3 / 5</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Latest Feedback</p>
            <p className="mt-2 inline-flex items-center gap-2 text-lg font-bold text-slate-900">
              <CalendarDays size={18} />
              Dec 22, 2025
            </p>
          </div>
        </section>

        <section className="space-y-4">
          {feedbackItems.map((item, index) => (
            <article key={`${item.mentor}-${item.date}-${index}`} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{item.mentor}</h2>
                  <p className="text-sm text-slate-500">{item.area}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= item.rating ? "fill-indigo-500 text-indigo-500" : "text-slate-300"}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-500">{item.date}</span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{item.message}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Feedback;
