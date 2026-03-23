// Shared utility functions for Teacher pages

import type {
  ApiUser,
  Gender,
  EvaluationRecord,
  NotificationRecord,
  StudentReplyRecord,
  DirectMessage,
} from "./types";

import {
  API_BASE_URL,
  API_ORIGIN,
  DEFAULT_AVATAR,
  resolveAvatarUrl,
} from "../api";

import {
  Home,
  Brain,
  Briefcase,
  CreditCard,
  Heart,
  MessageCircle,
  Smile,
  Star,
  Users,
  Users2,
  Wrench,
} from "lucide-react";
import { createElement } from "react";

export { API_BASE_URL, API_ORIGIN, DEFAULT_AVATAR, resolveAvatarUrl };

// ============ Name Formatting ============

export const toDisplayName = (user: ApiUser): string => {
  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return (
    String(user.name || "").trim() ||
    fullName ||
    String(user.email || "Student").trim()
  );
};

// ============ Gender Helpers ============

export const normalizeGender = (gender?: string | null): Gender => {
  const value = String(gender || "")
    .trim()
    .toLowerCase();
  if (value === "male" || value === "female") return value;
  return "unknown";
};

export const getGenderLabel = (gender: Gender | null | undefined): string => {
  if (!gender) return "--";
  return gender.charAt(0).toUpperCase() + gender.slice(1);
};

// ============ Class & Generation Helpers ============

export const extractGeneration = (user: ApiUser): string => {
  const classText = String(user.class || "").trim();
  const classMatch = classText.match(/gen\s*(\d{4})/i);
  if (classMatch) return `Gen ${classMatch[1]}`;

  const studentId = String(
    user.student_id || user.resolved_student_id || "",
  ).trim();
  const studentIdMatch = studentId.match(/^(\d{4})-/);
  if (studentIdMatch) return `Gen ${studentIdMatch[1]}`;

  return "Unknown Gen";
};

export const extractClassName = (user: ApiUser): string => {
  const classText = String(user.class || "").trim();
  if (!classText) return "Unassigned";

  const explicitClassMatch = classText.match(/class\s+([a-z0-9-]+)/i);
  if (explicitClassMatch) return explicitClassMatch[1].toUpperCase();

  const trimmedSegments = classText
    .split("-")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (trimmedSegments.length > 1) {
    return trimmedSegments[trimmedSegments.length - 1];
  }

  return classText.toUpperCase();
};

// Legacy version for dashboard
export const extractClassNameLegacy = (user: ApiUser): string => {
  const classText = String(user.class || "").trim();
  const plainClass = classText.replace(/gen\s*\d{4}/i, "").trim();
  if (plainClass) {
    if (plainClass.match(/^[A-G]$/i)) {
      if (classText.toLowerCase().includes("web"))
        return `WEB ${plainClass.toUpperCase()}`;
      if (classText.toLowerCase().includes("mobile"))
        return `MOBILE ${plainClass.toUpperCase()}`;
      return `Class ${plainClass.toUpperCase()}`;
    }
    return plainClass.toUpperCase();
  }
  return "Unassigned";
};

// ============ Evaluation Helpers ============

export const getEvaluationSortValue = (
  evaluation: EvaluationRecord,
): number => {
  const submittedValue = new Date(
    String(evaluation.submitted_at || evaluation.created_at || ""),
  ).getTime();
  return Number.isNaN(submittedValue)
    ? Number.MIN_SAFE_INTEGER
    : submittedValue;
};

export const formatScore = (
  averageScore: number | null,
  ratingScale: number,
): string => {
  if (averageScore === null) return "N/A";
  return `${averageScore.toFixed(1)} / ${ratingScale.toFixed(1)}`;
};

export const getStudentStatus = (
  averageScore: number | null,
): "Healthy" | "Action Needed" | "No Data" => {
  if (averageScore === null) return "No Data";
  if (averageScore < 2.5) return "Action Needed";
  return "Healthy";
};

// ============ Date Formatting ============

