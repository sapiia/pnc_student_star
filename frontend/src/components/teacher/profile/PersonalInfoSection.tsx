import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { DEFAULT_AVATAR } from '../../../lib/teacher/utils';

interface PersonalInfoSectionProps {
  profileForm: {
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    photoUrl: string;
    fullName: string;
  };
  setProfileForm: React.Dispatch<React.SetStateAction<any>>;
  photoTimestamp: number;
  photoInputRef: React.RefObject<HTMLInputElement>;
  onPhotoPick: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PersonalInfoSection({
  profileForm,
  setProfileForm,
  photoTimestamp,
  photoInputRef,
  onPhotoPick,
}: PersonalInfoSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-slate-900 text-sm md:text-base">Personal Information</h2>
        <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/10">
          Active
        </span>
      </div>
      <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-8 md:gap-12">
        <div className="flex flex-col items-center gap-4">
          <div className="size-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
            <img src={profileForm.photoUrl ? `${profileForm.photoUrl}?t=${photoTimestamp}` : DEFAULT_AVATAR} alt={profileForm.fullName || 'Teacher'} className="w-full h-full object-cover" />
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPhotoPick}
          />
          <button onClick={() => photoInputRef.current?.click()} className="text-sm font-bold text-primary hover:underline">Change Photo</button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
            <input
              type="text"
              value={profileForm.firstName}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
            <input
              type="text"
              value={profileForm.lastName}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
            <div className="relative">
              <input
                type="text"
                value={profileForm.department}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, department: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
              />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}