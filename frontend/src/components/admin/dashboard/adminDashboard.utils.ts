import { Activity, CheckCircle2, Users } from "lucide-react";

import { DEFAULT_AVATAR, resolveAvatarUrl } from "../../../lib/api";

import type {
  ApiUserRecord,
  DashboardSummary,
  EditUserFormState,
  GenerationSummary,
  PendingUserRole,
  PendingUserStatus,
  SystemActivityItem,
} from "./adminDashboard.types";

type MutableGenerationSummary = Omit<GenerationSummary, "classes"> & {
  classesMap: Map<string, number>;
};

export const EMPTY_EDIT_USER_FORM: EditUserFormState = {
  firstName: "",
  lastName: "",
  email: "",
  role: "Student",
  gender: "male",
  generation: "",
  major: "",
  className: "",
  studentId: "",
};

export const EMPTY_DASHBOARD_SUMMARY: DashboardSummary = {
  studentStats: {
    total: "0",
    generations: [],
  },
  teacherCount: 0,
  adminCount: 0,
  pendingUsers: [],
};

export const SYSTEM_ACTIVITY: SystemActivityItem[] = [
  {
    id: 1,
    type: "success",
    message: "Evaluation period opened",
    time: "2 hours ago",
    icon: CheckCircle2,
  },
  {
    id: 2,
    type: "info",
    message: "24 new student accounts created",
    time: "5 hours ago",
    icon: Users,
  },
  {
    id: 3,
    type: "warning",
    message: "Backup completed successfully",
    time: "Yesterday, 11:45 PM",
    icon: Activity,
  },
];

export const normalizeClassLabel = (value: string) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

export const splitNameParts = (fullName: string) => {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
};

export const extractClassLabel = (value: string) => {
  const match = String(value || "").match(/Class\s+(.+)$/i);
  return match ? match[1].trim() : String(value || "").trim();
};

export const buildStudentClassLabel = (
  generation: string,
  major: string,
  className: string,
) => {
  const generationValue = String(generation || "").trim();
  if (!generationValue) return className || "";

  const majorValue = String(major || "").trim();
  const classValue = String(className || "").trim();
  return `Gen ${generationValue}${majorValue ? ` - ${majorValue}` : ""}${classValue ? ` - Class ${classValue}` : ""}`;
};

export const extractGeneration = (user: Partial<ApiUserRecord>) => {
  const classText = String(user.class || "").trim();
  const yearMatch = classText.match(/(\d{4})/);
  if (yearMatch) {
    return yearMatch[1];
  }

  if (user.generation) {
    return String(user.generation);
  }

  return "Unknown Gen";
};

export const formatGenerationTitle = (value: string) => {
  const label = String(value || "").trim();
  if (!label || label === "Unknown Gen") return "Other";
  return label.toLowerCase().startsWith("gen") ? label : `Gen ${label}`;
};

export const isYearGeneration = (value: string) =>
  /^\d{4}$/.test(String(value || "").trim());

const toDisplayNameFromEmail = (email: string) => {
  const username = String(email || "").split("@")[0] || "User";
  return username
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getRoleLabel = (role: string): PendingUserRole => {
  const normalizedRole = String(role || "").toLowerCase();
  if (normalizedRole === "teacher") return "Teacher";
  if (normalizedRole === "admin") return "Admin";
  return "Student";
};

const isDeleted = (user: Partial<ApiUserRecord>) =>
  Number(user.is_deleted || 0) === 1;

const isDisabled = (user: Partial<ApiUserRecord>) => {
  if (typeof user.is_disable !== "undefined") {
    return Number(user.is_disable || 0) === 1;
  }

  return Number(user.is_active ?? 1) === 0;
};

const isPendingRegistration = (user: Partial<ApiUserRecord>) => {
  if (typeof user.is_registered !== "undefined") {
    return Number(user.is_registered || 0) === 0;
  }

  const registrationStatus = String(
    user.registration_status || "",
  ).toLowerCase();
  const accountStatus = String(user.account_status || "").toLowerCase();
  return registrationStatus === "pending" || accountStatus === "pending";
};

const resolveUserName = (user: Partial<ApiUserRecord>) =>
  String(user.name || "").trim() ||
  [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
  toDisplayNameFromEmail(String(user.email || ""));

const createGenerationSummary = (title: string): MutableGenerationSummary => ({
  title,
  total: 0,
  classesMap: new Map<string, number>(),
  activeCount: 0,
  disabledCount: 0,
});

export const mapUsersToDashboardSummary = (
  users: ApiUserRecord[],
): DashboardSummary => {
  const students = users.filter(
    (user) => String(user.role || "").toLowerCase() === "student",
  );
  const teachers = users.filter(
    (user) => String(user.role || "").toLowerCase() === "teacher",
  );
  const admins = users.filter(
    (user) => String(user.role || "").toLowerCase() === "admin",
  );

  const generations = new Map<string, MutableGenerationSummary>();

  students.forEach((student) => {
    const generation = extractGeneration(student);
    const className = normalizeClassLabel(
      String(student.class || student.major || "Unknown Class"),
    );
    const summary =
      generations.get(generation) || createGenerationSummary(generation);

    summary.total += 1;
    summary.classesMap.set(
      className,
      (summary.classesMap.get(className) || 0) + 1,
    );

    if (!isDeleted(student) && !isDisabled(student)) {
      summary.activeCount += 1;
    } else if (!isDeleted(student) && isDisabled(student)) {
      summary.disabledCount += 1;
    }

    generations.set(generation, summary);
  });

  const studentStats = {
    total: students.length.toLocaleString(),
    generations: Array.from(generations.values()).map(
      ({ classesMap, ...summary }) => ({
        ...summary,
        classes: Array.from(classesMap.entries()).map(([name, count]) => ({
          name,
          count,
        })),
      }),
    ),
  };

  const pendingUsers = users
    .filter((user) => !isDeleted(user) && isPendingRegistration(user))
    .map((user) => {
      const name = resolveUserName(user);
      const role = getRoleLabel(String(user.role || ""));
      const status: PendingUserStatus = isPendingRegistration(user)
        ? "Pending"
        : isDisabled(user)
          ? "Inactive"
          : "Active";
      const group =
        role === "Student"
          ? String(user.class || "Pending Class Assignment")
          : role === "Teacher"
            ? "Teaching Staff"
            : "Administration";

      return {
        id: user.id,
        name,
        email: String(user.email || ""),
        role,
        group,
        status,
        profileImage: resolveAvatarUrl(user.profile_image, DEFAULT_AVATAR),
        initials: name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      };
    });

  return {
    studentStats,
    teacherCount: teachers.length,
    adminCount: admins.length,
    pendingUsers,
  };
};

export const buildEditUserState = (user: ApiUserRecord): EditUserFormState => {
  const resolvedName = resolveUserName(user);
  const { firstName, lastName } = splitNameParts(resolvedName);
  const classValue = String(user.class || "").trim();

  return {
    firstName,
    lastName,
    email: String(user.email || ""),
    role: getRoleLabel(String(user.role || "")),
    gender:
      String(user.gender || "male").toLowerCase() === "female"
        ? "female"
        : "male",
    generation: String(user.generation || "").trim() || extractGeneration(user),
    major: String(user.major || "")
      .trim()
      .toUpperCase(),
    className: normalizeClassLabel(extractClassLabel(classValue)),
    studentId: String(user.student_id || ""),
  };
};