export const formatShortDate = (value?: string): string => {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const formatShortDateWithTime = (value?: string): string => {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export const formatDateTime = (value?: string): string => {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

// ============ Avatar Helpers ============

// ============ Notification Parsing ============

export const parseStudentReplyNotification = (
  notification: NotificationRecord,
): StudentReplyRecord | null => {
  const text = String(notification.message || "").trim();
  const match = text.match(
    /^\[StudentReply\]\s+feedback_id=(\d+);\s*student_id=(\d+);\s*student_name=(.*?);\s*message=(.*)$/,
  );
  if (!match) return null;

  return {
    notificationId: Number(notification.id),
    feedbackId: Number(match[1]),
    studentId: Number(match[2]),
    studentName: String(match[3] || "Student").trim() || "Student",
    message: String(match[4] || "").trim(),
    createdAt: notification.created_at,
    isRead: Number(notification.is_read) === 1,
  };
};

export const parseDirectMessage = (raw: string): DirectMessage | null => {
  const text = String(raw || "").trim();
  const match = text.match(
    /^\[DirectMessage\]\s+from=(\d+);\s*to=(\d+);\s*sender_name=(.*?);\s*text=(.*)$/,
  );
  if (!match) return null;

  return {
    fromId: Number(match[1]),
    toId: Number(match[2]),
    senderName: String(match[3] || "User").trim() || "User",
    text: String(match[4] || "").trim(),
  };
};

export const composeDirectMessage = (payload: DirectMessage): string =>
  `[DirectMessage] from=${payload.fromId}; to=${payload.toId}; sender_name=${payload.senderName}; text=${payload.text}`;

// ============ Role Helpers ============

export const toRoleLabel = (role: string): string => {
  const normalized = String(role || "")
    .trim()
    .toLowerCase();
  if (normalized === "admin") return "Admin Support";
  if (normalized === "teacher") return "Teacher";
  return "Student";
};

export const toContactType = (
  role: string,
): "Admin" | "Teacher" | "Student" => {
  const normalized = String(role || "")
    .trim()
    .toLowerCase();
  if (normalized === "admin") return "Admin";
  if (normalized === "teacher") return "Teacher";
  return "Student";
};

// ============ Teacher ID Helper ============

export const getTeacherIdFromStorage = (): number | null => {
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) return null;
    const authUser = JSON.parse(raw);
    const resolvedTeacherId = Number(authUser?.id);
    if (Number.isInteger(resolvedTeacherId) && resolvedTeacherId > 0) {
      return resolvedTeacherId;
    }
    return null;
  } catch {
    return null;
  }
};

export const getTeacherNameFromStorage = (): string => {
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) return "Teacher";
    const authUser = JSON.parse(raw);
    return (
      String(authUser?.name || "").trim() ||
      [authUser?.first_name, authUser?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Teacher"
    );
  } catch {
    return "Teacher";
  }
};

// ============ Local Storage Helpers ============

