import { useNavigate } from 'react-router-dom';
import { Star, User, MessageSquare } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { StudentData } from '../../../hooks/useTeacherDashboardData';

interface StudentTableRowProps {
  student: StudentData;
  onProfile: (id: number) => void;
  onMessage: (id: number) => void;
}

export default function StudentTableRow({ student, onProfile, onMessage }: StudentTableRowProps) {
  const navigate = useNavigate();

  const handleProfile = () => onProfile(student.id);
  const handleMessage = () => onMessage(student.id);

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full overflow-hidden border border-slate-100 shrink-0">
            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{student.name}</p>
            <p className="text-[10px] text-slate-400">ID: {student.studentId}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={cn(
          "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider",
          student.gender === 'male' ? "bg-blue-100 text-blue-600" : 
          student.gender === 'female' ? "bg-pink-100 text-pink-600" : "bg-slate-100 text-slate-500"
        )}>
          {student.gender || '--'}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-bold text-slate-900">{student.generation || '—'}</span>
          <span className="text-[10px] text-slate-500">{student.class || 'Unassigned'}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        {student.rating !== null ? (
          <div className="flex flex-col">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn("w-3 h-3 fill-current", i >= Math.floor(student.rating!) && "text-slate-200 fill-slate-200")} 
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-900 mt-1">{Number(student.rating).toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-300 font-bold">--</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={cn(
          "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider",
          student.status === 'Healthy' ? "bg-emerald-100 text-emerald-600" : 
          student.status === 'Action Needed' ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
        )}>
          {student.status}
        </span>
      </td>
      <td className="px-6 py-4 text-xs text-slate-500 font-medium">{student.lastEval}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={handleProfile}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
          >
            <User className="w-3.5 h-3.5 text-slate-400" />
            Profile
          </button>
          <button 
            onClick={handleMessage}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white rounded-lg shadow-sm transition-all active:scale-95",
              student.status === 'Action Needed' ? "bg-rose-500 hover:bg-rose-600 shadow-rose-100" : "bg-slate-800 hover:bg-slate-900"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Message
          </button>
        </div>
      </td>
    </tr>
  );
}

