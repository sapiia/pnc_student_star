import {
  Activity,
  AlertCircle,
  Bell,
  Lock,
  Minus,
  Plus,
  Settings,
  Shield,
  Star,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../../lib/utils";

import type {
  BooleanRolePermissionKey,
  CriterionSetting,
  RolePermissionSettings,
} from "./adminSettings.types";
import { getCriterionIconStyle } from "./adminSettings.utils";

type PermissionToggleConfig = {
  activeLabel: string;
  buttonToneClass: string;
  description: string;
  inactiveLabel: string;
  isActive: boolean;
  key: string;
  label: string;
  onToggle: () => void;
};

type PermissionRangeConfig = {
  description: string;
  displayValue: number | string;
  key: string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
};

interface AdminSettingsSystemTabProps {
  criteriaList: CriterionSetting[];
  evaluationIntervalDays: number;
  formattedIntervalMonths: string;
  isLoadingCriteria: boolean;
  notificationRetentionDays: number;
  onDeleteCriterion: (criterion: CriterionSetting) => void;
  onEvaluationIntervalDaysChange: (value: number) => void;
  onNotificationRetentionDaysChange: (value: number) => void;
  onOpenAddCriterionModal: () => void;
  onOpenEditCriterionModal: (criterion: CriterionSetting) => void;
  onRatingScaleChange: (value: number) => void;
  onRolePermissionChange: <K extends keyof RolePermissionSettings>(
    key: K,
    value: RolePermissionSettings[K],
  ) => void;
  onToggleRolePermission: (key: BooleanRolePermissionKey) => void;
  onToggleStudentMultipleEvaluations: () => void;
  ratingScale: number;
  rolePermissions: RolePermissionSettings;
}

function StarScaleCard({
  onChange,
  ratingScale,
}: {
  onChange: (value: number) => void;
  ratingScale: number;
}) {
  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Star className="h-5 w-5" />
        </div>
        <h4 className="font-black text-slate-900">Rating Scale Configuration</h4>
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-900">
              Max Rating Points (Stars)
            </label>
            <p className="mt-1 text-[10px] font-bold text-slate-400">
              Define how many stars or points are available for each criterion.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-2">
            <button
              type="button"
              onClick={() => onChange(Math.max(1, ratingScale - 1))}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-xl font-black text-primary">
              {ratingScale}
            </span>
            <button
              type="button"
              onClick={() => onChange(Math.min(10, ratingScale + 1))}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          {Array.from({ length: ratingScale }).map((_, index) => (
            <div
              key={index}
              className="flex size-8 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-500"
            >
              <Star className="h-4 w-4 fill-amber-500" />
            </div>
          ))}
        </div>
        <p className="mt-4 text-[10px] font-bold italic text-slate-400">
          Note: changing the rating scale will normalize existing scores to the
          new scale.
        </p>
      </div>
    </div>
  );
}

interface AdjustableRangeCardProps {
  accentClassName: string;
  footerText: string;
  icon: LucideIcon;
  inputStep: number;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  onReset?: () => void;
  resetLabel?: string;
  sliderStep: number;
  summaryLabel: string;
  summaryValue: string;
  title: string;
  value: number;
}

