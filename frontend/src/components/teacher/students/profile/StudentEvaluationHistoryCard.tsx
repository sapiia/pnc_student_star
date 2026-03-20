import { ClipboardList, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { formatShortDate } from '../../../../lib/teacher/utils';
import type { EvaluationRecord } from '../../../../lib/teacher/types';

type StudentEvaluationHistoryCardProps = {
  evaluations: EvaluationRecord[];
  selectedEvaluationId: number | null;
  globalRatingScale: number;
  onSelectEvaluation: (evaluationId: number) => void;
};

export default function StudentEvaluationHistoryCard({
  evaluations,
  selectedEvaluationId,
  globalRatingScale,
  onSelectEvaluation,
}: StudentEvaluationHistoryCardProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Evaluation History</h3>
            <p className="text-xs text-slate-500">{evaluations.length} evaluation(s) found</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {evaluations.length > 0 ? (
          <div className="space-y-4">
            {evaluations.map((evaluation, index) => {
              const averageScore = Number(evaluation.average_score || 0);

              return (
                <motion.button
                  key={evaluation.id}
                  type="button"
                  onClick={() => onSelectEvaluation(Number(evaluation.id))}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full rounded-2xl border-2 p-5 text-left transition-all shadow-sm ${
                    selectedEvaluationId === Number(evaluation.id)
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-slate-200 bg-white hover:border-primary/40 hover:shadow-lg'
                  }`}
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex flex-1 min-w-0 items-start gap-4">
                      <div className="size-12 shrink-0 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                        <ClipboardList className="w-6 h-6" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-black text-slate-900">
                          {evaluation.period || `Evaluation #${evaluations.length - index}`}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Finished: {formatShortDate(evaluation.submitted_at || evaluation.created_at)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            {evaluation.criteria_count || evaluation.responses?.length || 0} criteria
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: globalRatingScale }).map((_, index) => (
                          <Star
                            key={`${evaluation.id}-${index}`}
                            className={`w-4 h-4 ${
                              index < Math.floor(averageScore)
                                ? 'fill-primary text-primary'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-black text-slate-900">{averageScore.toFixed(1)}</span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <ClipboardList className="mx-auto mb-4 w-12 h-12 text-slate-300" />
            <p className="text-sm font-bold text-slate-500">No evaluations found</p>
            <p className="mt-1 text-xs text-slate-400">
              This student hasn&apos;t submitted any evaluations yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
