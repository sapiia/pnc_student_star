import {
  ArrowLeft,
  Calendar,
  Mail,
  MapPin,
  Pencil,
  Shield,
  Trash2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '../../../lib/utils';

import type { AdminRecord } from './adminRecords.types';

interface AdminRecordDetailsPanelProps {
  admin: AdminRecord | null;
  onClose: () => void;
  onDelete: (admin: AdminRecord) => void;
  onEdit: (admin: AdminRecord) => void;
  isSelfAdmin: (adminId?: number) => boolean;
}

export default function AdminRecordDetailsPanel({
  admin,
  onClose,
  onDelete,
  onEdit,
  isSelfAdmin,
}: AdminRecordDetailsPanelProps) {
  return (
    <AnimatePresence>
      {admin ? (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="fixed inset-0 z-20 flex w-full shrink-0 flex-col border-l border-slate-200 bg-white shadow-2xl md:static md:w-96 md:inset-auto"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h3 className="font-black text-slate-900">Admin Details</h3>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto p-6">
            <div className="text-center">
              <div className="mx-auto mb-4 size-24 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-md">
                <img
                  src={admin.profileImage}
                  alt={admin.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <h4 className="text-xl font-black text-slate-900">
                {admin.name}
              </h4>
              <p className="mt-1 text-xs leading-none font-bold tracking-widest text-amber-600 uppercase">
                {admin.role}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <DetailCard icon={Mail} label="Email Address" value={admin.email} />
              <DetailCard
                icon={Shield}
                label="Access Level"
                value={admin.accessLevel}
              />
              <DetailCard
                icon={Calendar}
                label="Join Date"
                value={admin.joinDate}
              />
              <DetailCard icon={MapPin} label="Phone" value={admin.phone} />
            </div>

            <div className="flex gap-3 border-t border-slate-100 pt-6">
              <button
                onClick={() => onEdit(admin)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary/10 py-4 text-xs font-black tracking-widest text-primary uppercase shadow-sm transition-all hover:bg-primary/20"
              >
                <Pencil className="h-4 w-4" />
                Edit Admin
              </button>

              <button
                onClick={() => onDelete(admin)}
                disabled={isSelfAdmin(admin.id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-50 py-4 text-xs font-black tracking-widest text-rose-600 uppercase shadow-sm transition-all hover:bg-rose-100',
                  isSelfAdmin(admin.id)
                    ? 'cursor-not-allowed opacity-50 hover:bg-rose-50'
                    : '',
                )}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

interface DetailCardProps {
  icon: typeof Mail;
  label: string;
  value: string;
}

function DetailCard({ icon: Icon, label, value }: DetailCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
      <div className="mb-1 flex items-center gap-3 text-slate-400">
        <Icon className="h-3 w-3" />
        <span className="text-[10px] font-black tracking-widest uppercase">
          {label}
        </span>
      </div>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}
