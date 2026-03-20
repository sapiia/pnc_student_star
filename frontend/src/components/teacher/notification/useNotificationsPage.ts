import { useState, useMemo, useEffect, useCallback } from "react";
import { useTeacherIdentity } from "../../../hooks/useTeacherIdentity";
import { useTeacherNotifications } from "../../../hooks/useTeacherNotifications";
import {
  API_BASE_URL,
  DEFAULT_AVATAR,
  resolveAvatarUrl,
  parseStudentReplyNotification,
  parseDirectMessage,
  toDisplayName,
} from "../../../lib/teacher/utils";
import type { ApiUser, NotificationRecord } from "../../../lib/teacher/types";

type EnrichedNotification = NotificationRecord & {
  avatar: string;
  senderName: string;
  sender: {
    name: string;
    avatar: string;
    id: number | null;
  };
  user: {
    name: string;
    avatar: string;
    id: number | null;
  };
  type: "reply" | "message" | "system";
};

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
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "replies" | "messages">(
    "all",
  );
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

  const enrichedNotifications = useMemo<EnrichedNotification[]>(() => {
    return rawNotifications.map((n) => {
      let avatar = DEFAULT_AVATAR;
      let senderName = "System";
      let senderId: number | null = null;
      let type: "reply" | "message" | "system" = "system";

      const reply = parseStudentReplyNotification(n);
      if (reply) {
        senderId = reply.studentId;
        senderName = reply.studentName;
        type = "reply";
      } else {
        const dm = parseDirectMessage(n.message);
        if (dm) {
          senderId = dm.fromId;
          senderName = dm.senderName;
          type = "message";
        }
      }

      if (senderId) {
        const user = users.find((u) => Number(u.id) === senderId);
        if (user) {
          avatar = resolveAvatarUrl(user.profile_image, DEFAULT_AVATAR);
          senderName = toDisplayName(user);
        }
      }

      const sender = {
        name: senderName,
        avatar,
        id: senderId,
      };

      return {
        ...n,
        avatar,
        senderName,
        sender,
        user: sender,
        type,
      };
    });
  }, [rawNotifications, users]);

  const notifications = useMemo(() => {
    const sorted = [...enrichedNotifications].sort(
      (a, b) =>
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime(),
    );

    const query = searchQuery.toLowerCase().trim();

    return sorted.filter((n) => {
      if (filter === "unread" && Number(n.is_read) !== 0) {
        return false;
      }

      if (typeFilter === "replies" && n.type !== "reply") {
        return false;
      }

      if (typeFilter === "messages" && n.type !== "message") {
        return false;
      }

      if (query) {
        const messageMatch = n.message.toLowerCase().includes(query);
        const senderMatch = n.senderName.toLowerCase().includes(query);
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
    () => enrichedNotifications.filter((n) => Number(n.is_read) === 0).length,
    [enrichedNotifications],
  );

  const markAsRead = useCallback(
    async (id: number) => {
      const notification = rawNotifications.find((n) => n.id === id);
      if (!notification || Number(notification.is_read) === 1) return;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)),
      );

      try {
        await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
          method: "PUT",
        });
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
        // Revert state on failure
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: 0 } : n)),
        );
        setToast({ message: "Failed to mark as read", type: "error" });
      }
    },
    [rawNotifications, setNotifications],
  );

  const deleteNotification = useCallback(
    async (id: number) => {
      const originalNotifications = [...rawNotifications];
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      try {
        const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
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
        `${API_BASE_URL}/notifications/user/${teacherId}/mark-all-as-read`,
        {
          method: "PUT",
        },
      );
      if (!response.ok) {
        // If bulk endpoint fails, try one by one (or just revert)
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
      const response = await fetch(
        `${API_BASE_URL}/notifications/user/${teacherId}/clear-read`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
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
