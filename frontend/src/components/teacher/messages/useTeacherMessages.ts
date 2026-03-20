import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useTeacherIdentity } from "../../../hooks/useTeacherIdentity";
import {
  getRealtimeSocket,
  type NotificationRealtimePayload,
  type TypingRealtimePayload,
} from "../../../lib/realtime";
import {
  API_BASE_URL,
  DEFAULT_AVATAR,
  resolveAvatarUrl,
  toDisplayName,
  toRoleLabel,
  toContactType,
  parseDirectMessage,
  composeDirectMessage,
  getHiddenMessageIds,
  setHiddenMessageIds as saveHiddenMessageIds,
} from "../../../lib/teacher/utils";
import type {
  ApiUser,
  NotificationRecord,
  Contact,
  ChatMessage,
} from "../../../lib/teacher/types";

export function useTeacherMessages() {
  const navigate = useNavigate();
  const location = useLocation();

  const passedState = location.state as {
    selectedContactId?: number;
    selectedContactName?: string;
    isMobileChatOpen?: boolean;
  } | null;

  const queryContactToken = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return String(
      params.get("contactId") || params.get("studentId") || "",
    ).trim();
  }, [location.search]);

  const initialContactId = useMemo(() => {
    const fromState = Number(passedState?.selectedContactId);
    if (Number.isFinite(fromState) && fromState > 0) return fromState;
    const parsed = Number(queryContactToken);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [passedState?.selectedContactId, queryContactToken]);

  const { teacherId, teacherName, teacherAvatar } = useTeacherIdentity({
    defaultName: "Teacher",
  });
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(
    initialContactId,
  );
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(
    passedState?.isMobileChatOpen || Boolean(initialContactId),
  );
  const [messageDraft, setMessageDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "All" | "Admin" | "Teacher" | "Student"
  >("All");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [typingByContactId, setTypingByContactId] = useState<
    Record<number, boolean>
  >({});
  const [openedActionMessageId, setOpenedActionMessageId] = useState<
    number | null
  >(null);
  const [confirmDeleteMessageId, setConfirmDeleteMessageId] = useState<
    number | null
  >(null);
  const [replyToMessageId, setReplyToMessageId] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [hiddenMessageIds, setHiddenMessageIds] = useState<number[]>([]);
  const [isCompactMode, setIsCompactMode] = useState(false);

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const typingStopTimerRef = useRef<number | null>(null);
  const hasSentTypingRef = useRef(false);
  const hasRequestedContact = Boolean(
    passedState?.selectedContactId ||
    passedState?.selectedContactName ||
    queryContactToken,
  );

  // Hidden messages persistence
  useEffect(() => {
    if (!teacherId) {
      setHiddenMessageIds([]);
      return;
    }
    setHiddenMessageIds(getHiddenMessageIds(teacherId));
  }, [teacherId]);

  useEffect(() => {
    if (!teacherId) return;
    saveHiddenMessageIds(teacherId, hiddenMessageIds);
  }, [hiddenMessageIds, teacherId]);

  const loadData = useCallback(async () => {
    if (!teacherId) {
      setIsLoading(false);
      setUsers([]);
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const [usersResponse, notificationsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/users`),
        fetch(`${API_BASE_URL}/notifications`),
      ]);

      const usersData = await usersResponse.json().catch(() => []);
      const notificationsData = await notificationsResponse
        .json()
        .catch(() => []);

      if (!usersResponse.ok)
        throw new Error(usersData?.error || "Failed to load contacts.");
      if (!notificationsResponse.ok)
        throw new Error(notificationsData?.error || "Failed to load messages.");

      setUsers(Array.isArray(usersData) ? usersData : []);
      setNotifications(
        Array.isArray(notificationsData) ? notificationsData : [],
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load messages.",
      );
      setUsers([]);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // URL State Sync
  useEffect(() => {
    if (!passedState?.selectedContactId) return;
    navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: {} },
    );
  }, [
    passedState?.selectedContactId,
    navigate,
    location.pathname,
    location.search,
  ]);

  const updateContactInUrl = useCallback(
    (nextId: number | null) => {
      const params = new URLSearchParams(location.search);
      const currentId = Number(
        params.get("contactId") || params.get("studentId") || "",
      );
      if (nextId && nextId > 0) {
        if (currentId === nextId) return;
        params.set("contactId", String(nextId));
        params.delete("studentId");
      } else {
        if (!params.has("contactId") && !params.has("studentId")) return;
        params.delete("contactId");
        params.delete("studentId");
      }
      const nextSearch = params.toString();
      navigate(
        {
          pathname: location.pathname,
          search: nextSearch ? `?${nextSearch}` : "",
        },
        { replace: true, state: {} },
      );
    },
    [location.pathname, location.search, navigate],
  );

  const handleSelectContact = useCallback(
    (contactId: number) => {
      setSelectedContactId(contactId);
      setIsMobileChatOpen(true);
      updateContactInUrl(contactId);
    },
    [updateContactInUrl],
  );

  // Realtime
  useEffect(() => {
    if (!teacherId) return;
    const socket = getRealtimeSocket();
    const subscription = { userId: teacherId };
    const handleNotificationEvent = (
      payload: NotificationRealtimePayload = {},
    ) => {
      if (Number(payload.userId) !== teacherId) return;
      void loadData();
    };
    const handleTypingEvent = (payload: TypingRealtimePayload = {}) => {
      const fromId = Number(payload.fromId);
      const toId = Number(payload.toId);
      if (!fromId || toId !== teacherId) return;
      setTypingByContactId((current) => ({
        ...current,
        [fromId]: Boolean(payload.isTyping),
      }));
    };

    socket.emit("notification:subscribe", subscription);
    socket.on("notification:created", handleNotificationEvent);
    socket.on("notification:updated", handleNotificationEvent);
    socket.on("notification:deleted", handleNotificationEvent);
    socket.on("message:typing", handleTypingEvent);

    return () => {
      socket.emit("notification:unsubscribe", subscription);
      socket.off("notification:created", handleNotificationEvent);
      socket.off("notification:updated", handleNotificationEvent);
      socket.off("notification:deleted", handleNotificationEvent);
      socket.off("message:typing", handleTypingEvent);
    };
  }, [loadData, teacherId]);

  useEffect(() => {
    setTypingByContactId({});
    setOpenedActionMessageId(null);
    setConfirmDeleteMessageId(null);
    setReplyToMessageId(null);
    setEditingMessageId(null);
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [selectedContactId]);

  // Data derivation
  const directNotifications = useMemo(
    () =>
      notifications
        .map((notification) => ({
          notification,
          parsed: parseDirectMessage(notification.message),
        }))
        .filter((item) => Boolean(item.parsed)),
    [notifications],
  );

  const contacts = useMemo<Contact[]>(() => {
    if (!teacherId) return [];
    const eligibleUsers = users
      .filter((user) => Number(user.id) !== teacherId)
      .filter((user) => {
        const normalizedRole = String(user.role || "")
          .trim()
          .toLowerCase();
        return ["admin", "teacher", "student"].includes(normalizedRole);
      });

    return eligibleUsers
      .map((user) => {
        const contactId = Number(user.id);
        const contactMessages = directNotifications
          .filter(
            ({ parsed }) =>
              parsed &&
              ((parsed.fromId === teacherId && parsed.toId === contactId) ||
                (parsed.fromId === contactId && parsed.toId === teacherId)),
          )
          .sort(
            (a, b) =>
              new Date(String(b.notification.created_at)).getTime() -
              new Date(String(a.notification.created_at)).getTime(),
          );

        return {
          id: contactId,
          name: toDisplayName(user),
          studentId:
            String(user.student_id || user.resolved_student_id || "").trim() ||
            undefined,
          role: toRoleLabel(String(user.role || "")),
          type: toContactType(String(user.role || "")),
          avatar: resolveAvatarUrl(
            String(user.profile_image || "").trim(),
            DEFAULT_AVATAR,
          ),
          lastMessage: contactMessages[0]?.parsed?.text || "",
          timestamp: contactMessages[0]?.notification?.created_at,
          unreadCount: contactMessages.filter(
            ({ parsed, notification }) =>
              parsed &&
              parsed.fromId === contactId &&
              parsed.toId === teacherId &&
              Number(notification.is_read) !== 1,
          ).length,
          activityCount: contactMessages.length,
        };
      })
      .sort(
        (a, b) =>
          b.activityCount - a.activityCount ||
          new Date(String(b.timestamp || "")).getTime() -
            new Date(String(a.timestamp || "")).getTime(),
      );
  }, [directNotifications, teacherId, users]);

  // Initial selection logic based on props/url
  useEffect(() => {
    if (!passedState?.selectedContactId && !queryContactToken) return;
    let nextId: number | null = null;
    const fromState = Number(passedState?.selectedContactId);
    if (Number.isFinite(fromState) && fromState > 0) nextId = fromState;

    if (!nextId && queryContactToken) {
      const numeric = Number(queryContactToken);
      if (Number.isFinite(numeric) && numeric > 0) nextId = numeric;
    }

    if (queryContactToken) {
      const token = queryContactToken.toLowerCase();
      if (!nextId || !contacts.some((c) => c.id === nextId)) {
        const matched =
          contacts.find((c) => c.studentId?.toLowerCase() === token) ||
          contacts.find((c) => c.name.toLowerCase() === token);
        if (matched) nextId = matched.id;
      }
    }

    if (nextId) {
      setSelectedContactId(nextId);
      setIsMobileChatOpen(true);
      setSearchQuery("");
    }
  }, [contacts, passedState?.selectedContactId, queryContactToken]);

  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return contacts.filter((c) => {
      const matches =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q);
      return (
        matches &&
        (roleFilter === "All" || c.type === roleFilter) &&
        (!showUnreadOnly || c.unreadCount > 0)
      );
    });
  }, [contacts, roleFilter, searchQuery, showUnreadOnly]);

  // Fallback selection if invalid
  useEffect(() => {
    if (isLoading) return;
    if (contacts.length === 0) {
      setSelectedContactId(null);
      if (!hasRequestedContact) updateContactInUrl(null);
      return;
    }
    const pool = filteredContacts.length > 0 ? filteredContacts : contacts;
    const exists = pool.some((c) => c.id === selectedContactId);

    if (!exists && selectedContactId !== null) {
      if (passedState?.selectedContactName) {
        const byName = pool.find(
          (c) =>
            c.name.toLowerCase() ===
            passedState.selectedContactName?.toLowerCase(),
        );
        if (byName) {
          setSelectedContactId(byName.id);
          updateContactInUrl(byName.id);
          return;
        }
      }
      if (!hasRequestedContact) {
        const fallback = pool[0]?.id ?? null;
        setSelectedContactId(fallback);
        updateContactInUrl(fallback);
      } else {
        setSelectedContactId(null);
      }
      return;
    }
    if (selectedContactId === null && !hasRequestedContact) {
      setSelectedContactId(pool[0].id);
      updateContactInUrl(pool[0].id);
    }
  }, [
    contacts,
    filteredContacts,
    hasRequestedContact,
    isLoading,
    passedState?.selectedContactName,
    selectedContactId,
    updateContactInUrl,
  ]);

  const selectedContact =
    filteredContacts.find((c) => c.id === selectedContactId) || null;

  const currentMessages = useMemo<ChatMessage[]>(() => {
    if (!teacherId || !selectedContactId) return [];
    return directNotifications
      .filter(
        ({ parsed }) =>
          parsed &&
          ((parsed.fromId === teacherId && parsed.toId === selectedContactId) ||
            (parsed.fromId === selectedContactId && parsed.toId === teacherId)),
      )
      .sort(
        (a, b) =>
          new Date(String(a.notification.created_at)).getTime() -
          new Date(String(b.notification.created_at)).getTime(),
      )
      .map(({ notification, parsed }) => ({
        id: Number(notification.id),
        isMe: Number(parsed?.fromId) === teacherId,
        fromId: Number(parsed?.fromId || 0),
        toId: Number(parsed?.toId || 0),
        senderName: String(parsed?.senderName || ""),
        text: String(parsed?.text || ""),
        createdAt: notification.created_at,
        notificationId: Number(notification.id),
        isRead: Number(notification.is_read) === 1,
        rawIsRead: Number(notification.is_read) === 1 ? 1 : 0,
      }));
  }, [directNotifications, selectedContactId, teacherId]);

  const visibleMessages = useMemo(
    () => currentMessages.filter((m) => !hiddenMessageIds.includes(m.id)),
    [currentMessages, hiddenMessageIds],
  );
  const replyTarget = useMemo(
    () => currentMessages.find((m) => m.id === replyToMessageId) || null,
    [currentMessages, replyToMessageId],
  );
  const editingTarget = useMemo(
    () => currentMessages.find((m) => m.id === editingMessageId) || null,
    [currentMessages, editingMessageId],
  );

  // Mark as read
  useEffect(() => {
    if (!teacherId || !selectedContactId) return;
    const unread = currentMessages.filter(
      (m) => !m.isMe && !m.isRead && m.notificationId,
    );
    if (unread.length === 0) return;
    const markRead = async () => {
      await Promise.all(
        unread.map((m) =>
          fetch(`${API_BASE_URL}/notifications/${m.notificationId}/read`, {
            method: "PUT",
          }).catch(() => null),
        ),
      );
      void loadData();
    };
    void markRead();
  }, [currentMessages, loadData, selectedContactId, teacherId]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesRef.current)
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
  }, [visibleMessages, selectedContactId]);

  // Typing handler
  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!teacherId || !selectedContactId) return;
      getRealtimeSocket().emit("message:typing", {
        fromId: teacherId,
        toId: selectedContactId,
        isTyping,
      });
    },
    [selectedContactId, teacherId],
  );

  const handleDraftChange = (nextValue: string) => {
    setMessageDraft(nextValue);
    if (!teacherId || !selectedContactId) return;
    const hasText = nextValue.trim().length > 0;
    if (hasText && !hasSentTypingRef.current) {
      emitTyping(true);
      hasSentTypingRef.current = true;
    }
    if (typingStopTimerRef.current) {
      window.clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }
    if (hasText) {
      typingStopTimerRef.current = window.setTimeout(() => {
        emitTyping(false);
        hasSentTypingRef.current = false;
        typingStopTimerRef.current = null;
      }, 1200);
    } else if (hasSentTypingRef.current) {
      emitTyping(false);
      hasSentTypingRef.current = false;
    }
  };

  const stopTyping = useCallback(() => {
    if (typingStopTimerRef.current) {
      window.clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }
    if (hasSentTypingRef.current) {
      emitTyping(false);
      hasSentTypingRef.current = false;
    }
  }, [emitTyping]);

  useEffect(
    () => () => {
      if (typingStopTimerRef.current)
        window.clearTimeout(typingStopTimerRef.current);
    },
    [],
  );

  // Message actions
  const handleDeleteMessage = async (message: ChatMessage) => {
    if (!message.notificationId) return;
    setIsSending(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/notifications/${message.notificationId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to delete message.");
      if (editingMessageId === message.id) {
        setEditingMessageId(null);
        setMessageDraft("");
      }
      if (replyToMessageId === message.id) setReplyToMessageId(null);
      setConfirmDeleteMessageId(null);
      setOpenedActionMessageId(null);
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (
      !teacherId ||
      !selectedContactId ||
      !selectedContact ||
      !messageDraft.trim()
    )
      return;
    setIsSending(true);
    try {
      const text = messageDraft.trim();
      if (editingTarget?.notificationId && editingTarget.isMe) {
        const msg = composeDirectMessage({
          fromId: teacherId,
          toId: selectedContactId,
          senderName: teacherName,
          text,
        });
        const res = await fetch(
          `${API_BASE_URL}/notifications/${editingTarget.notificationId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: msg,
              is_read: editingTarget.rawIsRead,
            }),
          },
        );
        if (!res.ok) throw new Error("Failed to edit.");
        setMessageDraft("");
        setEditingMessageId(null);
        stopTyping();
        void loadData();
        return;
      }
      const outgoing = replyTarget
        ? `Reply to "${replyTarget.text.slice(0, 120)}": ${text}`
        : text;
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedContactId,
          is_read: 0,
          message: composeDirectMessage({
            fromId: teacherId,
            toId: selectedContactId,
            senderName: teacherName,
            text: outgoing,
          }),
        }),
      });
      if (!res.ok) throw new Error("Failed to send.");
      setMessageDraft("");
      setReplyToMessageId(null);
      stopTyping();
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send.");
    } finally {
      setIsSending(false);
    }
  };

  return {
    teacherName,
    teacherAvatar,
    selectedContactId,
    isMobileChatOpen,
    messageDraft,
    searchQuery,
    roleFilter,
    showUnreadOnly,
    isLoading,
    error,
    isSending,
    openedActionMessageId,
    confirmDeleteMessageId,
    isCompactMode,
    typingByContactId,
    unreadTotal: contacts.reduce((sum, c) => sum + c.unreadCount, 0),
    filteredContacts,
    selectedContact,
    visibleMessages,
    replyTarget,
    editingTarget,
    messagesRef,
    setIsMobileChatOpen,
    setIsCompactMode,
    setSearchQuery,
    setRoleFilter,
    setShowUnreadOnly,
    handleSelectContact,
    handleDraftChange,
    handleSendMessage,
    handleReplyMessage: (m: ChatMessage) => {
      setReplyToMessageId(m.id);
      setEditingMessageId(null);
      setConfirmDeleteMessageId(null);
      setOpenedActionMessageId(null);
    },
    handleEditMessage: (m: ChatMessage) => {
      if (!m.isMe) return;
      setEditingMessageId(m.id);
      setReplyToMessageId(null);
      setConfirmDeleteMessageId(null);
      setMessageDraft(m.text);
      setOpenedActionMessageId(null);
    },
    handleHideMessage: (id: number) => {
      setHiddenMessageIds((c) => (c.includes(id) ? c : [id, ...c]));
      setConfirmDeleteMessageId(null);
      setOpenedActionMessageId(null);
    },
    promptDeleteMessage: (id: number) => {
      setConfirmDeleteMessageId(id);
      setOpenedActionMessageId(null);
    },
    handleDeleteMessage,
    handleToggleActions: (id: number) =>
      setOpenedActionMessageId((c) => (c === id ? null : id)),
    handleCancelEdit: () => {
      setEditingMessageId(null);
      setMessageDraft("");
    },
    stopTyping,
    cancelReply: () => setReplyToMessageId(null),
    cancelDelete: () => setConfirmDeleteMessageId(null),
    navigateToNotifications: () => navigate("/teacher/notifications"),
    navigateToStudentProfile: (id: number) =>
      navigate(`/teacher/students/${id}`),
  };
}
