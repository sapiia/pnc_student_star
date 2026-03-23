import type { FeedbackItem } from './types';
import { formatShortDate } from './utils';

type RecentFeedbackCardProps = {
  feedbackItems: FeedbackItem[];
  onViewAll: () => void;
};

export default function RecentFeedbackCard({
  feedbackItems,
  onViewAll,
}: RecentFeedbackCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Recent Feedback
        </h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {feedbackItems.length > 0 ? (
          feedbackItems.map((feedback) => (
            <div key={feedback.id} className="flex gap-3">
              <div className="size-8 shrink-0 overflow-hidden rounded-full bg-slate-100">
                {feedback.teacher_profile_image ? (
                  <img
                    alt={feedback.teacher_name || 'Teacher'}
                    src={feedback.teacher_profile_image}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-slate-400">
                    {(feedback.teacher_name || 'T').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold">
                  {feedback.teacher_name || 'Teacher'}
                  <span className="ml-2 text-[10px] font-normal text-slate-400">
                    {formatShortDate(String(feedback.created_at || ''))}
                  </span>
                </p>
                <p className="line-clamp-3 text-xs italic leading-relaxed text-slate-600">
                  {feedback.comment}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-400">
            No recent feedback yet.
          </div>
        )}
      </div>
    </div>
  );
}
