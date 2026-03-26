import { X } from 'lucide-react';
import { motion } from 'motion/react';

import type { EditUserFormState } from './adminDashboard.types';

interface EditPendingUserModalProps {
  isOpen: boolean;
  user: EditUserFormState;
  error: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: any) => void;
  onFieldChange: <Field extends keyof EditUserFormState>(
    field: Field,
    value: EditUserFormState[Field],
  ) => void;
}

interface FormFieldProps {
  label: string;
  children: any;
}

function FormField({ label, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      {children}
    </div>
  );
}

const INPUT_CLASS_NAME =
  'w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20';

export default function EditPendingUserModal({
  isOpen,
  user,
  error,
  isSubmitting,
  onClose,
  onSubmit,
  onFieldChange,
}: EditPendingUserModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">Edit Pending User</h3>
            <p className="text-xs font-bold text-slate-500">Update the user information below.</p>
          </div>
          <button
            type="button"
            onClick={() => !isSubmitting && onClose()}
            className="rounded-full p-2 transition-colors hover:bg-slate-100"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="First Name">
              <input
                required
                type="text"
                value={user.firstName}
                onChange={(event) => onFieldChange('firstName', event.target.value)}
                className={INPUT_CLASS_NAME}
              />
            </FormField>
            <FormField label="Last Name">
              <input
                type="text"
                value={user.lastName}
                onChange={(event) => onFieldChange('lastName', event.target.value)}
                className={INPUT_CLASS_NAME}
              />
            </FormField>
          </div>

          <FormField label="Email Address">
            <input
              required
              type="email"
              value={user.email}
              onChange={(event) => onFieldChange('email', event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label="Gender">
              <select
                value={user.gender}
                onChange={(event) => onFieldChange('gender', event.target.value as EditUserFormState['gender'])}
                className={INPUT_CLASS_NAME}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </FormField>
            <FormField label="Role">
              <select
                value={user.role}
                onChange={(event) => onFieldChange('role', event.target.value as EditUserFormState['role'])}
                className={INPUT_CLASS_NAME}
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
              </select>
            </FormField>
            <FormField label="Generation">
              <input
                type="text"
                value={user.generation}
                onChange={(event) => onFieldChange('generation', event.target.value)}
                className={INPUT_CLASS_NAME}
              />
            </FormField>
          </div>

          {user.role === 'Student' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField label="Major">
                <input
                  type="text"
                  value={user.major}
                  onChange={(event) => onFieldChange('major', event.target.value)}
                  className={INPUT_CLASS_NAME}
                />
              </FormField>
              <FormField label="Class">
                <input
                  type="text"
                  value={user.className}
                  onChange={(event) => onFieldChange('className', event.target.value)}
                  className={INPUT_CLASS_NAME}
                />
              </FormField>
              <FormField label="Student ID">
                <input
                  type="text"
                  value={user.studentId}
                  onChange={(event) => onFieldChange('studentId', event.target.value)}
                  className={INPUT_CLASS_NAME}
                />
              </FormField>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-primary px-5 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
