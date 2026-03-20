import { useState, useMemo, useEffect, useCallback } from "react";
import { useTeacherIdentity } from "../../../hooks/useTeacherIdentity";
import { useTeacherNotifications } from "../../../hooks/useTeacherNotifications";
import type { MappedNotification } from "../../../lib/notifications/mapper";
import {
  API_BASE_URL,
  DEFAULT_AVATAR,
  resolveAvatarUrl,
  parseStudentReplyNotification,
  parseDirectMessage,
  toDisplayName,
} from "../../../lib/teacher/utils";
import type { ApiUser } from "../../../lib/teacher/types";

export type ReadFilter = "all" | "unread";
export type NotificationTypeFilter = "any" | "message" | "alert" | "system";

export function useNotificationsPage() {
  const { teacherId } = useTeacherIdentity();
  const {
    notifications: rawNotifications,
    isLoading: notificationsLoading,
    error: notificationsError,
    setNotifications,
    reload,
  } = useTeacherNotifications(teacherId);

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [filter, setFilter] = useState<ReadFilter>("all");
  const [typeFilter, setTypeFilter] = useState<NotificationTypeFilter>("any");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Load users to resolve avatars and names
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users`);
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Failed to load users for notifications", e);
      } finally {
        setUsersLoading(false);
      }
    };
    loadUsers();
  }, []);

  const enrichedNotifications = useMemo<MappedNotification[]>(() => {
    return rawNotifications.map((n) => {
      const rawMessage = String(n.message || "").trim();
      let avatar = DEFAULT_AVATAR;
      let senderName = "System";
      let senderId: number | null = null;
      let senderRole: "Student" | "Admin" | "Teacher" = "Admin";
      let type: "message" | "alert" | "system" = "system";
      let content =
        String(n.content || "").trim() ||
        rawMessage.replace(/^\[alert\]\s*/i, "").trim() ||
        "No content";

      const reply = parseStudentReplyNotification(n);
      if (reply) {
        senderId = reply.studentId;
        senderName = reply.studentName;
        senderRole = "Student";
        type = "message";
        content = reply.message || content;
      } else {
        const dm = parseDirectMessage(rawMessage);
        if (dm) {
          senderId = dm.fromId;
          senderName = dm.senderName;
          type = "message";
          content = dm.text || content;
        } else {
          const backendType = String(n.type || "").trim().toLowerCase();
          if (backendType === "alert" || rawMessage.toLowerCase().startsWith("[alert]")) {
            type = "alert";
          } else if (backendType === "message") {
            type = "message";
          }

          senderName =
            String(n.from_name || "").trim() ||
            String(n.user_name || "").trim() ||
            "System";
          avatar = resolveAvatarUrl(n.from_avatar, DEFAULT_AVATAR);
          senderRole =
            String(n.from_role || "").trim().toLowerCase() === "teacher"
              ? "Teacher"
              : String(n.from_role || "").trim().toLowerCase() === "student"
                ? "Student"
                : "Admin";
        }
      }

      if (senderId) {
        const user = users.find((u) => Number(u.id) === senderId);
        if (user) {
          avatar = resolveAvatarUrl(user.profile_image, DEFAULT_AVATAR);
          senderName = toDisplayName(user);
          senderRole =
            String(user.role || "").trim().toLowerCase() === "admin"
              ? "Admin"
              : String(user.role || "").trim().toLowerCase() === "teacher"
                ? "Teacher"
                : "Student";
        }
      }

      const sender: MappedNotification["sender"] = {
        name: senderName,
        avatar,
        role: senderRole,
        id: senderId ?? undefined,
      };

      return {
        id: String(n.id),
        user_id: Number(n.user_id) || null,
        sender,
        type,
        content,
        time: String(n.created_at || ""),
        isRead: Number(n.is_read) === 1,
      };
    });
  }, [rawNotifications, users]);

  const notifications = useMemo(() => {
    const sorted = [...enrichedNotifications].sort(
      (a, b) =>
        new Date(b.time || "").getTime() -
        new Date(a.time || "").getTime(),
    );

    const query = searchQuery.toLowerCase().trim();

    return sorted.filter((n) => {
      if (filter === "unread" && n.isRead) {
        return false;
      }

      if (typeFilter !== "any" && n.type !== typeFilter) {
        return false;
      }

      if (query) {
        const messageMatch = n.content.toLowerCase().includes(query);
        const senderMatch = n.sender.name.toLowerCase().includes(query);
        if (!messageMatch && !senderMatch) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedNotifications, filter, typeFilter, searchQuery]);

  const allCount = useMemo(
    () => enrichedNotifications.length,
    [enrichedNotifications],
  );
  const unreadCount = useMemo(
    () => enrichedNotifications.filter((n) => !n.isRead).length,
    [enrichedNotifications],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      const notificationId = Number(id);
      const notification = rawNotifications.find((n) => Number(n.id) === notificationId);
      if (!notification || Number(notification.is_read) === 1) return;

      setNotifications((prev) =>
        prev.map((n) =>
          Number(n.id) === notificationId ? { ...n, is_read: 1 } : n,
        ),
      );

      try {
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
          method: "PUT",
        });
        if (!response.ok) {
          throw new Error("Failed to mark notification as read");
        }
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
        // Revert state on failure
        setNotifications((prev) =>
          prev.map((n) =>
            Number(n.id) === notificationId ? { ...n, is_read: 0 } : n,
          ),
        );
        setToast({ message: "Failed to mark as read", type: "error" });
      }
    },
    [rawNotifications, setNotifications],
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      const notificationId = Number(id);
      const originalNotifications = [...rawNotifications];
      setNotifications((prev) =>
        prev.filter((n) => Number(n.id) !== notificationId),
      );

      try {
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete notification");
        }
        setToast({ message: "Notification deleted", type: "success" });
      } catch (err) {
        console.error("Failed to delete notification:", err);
        setNotifications(originalNotifications);
        setToast({ message: "Failed to delete notification", type: "error" });
      }
    },
    [rawNotifications, setNotifications],
  );

  const markAllAsRead = useCallback(async () => {
    if (!teacherId) return;

    const originalNotifications = [...rawNotifications];
    const unreadIds = originalNotifications
      .filter((n) => Number(n.is_read) === 0)
      .map((n) => n.id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/user/${teacherId}/read-all`,
        {
          method: "PUT",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to mark all as read");
      }
      setToast({ message: "All notifications marked as read", type: "success" });
    } catch (err) {
      console.error(err);
      setNotifications(originalNotifications);
      setToast({ message: "Failed to mark all as read", type: "error" });
    }
  }, [teacherId, rawNotifications, setNotifications]);

  const clearRead = useCallback(async () => {
    if (!teacherId) return;
    const originalNotifications = [...rawNotifications];
    const readIds = originalNotifications
      .filter((n) => Number(n.is_read) === 1)
      .map((n) => n.id);
    if (readIds.length === 0) return;

    setNotifications((prev) => prev.filter((n) => Number(n.is_read) === 0));

    try {
      const responses = await Promise.all(
        readIds.map((notificationId) =>
          fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
            method: "DELETE",
          }),
        ),
      );
      if (responses.some((response) => !response.ok)) {
        throw new Error("Failed to clear read notifications");
      }
      setToast({ message: "Read notifications cleared", type: "success" });
    } catch (err) {
      console.error(err);
      setNotifications(originalNotifications);
      setToast({ message: "Failed to clear notifications", type: "error" });
    }
  }, [teacherId, rawNotifications, setNotifications]);

  return {
    notifications,
    allCount,
    unreadCount,
    isLoading: notificationsLoading || usersLoading,
    error: notificationsError,
    filter,
    setFilter,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    refresh: reload,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    clearRead,
    toast,
    dismissToast: () => setToast(null),
  };
}
