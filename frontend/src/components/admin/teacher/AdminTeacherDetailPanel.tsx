import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Pencil, Trash2, Mail, Calendar, Briefcase, MapPin, GraduationCap } from 'lucide-react';
import type { TeacherRecord } from './adminTeacherRecords.types';

interface AdminTeacherDetailPanelProps {
  teacher: TeacherRecord | null;
  onClose: () => void;
  onEdit: (teacher: TeacherRecord) => void;
  onHardDelete: (teacher: TeacherRecord) => void;
}

export default function AdminTeacherDetailPanel({
  teacher,
  onClose,
  onEdit,
  onHardDelete,
}: AdminTeacherDetailPanelProps) {
  if (!teacher) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="w-full md:w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col shrink-0 relative z-20 fixed md:static inset-0 md:inset-auto"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900">Teacher Details</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            aria-label="Close detail panel"
          >
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Profile Header */}
          <div className="text-center">
            <div className="size-24 rounded-3xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 mx-auto mb-4 shadow-md">
              <img src={teacher.profileImage} alt={`${teacher.name}'s profile`} className="w-full h-full object-cover" />
            </div>
            <h4 className="text-xl font-black text-slate-900">{teacher.name}</h4>
            <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mt-1 leading-none">{teacher.department}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-4">
            <InfoCard icon={Mail} label="Email Address" value={teacher.email} />
            <InfoCard icon={Briefcase} label="Specialization" value={teacher.specialization} />
            <InfoCard icon={Calendar} label="Join Date" value={teacher.joinDate} />
            <InfoCard icon={MapPin} label="Phone" value={teacher.phone || 'N/A'} />
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-slate-100 flex gap-3">
            <button 
              onClick={() => onEdit(teacher)}
              className="flex-1 py-4 bg-primary/10 text-primary font-black rounded-xl text-xs uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-2 shadow-sm"
              aria-label={`Edit ${teacher.name}`}
            >
              <Pencil className="w-4 h-4" />
              Edit Teacher
            </button>
            <button 
              onClick={() => onHardDelete(teacher)}
              className="flex-1 py-4 bg-rose-50 text-rose-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2 shadow-sm"
              aria-label={`Delete ${teacher.name}`}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoCard({ icon: Icon, label, value }: InfoCardProps) {
  return (
    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-3 text-slate-400 mb-1">
        <Icon className="w-3 h-3" />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

