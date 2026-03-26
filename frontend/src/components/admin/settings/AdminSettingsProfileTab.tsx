import { Users } from "lucide-react";

import { DEFAULT_AVATAR } from "../../../lib/api";

import type { ProfileFormState } from "./adminSettings.types";

function ProfileField({
  disabled = false,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: "email" | "password" | "text";
  value: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className={
          disabled
            ? "w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 font-medium text-slate-400 outline-none"
            : "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        }
      />
    </div>
  );
}

interface AdminSettingsProfileTabProps {
  onPhotoPick: (event: any) => void;
  onProfileFieldChange: <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K],
  ) => void;
  photoInputRef: { current: HTMLInputElement | null };
  photoTimestamp: number;
  profileForm: ProfileFormState;
}

export default function AdminSettingsProfileTab({
  onPhotoPick,
  onProfileFieldChange,
  photoInputRef,
  photoTimestamp,
  profileForm,
}: AdminSettingsProfileTabProps) {
  const displayName =
    `${profileForm.firstName} ${profileForm.lastName}`.trim() || "Admin";
  const photoSrc = profileForm.photoUrl
    ? `${profileForm.photoUrl}?t=${photoTimestamp}`
    : DEFAULT_AVATAR;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-900">Personal Profile</h2>
        <p className="font-bold text-slate-500">
          Manage your administrative profile and security settings.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-12 p-8 md:flex-row">
          <div className="flex flex-col items-center gap-4">
            <div className="group relative size-32 overflow-hidden rounded-3xl border-4 border-slate-50 shadow-inner">
              <img
                src={photoSrc}
                alt={displayName}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPhotoPick}
            />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="text-sm font-bold text-primary hover:underline"
            >
              Change Photo
            </button>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
            <ProfileField
              label="First Name"
              value={profileForm.firstName}
              onChange={(value) => onProfileFieldChange("firstName", value)}
            />
            <ProfileField
              label="Last Name"
              value={profileForm.lastName}
              onChange={(value) => onProfileFieldChange("lastName", value)}
            />
            <ProfileField
              type="email"
              label="Email Address"
              value={profileForm.email}
              onChange={(value) => onProfileFieldChange("email", value)}
            />
            <ProfileField
              disabled
              label="Admin Role"
              value={profileForm.roleLabel}
            />
            <ProfileField
              label="Department"
              value={profileForm.department}
              onChange={(value) => onProfileFieldChange("department", value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="font-bold text-slate-900">Security</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
          <ProfileField
            type="password"
            label="Current Password"
            placeholder="Enter current password"
            value={profileForm.currentPassword}
            onChange={(value) => onProfileFieldChange("currentPassword", value)}
          />
          <ProfileField
            type="password"
            label="New Password"
            placeholder="Enter new password"
            value={profileForm.newPassword}
            onChange={(value) => onProfileFieldChange("newPassword", value)}
          />
          <ProfileField
            type="password"
            label="Confirm Password"
            placeholder="Confirm new password"
            value={profileForm.confirmPassword}
            onChange={(value) => onProfileFieldChange("confirmPassword", value)}
          />
        </div>
      </div>
    </div>
  );
}
