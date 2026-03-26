import { DEFAULT_AVATAR, resolveAvatarUrl } from "../../../lib/api";

import type {
  AdminNotification,
  NotificationFilter,
  NotificationSenderRole,
  NotificationType,
} from "./adminNotifications.types";

export const MAX_NOTIFICATIONS = 100;

export const READ_FILTER_OPTIONS: ReadonlyArray<{
  key: NotificationFilter;
  label: string;
}> = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
];

export const TYPE_FILTER_OPTIONS: ReadonlyArray<NotificationType | "any"> = [
  "any",
  "message",
  "alert",
  "system",
];

const normalizeNotificationType = (value: unknown): NotificationType => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "alert") return "alert";
  if (normalized === "system") return "system";
  return "message";
};

const normalizeSenderRole = (value: unknown): NotificationSenderRole => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "admin") return "Admin";
  if (normalized === "teacher") return "Teacher";
  return "Student";
};

export const mapNotifications = (value: unknown): AdminNotification[] =>
  Array.isArray(value)
    ? value.map((notification: any) => ({
        id: String(notification.id),
        type: normalizeNotificationType(notification.type),
        sender: {
          id: Number(notification.from_id) || undefined,
          name: String(
            notification.from_name || notification.sender_name || "Unknown",
          ),
          role: normalizeSenderRole(
            notification.from_role || notification.sender_role,
          ),
          avatar: resolveAvatarUrl(
            notification.from_avatar || notification.sender_avatar,
            DEFAULT_AVATAR,
          ),
        },
        content:
          String(notification.message || notification.content || "").trim() ||
          "No content",
        time: String(notification.created_at || ""),
        isRead: Number(notification.is_read) === 1,
      }))
    : [];

export const filterNotifications = (
  notifications: AdminNotification[],
  filter: NotificationFilter,
  typeFilter: NotificationType | "any",
  searchQuery: string,
) => {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return notifications.filter((notification) => {
    const matchesRead = filter === "all" ? true : !notification.isRead;
    const matchesType =
      typeFilter === "any" ? true : notification.type === typeFilter;
    const matchesSearch =
      !normalizedQuery ||
      notification.sender.name.toLowerCase().includes(normalizedQuery) ||
      notification.content.toLowerCase().includes(normalizedQuery);

    return matchesRead && matchesType && matchesSearch;
  });
};

export const formatNotificationTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "--";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};
