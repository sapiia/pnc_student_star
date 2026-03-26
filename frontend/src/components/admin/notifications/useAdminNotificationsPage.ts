import { useCallback, useEffect, useMemo, useState } from "react";

import { API_BASE_URL } from "../../../lib/api";

import type {
  AdminNotification,
  NotificationFilter,
  NotificationType,
} from "./adminNotifications.types";
import {
  filterNotifications,
  mapNotifications,
  MAX_NOTIFICATIONS,
} from "./adminNotifications.utils";

export function useAdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "any">("any");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/notifications`);
      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load notifications.");
      }

      setNotifications(mapNotifications(data).slice(0, MAX_NOTIFICATIONS));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load notifications.",
      );
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    );

    void fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PUT",
    }).catch(() => null);
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );

    void fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "DELETE",
    }).catch(() => null);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((current) => {
      void Promise.all(
        current.map((notification) =>
          fetch(`${API_BASE_URL}/notifications/${notification.id}/read`, {
            method: "PUT",
          }),
        ),
      ).catch(() => null);

      return current.map((notification) => ({
        ...notification,
        isRead: true,
      }));
    });
  }, []);

  const clearRead = useCallback(() => {
    setNotifications((current) =>
      current.filter((notification) => !notification.isRead),
    );
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const filteredNotifications = useMemo(
    () => filterNotifications(notifications, filter, typeFilter, searchQuery),
    [notifications, filter, typeFilter, searchQuery],
  );

  return {
    clearRead,
    deleteNotification,
    error,
    filter,
    filteredNotifications,
    isLoading,
    loadNotifications,
    markAllAsRead,
    markAsRead,
    notifications,
    searchQuery,
    setFilter,
    setSearchQuery,
    setTypeFilter,
    typeFilter,
    unreadCount,
  };
}