function AdjustableRangeCard({
  accentClassName,
  footerText,
  icon: Icon,
  inputStep,
  label,
  max,
  min,
  onChange,
  onReset,
  resetLabel,
  sliderStep,
  summaryLabel,
  summaryValue,
  title,
  value,
}: AdjustableRangeCardProps) {
  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-2 flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            accentClassName,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h4 className="font-black text-slate-900">{title}</h4>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-end justify-between">
            <label className="text-xs font-black uppercase tracking-widest text-slate-900">
              {label}
            </label>
            <span className="text-xs font-black text-primary">{value} days</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={sliderStep}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-primary"
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {summaryLabel}
            </p>
            <p className="text-sm font-bold text-slate-900">{summaryValue}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange(Math.max(min, value - sliderStep))}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min={min}
              max={max}
              step={inputStep}
              value={value}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                if (Number.isNaN(nextValue)) {
                  return;
                }
                onChange(Math.min(max, Math.max(min, nextValue)));
              }}
              className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => onChange(Math.min(max, value + sliderStep))}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="text-[10px] font-bold text-slate-400">{footerText}</p>
        {onReset && resetLabel && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-black uppercase tracking-widest text-primary transition-colors hover:text-primary/80"
          >
            {resetLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function CriteriaTable({
  criteriaList,
  onDeleteCriterion,
  onOpenAddCriterionModal,
  onOpenEditCriterionModal,
  ratingScale,
}: {
  criteriaList: CriterionSetting[];
  onDeleteCriterion: (criterion: CriterionSetting) => void;
  onOpenAddCriterionModal: () => void;
  onOpenEditCriterionModal: (criterion: CriterionSetting) => void;
  ratingScale: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">
          Active Criteria ({criteriaList.length})
        </h3>
        <button
          type="button"
          onClick={onOpenAddCriterionModal}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Add New Criterion
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-6 py-4">Icon</th>
              <th className="px-6 py-4">Criterion Name</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Stars</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence initial={false}>
              {criteriaList.map((criterion) => {
                const criterionIcon = getCriterionIconStyle(
                  criterion.name,
                  criterion.icon,
                );

                return (
                  <motion.tr
                    key={criterion.id}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    whileHover={{
                      boxShadow: "0 18px 35px -24px rgba(15, 23, 42, 0.22)",
                      scale: 1.012,
                    }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="group bg-white transition-all duration-300 ease-out hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4">
                      <div
                        className={cn(
                          "flex size-11 items-center justify-center rounded-2xl transition-transform duration-300 ease-out group-hover:scale-110",
                          criterionIcon.className,
                        )}
                      >
                        {criterionIcon.icon}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="origin-left transition-transform duration-300 ease-out group-hover:scale-[1.01]">
                        <p className="text-sm font-black text-slate-900">
                          {criterion.name}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          ID: {criterion.id}
                        </p>
                      </div>
                    </td>
                    <td className="max-w-md px-6 py-4">
                      <div className="origin-left space-y-1 transition-transform duration-300 ease-out group-hover:scale-[1.005]">
                        <p className="line-clamp-1 text-xs font-bold leading-relaxed text-slate-500">
                          {criterion.description}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                          {criterion.starDescriptions.length} descriptions ready
                        </p>
                      </div>
                    </td>
                    <td className="min-w-[180px] px-6 py-4">
                      <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-3 py-2">
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {Array.from({ length: ratingScale }).map((_, index) => (
                            <div
                              key={index}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-amber-500 shadow-sm shadow-amber-100/70"
                            >
                              <Star className="h-4 w-4 fill-amber-500" />
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                          {ratingScale}-star scale
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        {criterion.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenEditCriterionModal(criterion)}
                          className="p-2 text-slate-400 transition-colors hover:text-primary"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCriterion(criterion)}
                          className="p-2 text-slate-400 transition-colors hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Showing {criteriaList.length} criteria
        </p>
      </div>
    </div>
  );
}

function ToggleRow({
  activeLabel,
  buttonToneClass,
  description,
  inactiveLabel,
  isActive,
  label,
  onToggle,
}: PermissionToggleConfig) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div>
        <p className="text-sm font-black text-slate-900">{label}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
          isActive ? buttonToneClass : "bg-slate-200 text-slate-600",
        )}
      >
        {isActive ? activeLabel : inactiveLabel}
      </button>
    </div>
  );
}

function RangeRow({
  description,
  displayValue,
  label,
  max,
  min,
  onChange,
  step,
  value,
}: PermissionRangeConfig) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-slate-900">{label}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {description}
          </p>
        </div>
        <span className="text-lg font-black text-primary">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-primary"
      />
    </div>
  );
}

function PermissionSection({
  accentClassName,
  icon: Icon,
  ranges,
  subtitle,
  title,
  toggles,
}: {
  accentClassName: string;
  icon: LucideIcon;
  ranges: PermissionRangeConfig[];
  subtitle: string;
  title: string;
  toggles: PermissionToggleConfig[];
}) {
  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-2 flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            accentClassName,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-black text-slate-900">{title}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {toggles.map((toggle) => (
          <ToggleRow key={toggle.key} {...toggle} />
        ))}
        {ranges.map((range) => (
          <RangeRow key={range.key} {...range} />
        ))}
      </div>
    </div>
  );
}

