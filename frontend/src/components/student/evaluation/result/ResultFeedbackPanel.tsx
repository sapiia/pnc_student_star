import { useEffect, useRef } from 'react';
import { Users } from 'lucide-react';
import { formatLongDate } from '../../../../lib/evaluationUtils';
import type { FeedbackItem } from './types';

interface Props {
  feedbacks: FeedbackItem[];
  period: string;
  onViewAll: () => void;
}

export function ResultFeedbackPanel({ feedbacks, period, onViewAll }: Props) {
  const feedbackScrollRef = useRef(null as HTMLDivElement | null);

  useEffect(() => {
    const container = feedbackScrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [feedbacks]);

  return (
    <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black uppercase tracking-widest text-slate-900 md:text-lg">
            Teacher Feedback
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 md:text-xs">
            {period || 'Current'}
          </p>
        </div>

        <button
          onClick={onViewAll}
          className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline md:text-xs"
        >
          View All
        </button>
      </div>

      {feedbacks.length > 0 ? (
        <div
          ref={feedbackScrollRef}
          className="max-h-[19rem] space-y-4 overflow-y-auto pr-1"
        >
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 md:h-10 md:w-10">
                {feedback.teacher_profile_image ? (
                  <img
                    src={feedback.teacher_profile_image}
                    alt={feedback.teacher_name || 'Teacher'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Users className="h-4 w-4 text-slate-400" />
                )}
              </div>

              <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50 p-3 md:p-4">
                <div className="mb-2 flex flex-col justify-between gap-1 md:flex-row md:items-center md:gap-3">
                  <p className="text-sm font-black text-slate-900">
                    {feedback.teacher_name || 'Teacher'}
                  </p>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 md:text-[10px]">
                    {formatLongDate(String(feedback.created_at || ''))}
                  </span>
                </div>
                <p className="line-clamp-4 text-sm font-medium leading-relaxed text-slate-600">
                  {feedback.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
          No feedback yet.
        </div>
      )}
    </div>
  );
}