export const getHiddenFeedbackIds = (teacherId: number): number[] => {
  try {
    const raw = localStorage.getItem(`teacher_hidden_feedback_${teacherId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.map((item) => Number(item)).filter(Number.isFinite)
      : [];
  } catch {
    return [];
  }
};

export const setHiddenFeedbackIds = (
  teacherId: number,
  ids: number[],
): void => {
  localStorage.setItem(
    `teacher_hidden_feedback_${teacherId}`,
    JSON.stringify(ids),
  );
};

export const getHiddenMessageIds = (teacherId: number): number[] => {
  try {
    const raw = localStorage.getItem(
      `teacher_hidden_direct_messages_${teacherId}`,
    );
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed
          .map((item) => Number(item))
          .filter((item) => Number.isInteger(item) && item > 0)
      : [];
  } catch {
    return [];
  }
};

export const setHiddenMessageIds = (teacherId: number, ids: number[]): void => {
  localStorage.setItem(
    `teacher_hidden_direct_messages_${teacherId}`,
    JSON.stringify(ids),
  );
};

// ============ Radar Chart & Criteria Helpers ============

export type RadarColor = {
  key: string;
  name: string;
  color: string;
  fill: string;
};

export const RADAR_COLORS: RadarColor[] = [
  { key: "score", name: "Performance", color: "#5d5fef", fill: "#5d5fef" },
];

export type CriteriaColorStyle = {
  iconBg: string;
  iconText: string;
  detailText: string;
  stars: string;
  hover: string;
};

export const CRITERIA_COLOR_STYLES: readonly CriteriaColorStyle[] = [
  {
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    detailText: "text-blue-600",
    stars: "text-blue-500",
    hover: "hover:border-blue-300",
  },
  {
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    detailText: "text-emerald-600",
    stars: "text-emerald-500",
    hover: "hover:border-emerald-300",
  },
  {
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
    detailText: "text-amber-600",
    stars: "text-amber-500",
    hover: "hover:border-amber-300",
  },
  {
    iconBg: "bg-rose-100",
    iconText: "text-rose-600",
    detailText: "text-rose-600",
    stars: "text-rose-500",
    hover: "hover:border-rose-300",
  },
  {
    iconBg: "bg-cyan-100",
    iconText: "text-cyan-600",
    detailText: "text-cyan-600",
    stars: "text-cyan-500",
    hover: "hover:border-cyan-300",
  },
  {
    iconBg: "bg-fuchsia-100",
    iconText: "text-fuchsia-600",
    detailText: "text-fuchsia-600",
    stars: "text-fuchsia-500",
    hover: "hover:border-fuchsia-300",
  },
  {
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-600",
    detailText: "text-indigo-600",
    stars: "text-indigo-500",
    hover: "hover:border-indigo-300",
  },
  {
    iconBg: "bg-orange-100",
    iconText: "text-orange-600",
    detailText: "text-orange-600",
    stars: "text-orange-500",
    hover: "hover:border-orange-300",
  },
  {
    iconBg: "bg-sky-100",
    iconText: "text-sky-600",
    detailText: "text-sky-600",
    stars: "text-sky-500",
    hover: "hover:border-sky-300",
  },
] as const;

export type CriteriaCriterion = {
  id?: number | string;
  name?: string;
  status?: string;
};

export type EvaluationResponseWithKey = {
  criterion_id?: number | string;
  criterion_key: string;
  criterion_name?: string;
  criterion_icon?: string | null;
  star_value: number;
  reflection?: string;
  tip_snapshot?: string;
};

export type RadarDataPoint = {
  subject: string;
  score: number;
};

export type RadarDataResult = {
  data: RadarDataPoint[];
  maxValue: number;
};

export const buildRadarData = (
  student: {
    latestEvaluation: {
      responses?: EvaluationResponseWithKey[];
      rating_scale?: number;
    } | null;
  } | null,
  globalCriteria: CriteriaCriterion[],
  globalRatingScale: number,
): RadarDataResult => {
  const activeGlobal = globalCriteria.filter(
    (c) => String(c.status).toLowerCase() === "active",
  );

  if (activeGlobal.length === 0) {
    if (!student?.latestEvaluation?.responses?.length)
      return { data: [], maxValue: globalRatingScale };

    const data = student.latestEvaluation.responses.map((response) => ({
      subject: String(
        response.criterion_name || response.criterion_key || "Criterion",
      ),
      score: Math.max(0, Number(response.star_value || 0)),
    }));
    return {
      data,
      maxValue: student.latestEvaluation.rating_scale || globalRatingScale,
    };
  }

  const data = activeGlobal.map((criterion, index) => {
    const response = (student?.latestEvaluation?.responses || []).find(
      (r: EvaluationResponseWithKey) =>
        String(r.criterion_id || r.criterion_key || "").trim() ===
          String(criterion.id || "").trim() ||
        String(r.criterion_name || "")
          .trim()
          .toLowerCase() ===
          String(criterion.name || "")
            .trim()
            .toLowerCase(),
    );

    return {
      subject: String(criterion.name || `Criterion ${index + 1}`),
      score: response ? Math.max(0, Number(response.star_value || 0)) : 0,
    };
  });

  return { data, maxValue: globalRatingScale };
};

export const getIcon = (iconName?: string | null, className = "w-5 h-5") => {
  switch (String(iconName || "").trim()) {
    case "Home":
      return createElement(Home, { className });
    case "Briefcase":
      return createElement(Briefcase, { className });
    case "Users":
      return createElement(Users, { className });
    case "Users2":
      return createElement(Users2, { className });
    case "Heart":
      return createElement(Heart, { className });
    case "Smile":
      return createElement(Smile, { className });
    case "Brain":
      return createElement(Brain, { className });
    case "CreditCard":
      return createElement(CreditCard, { className });
    case "Wrench":
      return createElement(Wrench, { className });
    case "MessageCircle":
      return createElement(MessageCircle, { className });
    default:
      return createElement(Star, { className });
  }
};