export default function AdminSettingsSystemTab({
  criteriaList,
  evaluationIntervalDays,
  formattedIntervalMonths,
  isLoadingCriteria,
  notificationRetentionDays,
  onDeleteCriterion,
  onEvaluationIntervalDaysChange,
  onNotificationRetentionDaysChange,
  onOpenAddCriterionModal,
  onOpenEditCriterionModal,
  onRatingScaleChange,
  onRolePermissionChange,
  onToggleRolePermission,
  onToggleStudentMultipleEvaluations,
  ratingScale,
  rolePermissions,
}: AdminSettingsSystemTabProps) {
  const studentToggles: PermissionToggleConfig[] = [
    {
      activeLabel: "Enabled",
      buttonToneClass: "bg-emerald-500 text-white",
      description: "Main access gate for self-evaluation",
      inactiveLabel: "Disabled",
      isActive: rolePermissions.studentCanStartEvaluation,
      key: "studentCanStartEvaluation",
      label: "Allow Students To Start Evaluation",
      onToggle: () => onToggleRolePermission("studentCanStartEvaluation"),
    },
    {
      activeLabel: "Allowed",
      buttonToneClass: "bg-amber-500 text-white",
      description: "Let students reopen their own submission",
      inactiveLabel: "Locked",
      isActive: rolePermissions.studentCanEditAfterSubmit,
      key: "studentCanEditAfterSubmit",
      label: "Allow Editing After Submit",
      onToggle: () => onToggleRolePermission("studentCanEditAfterSubmit"),
    },
    {
      activeLabel: "Enabled",
      buttonToneClass: "bg-indigo-500 text-white",
      description: "Allow students to evaluate more than once per cycle",
      inactiveLabel: "Disabled",
      isActive: rolePermissions.studentMaxEvaluationsPerCycle > 1,
      key: "studentMaxEvaluationsToggle",
      label: "Multiple Evaluations Per Cycle",
      onToggle: onToggleStudentMultipleEvaluations,
    },
    {
      activeLabel: "Visible",
      buttonToneClass: "bg-blue-500 text-white",
      description: "Control whether mentor comments are visible",
      inactiveLabel: "Hidden",
      isActive: rolePermissions.studentCanViewTeacherFeedback,
      key: "studentCanViewTeacherFeedback",
      label: "View Teacher Feedback",
      onToggle: () => onToggleRolePermission("studentCanViewTeacherFeedback"),
    },
    {
      activeLabel: "Visible",
      buttonToneClass: "bg-cyan-500 text-white",
      description: "Allow students to see past cycles and results",
      inactiveLabel: "Hidden",
      isActive: rolePermissions.studentCanViewOwnHistory,
      key: "studentCanViewOwnHistory",
      label: "View Own Evaluation History",
      onToggle: () => onToggleRolePermission("studentCanViewOwnHistory"),
    },
    {
      activeLabel: "Allowed",
      buttonToneClass: "bg-violet-500 text-white",
      description: "Let students ask for extra time before due date",
      inactiveLabel: "Blocked",
      isActive: rolePermissions.studentCanRequestDeadlineExtension,
      key: "studentCanRequestDeadlineExtension",
      label: "Request Deadline Extension",
      onToggle: () =>
        onToggleRolePermission("studentCanRequestDeadlineExtension"),
    },
    {
      activeLabel: "Enabled",
      buttonToneClass: "bg-sky-500 text-white",
      description: "Keep support resources available or restricted",
      inactiveLabel: "Disabled",
      isActive: rolePermissions.studentCanAccessHelpCenter,
      key: "studentCanAccessHelpCenter",
      label: "Access Help Center",
      onToggle: () => onToggleRolePermission("studentCanAccessHelpCenter"),
    },
    {
      activeLabel: "On",
      buttonToneClass: "bg-rose-500 text-white",
      description: "Send countdown reminders to students",
      inactiveLabel: "Off",
      isActive: rolePermissions.studentReceivesReminderNotifications,
      key: "studentReceivesReminderNotifications",
      label: "Reminder Notifications",
      onToggle: () =>
        onToggleRolePermission("studentReceivesReminderNotifications"),
    },
  ];

  const studentRanges: PermissionRangeConfig[] = [
    {
      description:
        "Limit how many times a student can submit in one cycle",
      displayValue: rolePermissions.studentMaxEvaluationsPerCycle,
      key: "studentMaxEvaluationsPerCycle",
      label: "Max Evaluations Per Cycle",
      max: 12,
      min: 1,
      onChange: (value) =>
        onRolePermissionChange("studentMaxEvaluationsPerCycle", value),
      step: 1,
      value: rolePermissions.studentMaxEvaluationsPerCycle,
    },
    {
      description: "Cap the text length for each student reflection",
      displayValue: rolePermissions.studentMaxReflectionCharacters,
      key: "studentMaxReflectionCharacters",
      label: "Max Reflection Characters",
      max: 5000,
      min: 100,
      onChange: (value) =>
        onRolePermissionChange("studentMaxReflectionCharacters", value),
      step: 100,
      value: rolePermissions.studentMaxReflectionCharacters,
    },
  ];

  const teacherToggles: PermissionToggleConfig[] = [
    {
      activeLabel: "Enabled",
      buttonToneClass: "bg-emerald-500 text-white",
      description: "Allows teachers to access submitted evaluations",
      inactiveLabel: "Disabled",
      isActive: rolePermissions.teacherCanReviewEvaluations,
      key: "teacherCanReviewEvaluations",
      label: "Review Student Evaluations",
      onToggle: () => onToggleRolePermission("teacherCanReviewEvaluations"),
    },
    {
      activeLabel: "Allowed",
      buttonToneClass: "bg-amber-500 text-white",
      description: "Controls whether a teacher can revise comments later",
      inactiveLabel: "Locked",
      isActive: rolePermissions.teacherCanEditSubmittedFeedback,
      key: "teacherCanEditSubmittedFeedback",
      label: "Edit Submitted Feedback",
      onToggle: () =>
        onToggleRolePermission("teacherCanEditSubmittedFeedback"),
    },
    {
      activeLabel: "Visible",
      buttonToneClass: "bg-blue-500 text-white",
      description: "Access identity and profile details of assigned students",
      inactiveLabel: "Restricted",
      isActive: rolePermissions.teacherCanViewStudentProfiles,
      key: "teacherCanViewStudentProfiles",
      label: "View Student Profiles",
      onToggle: () => onToggleRolePermission("teacherCanViewStudentProfiles"),
    },
    {
      activeLabel: "Enabled",
      buttonToneClass: "bg-cyan-500 text-white",
      description: "Allow teachers to create mentoring meetings",
      inactiveLabel: "Disabled",
      isActive: rolePermissions.teacherCanScheduleMeetings,
      key: "teacherCanScheduleMeetings",
      label: "Schedule Meetings",
      onToggle: () => onToggleRolePermission("teacherCanScheduleMeetings"),
    },
    {
      activeLabel: "Allowed",
      buttonToneClass: "bg-fuchsia-500 text-white",
      description: "Enable broadcast announcements to assigned students",
      inactiveLabel: "Blocked",
      isActive: rolePermissions.teacherCanSendBulkMessages,
      key: "teacherCanSendBulkMessages",
      label: "Send Bulk Messages",
      onToggle: () => onToggleRolePermission("teacherCanSendBulkMessages"),
    },
    {
      activeLabel: "Enabled",
      buttonToneClass: "bg-emerald-500 text-white",
      description: "Download student summaries and performance reports",
      inactiveLabel: "Disabled",
      isActive: rolePermissions.teacherCanExportReports,
      key: "teacherCanExportReports",
      label: "Export Reports",
      onToggle: () => onToggleRolePermission("teacherCanExportReports"),
    },
    {
      activeLabel: "Allowed",
      buttonToneClass: "bg-orange-500 text-white",
      description:
        "Allow teachers to adjust or reopen evaluation windows",
      inactiveLabel: "Blocked",
      isActive: rolePermissions.teacherCanManageEvaluationDeadlines,
      key: "teacherCanManageEvaluationDeadlines",
      label: "Manage Evaluation Deadlines",
      onToggle: () =>
        onToggleRolePermission("teacherCanManageEvaluationDeadlines"),
    },
  ];

  const teacherRanges: PermissionRangeConfig[] = [
    {
      description:
        "Limit unique students a teacher can feedback (0 = unlimited)",
      displayValue:
        rolePermissions.teacherMaxAssignedStudents === 0
          ? "Unlimited"
          : rolePermissions.teacherMaxAssignedStudents,
      key: "teacherMaxAssignedStudents",
      label: "Max Feedback To Students",
      max: 200,
      min: 0,
      onChange: (value) =>
        onRolePermissionChange("teacherMaxAssignedStudents", value),
      step: 1,
      value: rolePermissions.teacherMaxAssignedStudents,
    },
    {
      description: "Cap the length of teacher feedback comments",
      displayValue: rolePermissions.teacherMaxFeedbackCharacters,
      key: "teacherMaxFeedbackCharacters",
      label: "Max Feedback Characters",
      max: 10000,
      min: 100,
      onChange: (value) =>
        onRolePermissionChange("teacherMaxFeedbackCharacters", value),
      step: 100,
      value: rolePermissions.teacherMaxFeedbackCharacters,
    },
  ];

  return (
    <div className="space-y-6 pt-0 md:space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-900">
          Evaluation Criteria Management
        </h2>
        <p className="font-bold text-slate-500">
          Manage the core evaluation pillars and descriptive student guidance
          tips.
        </p>
        {isLoadingCriteria && (
          <p className="text-sm font-bold text-primary">
            Loading saved criteria configuration from database...
          </p>
        )}
      </div>

      <div className="flex gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-800">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold leading-relaxed">
            You are currently managing{" "}
            <span className="font-black underline">{criteriaList.length} criteria</span>.
            The system supports adding more than 8 or decreasing below 8, and
            the star-chart visualization adapts automatically.
          </p>
        </div>
      </div>

      <CriteriaTable
        criteriaList={criteriaList}
        onDeleteCriterion={onDeleteCriterion}
        onOpenAddCriterionModal={onOpenAddCriterionModal}
        onOpenEditCriterionModal={onOpenEditCriterionModal}
        ratingScale={ratingScale}
      />

      <div className="space-y-6 pt-8">
        <h3 className="text-2xl font-black text-slate-900">
          System Configuration
        </h3>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <StarScaleCard
            ratingScale={ratingScale}
            onChange={onRatingScaleChange}
          />

          <AdjustableRangeCard
            accentClassName="bg-blue-50 text-blue-600"
            footerText="Allowed range: 30 to 365 days. 90 days equals the default 3-month cycle."
            icon={Activity}
            inputStep={15}
            label="Interval (Days)"
            max={365}
            min={30}
            onChange={onEvaluationIntervalDaysChange}
            onReset={() => onEvaluationIntervalDaysChange(90)}
            resetLabel="Reset To Default 90 Days"
            sliderStep={15}
            summaryLabel="Current Cycle"
            summaryValue={formattedIntervalMonths}
            title="Evaluation Interval"
            value={evaluationIntervalDays}
          />

          <AdjustableRangeCard
            accentClassName="bg-purple-50 text-purple-600"
            footerText="Allowed range: 7 to 365 days. This applies to all roles."
            icon={Bell}
            inputStep={1}
            label="Auto-delete After (Days)"
            max={365}
            min={7}
            onChange={onNotificationRetentionDaysChange}
            sliderStep={7}
            summaryLabel="Retention Policy"
            summaryValue={`${notificationRetentionDays} days`}
            title="Notification Retention"
            value={notificationRetentionDays}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <PermissionSection
            accentClassName="bg-emerald-50 text-emerald-600"
            icon={Shield}
            ranges={studentRanges}
            subtitle="Set boundaries for student actions"
            title="Student Permissions"
            toggles={studentToggles}
          />
          <PermissionSection
            accentClassName="bg-violet-50 text-violet-600"
            icon={Lock}
            ranges={teacherRanges}
            subtitle="Set review authority and assignment limits"
            title="Teacher Permissions"
            toggles={teacherToggles}
          />
        </div>
      </div>
    </div>
  );
}
