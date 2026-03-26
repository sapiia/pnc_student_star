import {
  Brain,
  Briefcase,
  CreditCard,
  Heart,
  Home,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import * as LucideIcons from "lucide-react";

import { DEFAULT_AVATAR } from "../../../lib/api";

import type {
  AuthUser,
  CriterionFormState,
  CriterionIconOption,
  CriterionIconStyle,
  CriterionSetting,
  ProfileFormState,
  RolePermissionSettingConfig,
  RolePermissionSettings,
} from "./adminSettings.types";

const INITIAL_CRITERIA = [
  {
    id: "CRIT-001",
    name: "Living",
    description:
      "Focus on your living environment, cleanliness of housing, and overall organization of daily chores.",
  },
  {
    id: "CRIT-002",
    name: "Job and Study",
    description:
      "Reflect on your academic performance, attendance, internship dedication, and continuous learning efforts.",
  },
  {
    id: "CRIT-003",
    name: "Human and Support",
    description:
      "Interpersonal relationships, teamwork skills, and the strength of your social support network.",
  },
  {
    id: "CRIT-004",
    name: "Health",
    description:
      "Assessment of physical health, sleep patterns, nutrition, and exercise.",
  },
  {
    id: "CRIT-005",
    name: "Your Feeling",
    description:
      "Self-reflection on happiness, stress management, and emotional stability.",
  },
  {
    id: "CRIT-006",
    name: "Choice and Behavior",
    description:
      "Evaluating the maturity of your decisions and the responsibility taken for personal actions.",
  },
  {
    id: "CRIT-007",
    name: "Money and Payment",
    description:
      "Financial management, budgeting skills, and meeting financial obligations.",
  },
  {
    id: "CRIT-008",
    name: "Life Skill",
    description:
      "Practical skills including time management, problem-solving, and self-sufficiency.",
  },
];

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export const DEFAULT_RATING_SCALE = 5;
export const DEFAULT_EVALUATION_INTERVAL_DAYS = 90;
export const DEFAULT_NOTIFICATION_RETENTION_DAYS = 7;

export const CRITERION_ICON_OPTIONS: CriterionIconOption[] = [
  { value: "Sparkles", label: "Sparkles" },
  { value: "Home", label: "Home" },
  { value: "Briefcase", label: "Briefcase" },
  { value: "Users2", label: "Users" },
  { value: "TrendingUp", label: "Trending" },
  { value: "Heart", label: "Heart" },
  { value: "Brain", label: "Brain" },
  { value: "CreditCard", label: "Card" },
  { value: "Wrench", label: "Wrench" },
  { value: "GraduationCap", label: "Graduation" },
  { value: "BookOpen", label: "Book" },
  { value: "Laptop", label: "Laptop" },
  { value: "MessageCircle", label: "Message" },
  { value: "Smile", label: "Smile" },
  { value: "ShieldCheck", label: "Shield" },
  { value: "Target", label: "Target" },
  { value: "Compass", label: "Compass" },
  { value: "Lightbulb", label: "Idea" },
  { value: "Rocket", label: "Rocket" },
  { value: "Globe", label: "Globe" },
  { value: "Handshake", label: "Handshake" },
  { value: "Coins", label: "Coins" },
  { value: "Trophy", label: "Trophy" },
  { value: "Palette", label: "Palette" },
];

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionSettings = {
  studentCanStartEvaluation: true,
  studentCanEditAfterSubmit: false,
  studentCanViewTeacherFeedback: true,
  studentCanViewOwnHistory: true,
  studentCanRequestDeadlineExtension: true,
  studentCanAccessHelpCenter: true,
  studentReceivesReminderNotifications: true,
  studentMaxEvaluationsPerCycle: 1,
  studentMaxReflectionCharacters: 500,
  teacherCanReviewEvaluations: true,
  teacherCanEditSubmittedFeedback: true,
  teacherCanViewStudentProfiles: true,
  teacherCanScheduleMeetings: true,
  teacherCanSendBulkMessages: false,
  teacherCanExportReports: true,
  teacherCanManageEvaluationDeadlines: false,
  teacherMaxAssignedStudents: 30,
  teacherMaxFeedbackCharacters: 1000,
};

export const ROLE_PERMISSION_SETTING_CONFIGS: RolePermissionSettingConfig[] = [
  {
    endpoint: "student_can_start_evaluation",
    key: "studentCanStartEvaluation",
    saveErrorMessage: "Failed to save student permissions.",
    type: "boolean",
  },
  {
    endpoint: "student_can_edit_after_submit",
    key: "studentCanEditAfterSubmit",
    saveErrorMessage: "Failed to save student edit permissions.",
    type: "boolean",
  },
  {
    endpoint: "student_can_view_teacher_feedback",
    key: "studentCanViewTeacherFeedback",
    saveErrorMessage: "Failed to save student feedback permissions.",
    type: "boolean",
  },
  {
    endpoint: "student_can_view_own_history",
    key: "studentCanViewOwnHistory",
    saveErrorMessage: "Failed to save student history permissions.",
    type: "boolean",
  },
  {
    endpoint: "student_can_request_deadline_extension",
    key: "studentCanRequestDeadlineExtension",
    saveErrorMessage: "Failed to save deadline extension permissions.",
    type: "boolean",
  },
  {
    endpoint: "student_can_access_help_center",
    key: "studentCanAccessHelpCenter",
    saveErrorMessage: "Failed to save help center permissions.",
    type: "boolean",
  },
  {
    endpoint: "student_receives_reminder_notifications",
    key: "studentReceivesReminderNotifications",
    saveErrorMessage: "Failed to save student reminder permissions.",
    type: "boolean",
  },
  {
    endpoint: "student_max_evaluations_per_cycle",
    key: "studentMaxEvaluationsPerCycle",
    max: 12,
    min: 1,
    saveErrorMessage: "Failed to save student evaluation limit.",
    type: "number",
  },
  {
    endpoint: "student_max_reflection_characters",
    key: "studentMaxReflectionCharacters",
    max: 5000,
    min: 100,
    saveErrorMessage: "Failed to save student reflection limit.",
    type: "number",
  },
  {
    endpoint: "teacher_can_review_evaluations",
    key: "teacherCanReviewEvaluations",
    saveErrorMessage: "Failed to save teacher review permissions.",
    type: "boolean",
  },
  {
    endpoint: "teacher_can_edit_submitted_feedback",
    key: "teacherCanEditSubmittedFeedback",
    saveErrorMessage: "Failed to save teacher feedback permissions.",
    type: "boolean",
  },
  {
    endpoint: "teacher_can_view_student_profiles",
    key: "teacherCanViewStudentProfiles",
    saveErrorMessage: "Failed to save teacher profile permissions.",
    type: "boolean",
  },
  {
    endpoint: "teacher_can_schedule_meetings",
    key: "teacherCanScheduleMeetings",
    saveErrorMessage: "Failed to save teacher meeting permissions.",
    type: "boolean",
  },
  {
    endpoint: "teacher_can_send_bulk_messages",
    key: "teacherCanSendBulkMessages",
    saveErrorMessage: "Failed to save teacher bulk messaging permissions.",
    type: "boolean",
  },
  {
    endpoint: "teacher_can_export_reports",
    key: "teacherCanExportReports",
    saveErrorMessage: "Failed to save teacher export permissions.",
    type: "boolean",
  },
  {
    endpoint: "teacher_can_manage_evaluation_deadlines",
    key: "teacherCanManageEvaluationDeadlines",
    saveErrorMessage: "Failed to save teacher deadline permissions.",
    type: "boolean",
  },
  {
    endpoint: "teacher_max_assigned_students",
    key: "teacherMaxAssignedStudents",
    max: 200,
    min: 0,
    saveErrorMessage: "Failed to save teacher assignment limit.",
    type: "number",
  },
  {
    endpoint: "teacher_max_feedback_characters",
    key: "teacherMaxFeedbackCharacters",
    max: 10000,
    min: 100,
    saveErrorMessage: "Failed to save teacher feedback limit.",
    type: "number",
  },
];

export const DEFAULT_PROFILE_FORM: ProfileFormState = {
  firstName: "",
  lastName: "",
  email: "",
  roleLabel: "System Administrator",
  department: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  photoUrl: DEFAULT_AVATAR,
};

export const createEmptyCriterionDraft = (): CriterionFormState => ({
  description: "",
  icon: "Sparkles",
  name: "",
});

export const buildDefaultStarDescriptions = (
  criterionName: string,
  ratingScale = DEFAULT_RATING_SCALE,
) =>
  Array.from({ length: ratingScale }, (_, index) => {
    const star = index + 1;
    if (star === 1) {
      return `Needs significant support in ${criterionName.toLowerCase()}, with frequent gaps that require close coaching.`;
    }
    if (star === 2) {
      return `Shows early progress in ${criterionName.toLowerCase()}, but performance is still inconsistent and needs regular follow-up.`;
    }
    if (star === 3) {
      return `Meets the expected baseline in ${criterionName.toLowerCase()} with steady but still improvable habits.`;
    }
    if (star === 4) {
      return `Performs well in ${criterionName.toLowerCase()} and demonstrates reliable, above-average behavior in most situations.`;
    }
    if (star === 5) {
      return `Consistently excels in ${criterionName.toLowerCase()} and models outstanding behavior with minimal guidance.`;
    }
    return `Defines the expectations for ${star} stars in ${criterionName.toLowerCase()} with clear performance guidance.`;
  });

const createCriterionSetting = (
  id: string,
  icon: string,
  name: string,
  description: string,
  status: "Active" | "Draft" = "Active",
): CriterionSetting => ({
  description,
  icon,
  id,
  name,
  starDescriptions: buildDefaultStarDescriptions(name),
  status,
});

export const normalizeStarDescriptions = (
  criterionName: string,
  starDescriptions: string[],
  ratingScale: number,
) =>
  Array.from({ length: ratingScale }, (_, index) => {
    const existing = starDescriptions[index];
    if (typeof existing === "string" && existing.trim()) {
      return existing;
    }

    return buildDefaultStarDescriptions(criterionName, ratingScale)[index];
  });

export const DEFAULT_CRITERIA_SETTINGS: CriterionSetting[] = [
  ...INITIAL_CRITERIA.map((criterion, index) =>
    createCriterionSetting(
      criterion.id,
      index === 0
        ? "Home"
        : index === 1
          ? "Briefcase"
          : index === 2
            ? "Users2"
            : index === 3
              ? "Heart"
              : index === 4
                ? "Smile"
                : index === 5
                  ? "Brain"
                  : index === 6
                    ? "CreditCard"
                    : "Wrench",
      criterion.name,
      criterion.description,
    ),
  ),
  createCriterionSetting(
    "CRIT-009",
    "MessageCircle",
    "Communication",
    "Clarity of expression, active listening, respectful dialogue, and constructive participation.",
  ),
];

export const normalizeCriterionSettings = (
  criteria: unknown,
  ratingScale: number,
): CriterionSetting[] => {
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return DEFAULT_CRITERIA_SETTINGS.map((criterion) => ({
      ...criterion,
      starDescriptions: normalizeStarDescriptions(
        criterion.name,
        criterion.starDescriptions,
        ratingScale,
      ),
    }));
  }

  return criteria.map((criterion, index) => {
    const source = (criterion || {}) as Partial<CriterionSetting>;
    const fallback = DEFAULT_CRITERIA_SETTINGS[index];
    const name = String(
      source.name || fallback?.name || `Criterion ${index + 1}`,
    ).trim();

    return {
      description: String(source.description || fallback?.description || "").trim(),
      icon: String(source.icon || fallback?.icon || "Sparkles").trim() || "Sparkles",
      id: String(
        source.id || fallback?.id || `CRIT-${String(index + 1).padStart(3, "0")}`,
      ),
      name,
      starDescriptions: normalizeStarDescriptions(
        name,
        Array.isArray(source.starDescriptions)
          ? source.starDescriptions
          : fallback?.starDescriptions || [],
        ratingScale,
      ),
      status: source.status === "Draft" ? "Draft" : "Active",
    };
  });
};

