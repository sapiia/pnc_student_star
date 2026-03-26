import type { LucideIcon } from "lucide-react";

export type SettingsTab = "system" | "profile";

export type AuthUser = {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  profile_image?: string | null;
};

export type CriterionSetting = {
  id: string;
  icon: string;
  name: string;
  description: string;
  status: "Active" | "Draft";
  starDescriptions: string[];
};

export type CriterionFormState = {
  name: string;
  icon: string;
  description: string;
};

export type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
  roleLabel: string;
  department: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  photoUrl: string;
};

export type RolePermissionSettings = {
  studentCanStartEvaluation: boolean;
  studentCanEditAfterSubmit: boolean;
  studentCanViewTeacherFeedback: boolean;
  studentCanViewOwnHistory: boolean;
  studentCanRequestDeadlineExtension: boolean;
  studentCanAccessHelpCenter: boolean;
  studentReceivesReminderNotifications: boolean;
  studentMaxEvaluationsPerCycle: number;
  studentMaxReflectionCharacters: number;
  teacherCanReviewEvaluations: boolean;
  teacherCanEditSubmittedFeedback: boolean;
  teacherCanViewStudentProfiles: boolean;
  teacherCanScheduleMeetings: boolean;
  teacherCanSendBulkMessages: boolean;
  teacherCanExportReports: boolean;
  teacherCanManageEvaluationDeadlines: boolean;
  teacherMaxAssignedStudents: number;
  teacherMaxFeedbackCharacters: number;
};

export type BooleanRolePermissionKey = {
  [K in keyof RolePermissionSettings]: RolePermissionSettings[K] extends boolean
    ? K
    : never;
}[keyof RolePermissionSettings];

export type CriterionIconOption = {
  value: string;
  label: string;
};

export type CriterionIconStyle = {
  icon: ReturnType<LucideIcon>;
  className: string;
};

export type RolePermissionSettingConfig<
  K extends keyof RolePermissionSettings = keyof RolePermissionSettings,
> = {
  endpoint: string;
  key: K;
  max?: number;
  min?: number;
  saveErrorMessage: string;
  type: "boolean" | "number";
};
