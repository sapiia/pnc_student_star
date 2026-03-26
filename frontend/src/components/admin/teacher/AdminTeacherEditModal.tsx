import { AnimatePresence, motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';
import type { TeacherRecord, TeacherEditFormData } from './adminTeacherRecords.types';

interface AdminTeacherEditModalProps {
  teacher: TeacherRecord | null;
  formData: TeacherEditFormData;
  isUpdating: boolean;
  onClose: () => void;
  onFieldChange: <K extends keyof TeacherEditFormData>(field: K, value: TeacherEditFormData[K]) => void;
  onSave: () => void;
}

export default function AdminTeacherEditModal({
  teacher,
  formData,
  isUpdating,
  onClose,
  onFieldChange,
  onSave,
}: AdminTeacherEditModalProps) {
  const isSaveDisabled = isUpdating || !formData.name || !formData.email;

  return (
    <AnimatePresence>
      {teacher ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isUpdating && onClose()}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
          >
            <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 mx-auto">
              <GraduationCap className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 tracking-tight text-center">
              Edit Teacher
            </h3>
            
            <p className="mt-3 text-sm text-slate-600 font-bold leading-relaxed text-center">
              Update teacher information and department details.
            </p>

            <div className="mt-6 space-y-4">
              <FormField label="Full Name">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => onFieldChange('name' as const, e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all outline-none shadow-sm"
                  disabled={isUpdating}
                  aria-label="Teacher full name"
                  placeholder="Enter full name"
                />
              </FormField>
              <FormField label="Email">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => onFieldChange('email' as const, e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all outline-none shadow-sm"
                  disabled={isUpdating}
                  aria-label="Teacher email"
                  placeholder="Enter email address"
                />
              </FormField>
              <FormField label="Department">
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => onFieldChange('department' as const, e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all outline-none shadow-sm"
                  disabled={isUpdating}
                  aria-label="Teacher department"
                  placeholder="Enter department"
                />
              </FormField>
              <FormField label="Specialization">
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => onFieldChange('specialization' as const, e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all outline-none shadow-sm"
                  disabled={isUpdating}
                  aria-label="Teacher specialization"
                  placeholder="Enter specialization"
                />
              </FormField>
              <FormField label="Phone">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => onFieldChange('phone' as const, e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all outline-none shadow-sm"
                  disabled={isUpdating}
                  aria-label="Teacher phone number"
                  placeholder="Enter phone number"
                />
              </FormField>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={onClose}
                disabled={isUpdating}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={isSaveDisabled}
                className="flex-1 py-3 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg bg-primary hover:bg-primary/90 shadow-primary/20 disabled:opacity-60"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

interface FormFieldProps {
  children: React.ReactNode;
  label: string;
}

function FormField({ children, label }: FormFieldProps) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

