import React from 'react';
import { motion } from 'motion/react';

interface AccountSecuritySectionProps {
  profileForm: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  setProfileForm: React.Dispatch<React.SetStateAction<any>>;
}

export default function AccountSecuritySection({ profileForm, setProfileForm }: AccountSecuritySectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="p-4 md:p-6 border-b border-slate-100">
        <h2 className="font-bold text-slate-900 text-sm md:text-base">Account Security</h2>
        <p className="text-[10px] md:text-xs text-slate-500 mt-1">Keep your account secure.</p>
      </div>
      <div className="p-4 md:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
            <input type="password" value={profileForm.currentPassword} onChange={(e) => setProfileForm((prev) => ({ ...prev, currentPassword: e.target.value }))} placeholder="••••••••" className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
            <input type="password" value={profileForm.newPassword} onChange={(e) => setProfileForm((prev) => ({ ...prev, newPassword: e.target.value }))} placeholder="••••••••" className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
            <input type="password" value={profileForm.confirmPassword} onChange={(e) => setProfileForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} placeholder="••••••••" className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="button" className="text-xs md:text-sm font-bold text-primary hover:underline">Forgot Password?</button>
        </div>
      </div>
    </motion.section>
  );
}