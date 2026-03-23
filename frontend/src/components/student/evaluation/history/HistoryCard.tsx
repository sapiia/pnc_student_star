import { motion } from 'framer-motion';
import { CalendarDays, Clock3, FileText, Pencil } from 'lucide-react';
import StarRating from '../../../ui/StarRating';
import { useNavigate } from 'react-router-dom';

interface Props {
  item: {
    id: number;
    title: string;
    completedLabel: string;
    nextDueLabel: string;
    rating: number;
    ratingScale: number;
  };
  canEdit: boolean;
  index: number;
}

export function HistoryCard({ 
  item, 
  canEdit, 
  index 
}: Props) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col group hover:border-primary/30 transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="size-12 md:size-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
            <FileText className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <div className="space-y-1 overflow-hidden">
            <h4 className="text-base md:text-lg font-bold text-slate-900 truncate">{item.title}</h4>
            <div className="flex flex-col gap-1 text-[10px] md:text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Finished: {item.completedLabel}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Due: {item.nextDueLabel}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <StarRating rating={item.rating} max={item.ratingScale} starClassName="w-3.5 h-3.5" />
            <span className="text-lg font-black text-slate-900">{item.rating.toFixed(1)}</span>
          </div>
          <button
            onClick={() => navigate('/results', { state: { evaluationId: item.id } })}
            className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            View Full Report
          </button>
          {canEdit && (
            <button
              onClick={() => navigate(`/evaluate?edit=${item.id}`)}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
              title="Edit Evaluation"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

