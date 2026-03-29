import { Star, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import type { Gender } from '../../lib/teacher/types';

interface StudentCardProps {
  id: number;
  name: string;
  avatar: string;
  studentId: string;
  generation: string;
  className: string;
  gender: Gender;
  rating: number | null;
  ratingScale?: number;
  status: 'Healthy' | 'Action Needed' | 'No Data';
  lastEval?: string;
  index?: number;
  onMessageClick?: (id: number) => void;
}

export default function StudentCard({
  id,
  name,
  avatar,
  studentId,
  generation,
  className,
  gender,
  rating,
  ratingScale = 5,
  status,
  lastEval = 'No Data',
  index = 0,
  onMessageClick,
}: StudentCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.05 }}
      viewport={{ once: true, amount: 0.2 }}
      className={cn(
        "bg-white rounded-2xl border shadow-sm transition-all overflow-hidden flex flex-col hover-lift",
        status === 'Action Needed' 
          ? "border-rose-100 shadow-rose-100/50 hover:shadow-md hover:border-rose-300" 
          : "border-slate-200 hover:shadow-md"
      )}
    >
      <div className="p-6 flex items-start gap-4">
        <div className={cn(
          "rounded-full overflow-hidden border-2 shrink-0 relative",
          status === 'Action Needed' ? "border-rose-100" : "border-slate-100"
        )}>
          <img src={avatar} alt={name} className="w-14 h-14 object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900 truncate">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              "text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider",
              status === 'Action Needed' ? "text-rose-600 bg-rose-50" : "text-primary bg-primary/5"
            )}>
              {generation}
            </span>
            <span className="text-xs font-bold text-slate-500">{className}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-wider uppercase">ID: {studentId}</p>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-50 border-t border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Avg Score</p>
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-400">
              {[...Array(ratingScale)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "w-3.5 h-3.5 fill-current", 
                    i >= Math.floor(rating || 0) && "text-slate-200 fill-slate-200"
                  )} 
                />
              ))}
            </div>
            <span className={cn(
              "text-sm font-black",
              status === 'Action Needed' ? "text-rose-600" : 
              status === 'Healthy' ? "text-emerald-600" : "text-slate-400"
            )}>
              {rating !== null ? Number(rating).toFixed(1) : 'N/A'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Last Eval</p>
          <p className="text-xs font-bold text-slate-700">{lastEval}</p>
        </div>
      </div>

      <div className="p-4 bg-white mt-auto flex gap-3">
        <button 
          onClick={() => navigate(`/teacher/students/${id}`)}
          className="flex-1 py-2.5 bg-white border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all pressable"
        >
          Profile
        </button>
        <button 
          onClick={() => onMessageClick ? onMessageClick(id) : navigate(`/teacher/messages?contactId=${Number(id)}`)}
          className={cn(
            "flex-1 py-2.5 border-2 flex justify-center items-center gap-2 rounded-xl text-xs font-bold transition-all shadow-lg pressable",
            status === 'Action Needed' 
              ? "bg-rose-600 border-rose-600 hover:bg-rose-700 hover:border-rose-700 text-white shadow-rose-600/20" 
              : "bg-slate-800 border-slate-800 hover:bg-slate-900 hover:border-slate-900 text-white shadow-slate-800/20"
          )}
        >
          <MessageSquare className="w-4 h-4" /> Message
        </button>
      </div>
    </motion.div>
  );
}

