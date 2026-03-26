import { Crown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import type { AdminRecord, AdminRecordEditFormData } from './adminRecords.types';

interface AdminRecordEditModalProps {
  admin: AdminRecord | null;
  formData: AdminRecordEditFormData;
  isUpdating: boolean;
  onClose: () => void;
  onFieldChange: <K extends keyof AdminRecordEditFormData>(
    field: K,
    value: AdminRecordEditFormData[K],
  ) => void;
  onSave: () => void;
}

export default function AdminRecordEditModal({
  admin,
  formData,
  isUpdating,
  onClose,
  onFieldChange,
  onSave,
}: AdminRecordEditModalProps) {
  const isSaveDisabled = isUpdating || !formData.name || !formData.email;

  return (
    <AnimatePresence>
      {admin ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!isUpdating) {
                onClose();
              }
            }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Crown className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-black tracking-tight text-slate-900">
              Edit Administrator
            </h3>

            <p className="mt-3 text-sm leading-relaxed font-bold text-slate-600">
              Update administrator information and access level.
            </p>

            <div className="mt-6 space-y-4">
              <FormField label="Full Name">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    onFieldChange('name', event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all shadow-sm focus:ring-2 focus:ring-primary/20"
                  disabled={isUpdating}
                />
              </FormField>

              <FormField label="Email">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    onFieldChange('email', event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all shadow-sm focus:ring-2 focus:ring-primary/20"
                  disabled={isUpdating}
                />
              </FormField>

              <FormField label="Admin Role">
                <input
                  type="text"
                  value={formData.role}
                  onChange={(event) =>
                    onFieldChange('role', event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all shadow-sm focus:ring-2 focus:ring-primary/20"
                  disabled={isUpdating}
                />
              </FormField>

              <FormField label="Access Level">
                <select
                  value={formData.accessLevel}
                  onChange={(event) =>
                    onFieldChange('accessLevel', event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all shadow-sm focus:ring-2 focus:ring-primary/20"
                  disabled={isUpdating}
                >
                  <option value="Full Access">Full Access</option>
                  <option value="Read Only">Read Only</option>
                  <option value="Limited">Limited</option>
                </select>
              </FormField>

              <FormField label="Phone">
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(event) =>
                    onFieldChange('phone', event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all shadow-sm focus:ring-2 focus:ring-primary/20"
                  disabled={isUpdating}
                />
              </FormField>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={onClose}
                disabled={isUpdating}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-black tracking-widest text-slate-600 uppercase transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={onSave}
                disabled={isSaveDisabled}
                className="flex-1 rounded-xl bg-primary py-3 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-60"
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
  children: any;
  label: string;
}

function FormField({ children, label }: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}
