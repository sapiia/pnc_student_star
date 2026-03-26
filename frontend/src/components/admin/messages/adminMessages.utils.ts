import { DEFAULT_AVATAR, resolveAvatarUrl } from "../../../lib/api";

import type {
  AdminProfile,
  ApiUser,
  ChatMessage,
  Contact,
  DirectMessage,
  NotificationRecord,
  ParsedDirectNotification,
} from "./adminMessages.types";

const DIRECT_MESSAGE_PATTERN =
  /^\[DirectMessage\]\s+from=(\d+);\s*to=(\d+);\s*sender_name=(.*?);\s*text=(.*)$/;

const FALLBACK_ADMIN_PROFILE: AdminProfile = {
  id: null,
  name: "Administrator",
  avatar: DEFAULT_AVATAR,
};

const isTeacher = (role: string) =>
  String(role || "")
    .trim()
    .toLowerCase() === "teacher";

export const toDisplayName = (user: ApiUser) => {
  const fallback = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    String(user.name || "").trim() ||
    fallback ||
    String(user.email || `User ${user.id}`).trim()
  );
};

export const formatDateTime = (value?: string) => {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export const parseDirectMessage = (raw: string): DirectMessage | null => {
  const text = String(raw || "").trim();
  const match = text.match(DIRECT_MESSAGE_PATTERN);
  if (!match) return null;

  return {
    fromId: Number(match[1]),
    toId: Number(match[2]),
    senderName: String(match[3] || "User").trim() || "User",
    text: String(match[4] || "").trim(),
  };
};

export const composeDirectMessage = (payload: DirectMessage) =>
  `[DirectMessage] from=${payload.fromId}; to=${payload.toId}; sender_name=${payload.senderName}; text=${payload.text}`;

export const getStoredAdminProfile = (): AdminProfile => {
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) return FALLBACK_ADMIN_PROFILE;

    const authUser = JSON.parse(raw);
    const resolvedAdminId = Number(authUser?.id);
    const hasAdminId = Number.isInteger(resolvedAdminId) && resolvedAdminId > 0;
    const name =
      String(authUser?.name || "").trim() ||
      [authUser?.first_name, authUser?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      FALLBACK_ADMIN_PROFILE.name;
    const photo =
      String(authUser?.profile_image || "").trim() ||
      (hasAdminId
        ? String(
            localStorage.getItem(`profile_photo_${resolvedAdminId}`) || "",
          ).trim()
        : "");

    return {
      id: hasAdminId ? resolvedAdminId : null,
      name,
      avatar: resolveAvatarUrl(photo, DEFAULT_AVATAR),
    };
  } catch {
    return FALLBACK_ADMIN_PROFILE;
  }
};

export const parseStoredHiddenMessageIds = (raw: string | null) => {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item > 0);
  } catch {
    return [];
  }
};

export const mapDirectNotifications = (
  notifications: NotificationRecord[],
): ParsedDirectNotification[] =>
  notifications.flatMap((notification) => {
    const parsed = parseDirectMessage(notification.message);
    return parsed ? [{ notification, parsed }] : [];
  });

export const buildContacts = (
  adminId: number | null,
  users: ApiUser[],
  directNotifications: ParsedDirectNotification[],
): Contact[] => {
  if (!adminId) return [];

  return users
    .filter(
      (user) =>
        Number(user.id) !== adminId && isTeacher(String(user.role || "")),
    )
    .map((user) => {
      const contactId = Number(user.id);
      const contactMessages = directNotifications
        .filter(
          ({ parsed }) =>
            (parsed.fromId === adminId && parsed.toId === contactId) ||
            (parsed.fromId === contactId && parsed.toId === adminId),
        )
        .sort(
          (left, right) =>
            new Date(String(right.notification.created_at || "")).getTime() -
            new Date(String(left.notification.created_at || "")).getTime(),
        );

      const unreadCount = contactMessages.filter(
        ({ parsed, notification }) =>
          parsed.fromId === contactId &&
          parsed.toId === adminId &&
          Number(notification.is_read) !== 1,
      ).length;

      return {
        id: contactId,
        name: toDisplayName(user),
        role: "Teacher",
        avatar: resolveAvatarUrl(user.profile_image, DEFAULT_AVATAR),
        lastMessage: contactMessages[0]?.parsed.text || "",
        timestamp: contactMessages[0]?.notification.created_at,
        unreadCount,
        activityCount: contactMessages.length,
      };
    })
    .sort(
      (left, right) =>
        right.activityCount - left.activityCount ||
        new Date(String(right.timestamp || "")).getTime() -
          new Date(String(left.timestamp || "")).getTime(),
    )
    .map(({ activityCount: _activityCount, ...contact }) => contact);
};

export const filterContacts = (contacts: Contact[], query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return contacts;

  return contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(normalizedQuery) ||
      contact.role.toLowerCase().includes(normalizedQuery) ||
      contact.lastMessage.toLowerCase().includes(normalizedQuery),
  );
};

export const buildConversationMessages = (
  adminId: number | null,
  selectedContactId: number | null,
  directNotifications: ParsedDirectNotification[],
): ChatMessage[] => {
  if (!adminId || !selectedContactId) return [];

  return directNotifications
    .filter(
      ({ parsed }) =>
        (parsed.fromId === adminId && parsed.toId === selectedContactId) ||
        (parsed.fromId === selectedContactId && parsed.toId === adminId),
    )
    .sort(
      (left, right) =>
        new Date(String(left.notification.created_at || "")).getTime() -
        new Date(String(right.notification.created_at || "")).getTime(),
    )
    .map(({ notification, parsed }) => ({
      id: Number(notification.id),
      isMe: parsed.fromId === adminId,
      fromId: parsed.fromId,
      toId: parsed.toId,
      senderName: parsed.senderName,
      text: parsed.text,
      createdAt: notification.created_at,
      notificationId: Number(notification.id),
      isRead: Number(notification.is_read) === 1,
      rawIsRead: Number(notification.is_read) === 1 ? 1 : 0,
    }));
};