export const splitNameParts = (fullName = "") => {
  const cleaned = fullName.trim().replace(/\s+/g, " ");
  if (!cleaned) {
    return { firstName: "", lastName: "" };
  }

  const parts = cleaned.split(" ");
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
};

export const getCriterionIconStyle = (
  criterionName: string,
  iconName?: string,
): CriterionIconStyle => {
  const normalizedName = criterionName.trim().toLowerCase();
  const fallbackToken =
    normalizedName === "living"
      ? "Home"
      : normalizedName === "job and study"
        ? "Briefcase"
        : normalizedName === "human and support"
          ? "Users2"
          : normalizedName === "health"
            ? "TrendingUp"
            : normalizedName === "your feeling"
              ? "Heart"
              : normalizedName === "choice and behavior"
                ? "Brain"
                : normalizedName === "money and payment"
                  ? "CreditCard"
                  : normalizedName === "life skill"
                    ? "Wrench"
                    : "Sparkles";
  const normalizedIcon = (iconName || "").trim();
  const iconToken =
    normalizedIcon && normalizedIcon in LucideIcons
      ? normalizedIcon
      : fallbackToken;
  const palette = [
    "bg-amber-50 text-amber-600 ring-1 ring-amber-100 shadow-sm shadow-amber-100/80",
    "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 shadow-sm shadow-indigo-100/80",
    "bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100 shadow-sm shadow-cyan-100/80",
    "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 shadow-sm shadow-emerald-100/80",
    "bg-rose-50 text-rose-600 ring-1 ring-rose-100 shadow-sm shadow-rose-100/80",
    "bg-violet-50 text-violet-600 ring-1 ring-violet-100 shadow-sm shadow-violet-100/80",
    "bg-lime-50 text-lime-700 ring-1 ring-lime-100 shadow-sm shadow-lime-100/80",
    "bg-orange-50 text-orange-600 ring-1 ring-orange-100 shadow-sm shadow-orange-100/80",
    "bg-sky-50 text-sky-600 ring-1 ring-sky-100 shadow-sm shadow-sky-100/80",
    "bg-fuchsia-50 text-fuchsia-600 ring-1 ring-fuchsia-100 shadow-sm shadow-fuchsia-100/80",
  ];
  const IconComponent =
    (LucideIcons as Record<string, LucideIcon>)[iconToken] || Sparkles;
  const paletteIndex =
    iconToken.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    palette.length;

  return {
    className: palette[paletteIndex],
    icon: <IconComponent className="h-5 w-5" />,
  };
};

export const formatIntervalMonths = (evaluationIntervalDays: number) => {
  const intervalInMonths = evaluationIntervalDays / 30;
  return Number.isInteger(intervalInMonths)
    ? `${intervalInMonths} month${intervalInMonths === 1 ? "" : "s"}`
    : `${intervalInMonths.toFixed(1)} months`;
};

export const parseBooleanSetting = (value: unknown, fallback: boolean) => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
      return true;
    }
    if (normalized === "false" || normalized === "0") {
      return false;
    }
  }
  if (typeof value === "boolean") {
    return value;
  }
  return fallback;
};

export const parseNumberSetting = (
  value: unknown,
  fallback: number,
  min: number,
  max: number,
) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
};

export const getAuthUserFromStorage = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    const id = Number(parsed?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }

    return {
      email: parsed?.email,
      id,
      name: parsed?.name,
      profile_image: parsed?.profile_image || null,
      role: parsed?.role,
    };
  } catch {
    return null;
  }
};

export const toRoleLabel = (role = "") => {
  const normalized = role.toString().trim().toLowerCase();
  if (normalized === "admin") {
    return "System Administrator";
  }
  if (normalized === "teacher") {
    return "Teacher";
  }
  return "Student";
};
