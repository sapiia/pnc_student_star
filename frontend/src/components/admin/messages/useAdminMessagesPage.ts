import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { API_BASE_URL } from "../../../lib/api";
import {
  getRealtimeSocket,
  type NotificationRealtimePayload,
  type TypingRealtimePayload,
} from "../../../lib/realtime";

import type {
  AdminProfile,
  ApiUser,
  ChatMessage,
  NotificationRecord,
} from "./adminMessages.types";
import {
  buildContacts,
  buildConversationMessages,
  composeDirectMessage,
  filterContacts,
  getStoredAdminProfile,
  mapDirectNotifications,
  parseStoredHiddenMessageIds,
} from "./adminMessages.utils";

const REPLY_PREVIEW_LENGTH = 120;

export function useAdminMessagesPage() {
  const [admin, setAdmin] = useState<AdminProfile>({
    id: null,
    name: "Administrator",
    avatar: getStoredAdminProfile().avatar,
  });
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(
    null,
  );
  const [messageDraft, setMessageDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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
  const typingStopTimerRef = useRef<number | null>(null);
  const hasSentTypingRef = useRef(false);

  const adminId = admin.id;
  const adminName = admin.name;
  const adminAvatar = admin.avatar;

  useEffect(() => {
    setAdmin(getStoredAdminProfile());
  }, []);

  useEffect(() => {
    if (!adminId) {
      setHiddenMessageIds([]);
      return;
    }

    const stored = localStorage.getItem(
      `admin_hidden_direct_messages_${adminId}`,
    );
    setHiddenMessageIds(parseStoredHiddenMessageIds(stored));
  }, [adminId]);

  useEffect(() => {
    if (!adminId) return;

    localStorage.setItem(
      `admin_hidden_direct_messages_${adminId}`,
      JSON.stringify(hiddenMessageIds),
    );
  }, [adminId, hiddenMessageIds]);

  const loadData = useCallback(async () => {
    if (!adminId) {
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

      if (!usersResponse.ok) {
        throw new Error(usersData?.error || "Failed to load contacts.");
      }

      if (!notificationsResponse.ok) {
        throw new Error(notificationsData?.error || "Failed to load messages.");
      }

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
  }, [adminId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!adminId) return;

    const socket = getRealtimeSocket();
    const subscription = { userId: adminId };
    const handleNotificationEvent = (
      payload: NotificationRealtimePayload = {},
    ) => {
      if (Number(payload.userId) !== adminId) return;
      void loadData();
    };
    const handleTypingEvent = (payload: TypingRealtimePayload = {}) => {
      const fromId = Number(payload.fromId);
      const toId = Number(payload.toId);
      if (!fromId || toId !== adminId) return;

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
  }, [adminId, loadData]);

  useEffect(() => {
    setTypingByContactId({});
    setOpenedActionMessageId(null);
    setConfirmDeleteMessageId(null);
    setReplyToMessageId(null);
    setEditingMessageId(null);
  }, [selectedContactId]);

  const directNotifications = useMemo(
    () => mapDirectNotifications(notifications),
    [notifications],
  );

  const contacts = useMemo(
    () => buildContacts(adminId, users, directNotifications),
    [adminId, directNotifications, users],
  );

  const filteredContacts = useMemo(
    () => filterContacts(contacts, searchQuery),
    [contacts, searchQuery],
  );

  useEffect(() => {
    if (filteredContacts.length === 0) {
      setSelectedContactId(null);
      return;
    }

    const contactStillVisible = filteredContacts.some(
      (contact) => contact.id === selectedContactId,
    );

    if (!contactStillVisible) {
      setSelectedContactId(filteredContacts[0].id);
    }
  }, [filteredContacts, selectedContactId]);

  const selectedContact =
    filteredContacts.find((contact) => contact.id === selectedContactId) ||
    null;

  const currentMessages = useMemo(
    () =>
      buildConversationMessages(
        adminId,
        selectedContactId,
        directNotifications,
      ),
    [adminId, directNotifications, selectedContactId],
  );

  const visibleMessages = useMemo(
    () =>
      currentMessages.filter(
        (message) => !hiddenMessageIds.includes(message.id),
      ),
    [currentMessages, hiddenMessageIds],
  );

  const replyTarget = useMemo(
    () =>
      currentMessages.find((message) => message.id === replyToMessageId) ||
      null,
    [currentMessages, replyToMessageId],
  );

  const editingTarget = useMemo(
    () =>
      currentMessages.find((message) => message.id === editingMessageId) ||
      null,
    [currentMessages, editingMessageId],
  );

  useEffect(() => {
    if (!adminId || !selectedContactId) return;

    const unreadIncoming = currentMessages.filter(
      (message) => !message.isMe && !message.isRead && message.notificationId,
    );
    if (unreadIncoming.length === 0) return;

    const markRead = async () => {
      await Promise.all(
        unreadIncoming.map((message) =>
          fetch(
            `${API_BASE_URL}/notifications/${message.notificationId}/read`,
            {
              method: "PUT",
            },
          ).catch(() => null),
        ),
      );

      void loadData();
      window.dispatchEvent(new CustomEvent("admin-notifications-updated"));
    };

    void markRead();
  }, [adminId, currentMessages, loadData, selectedContactId]);

  const unreadTotal = useMemo(
    () => contacts.reduce((sum, contact) => sum + contact.unreadCount, 0),
    [contacts],
  );

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!adminId || !selectedContactId) return;

      const socket = getRealtimeSocket();
      socket.emit("message:typing", {
        fromId: adminId,
        toId: selectedContactId,
        isTyping,
      });
    },
    [adminId, selectedContactId],
  );

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

  useEffect(() => stopTyping, [stopTyping]);

  const handleDraftChange = useCallback(
    (nextValue: string) => {
      setMessageDraft(nextValue);
      if (!adminId || !selectedContactId) return;

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
    },
    [adminId, emitTyping, selectedContactId],
  );

  const handleSelectContact = useCallback((contactId: number) => {
    setSelectedContactId(contactId);
  }, []);

  const handleCloseConversation = useCallback(() => {
    setSelectedContactId(null);
  }, []);

  const handleToggleMessageActions = useCallback((messageId: number) => {
    setOpenedActionMessageId((current) =>
      current === messageId ? null : messageId,
    );
  }, []);

  const handleReplyMessage = useCallback((message: ChatMessage) => {
    setReplyToMessageId(message.id);
    setEditingMessageId(null);
    setConfirmDeleteMessageId(null);
    setOpenedActionMessageId(null);
  }, []);

  const handleEditMessage = useCallback((message: ChatMessage) => {
    if (!message.isMe) return;

    setEditingMessageId(message.id);
    setReplyToMessageId(null);
    setConfirmDeleteMessageId(null);
    setMessageDraft(message.text);
    setOpenedActionMessageId(null);
  }, []);

  const handleHideMessage = useCallback((messageId: number) => {
    setHiddenMessageIds((current) =>
      current.includes(messageId) ? current : [messageId, ...current],
    );
    setConfirmDeleteMessageId(null);
    setOpenedActionMessageId(null);
  }, []);

  const promptDeleteMessage = useCallback((messageId: number) => {
    setConfirmDeleteMessageId(messageId);
    setOpenedActionMessageId(null);
  }, []);

  const cancelDeleteMessage = useCallback(() => {
    setConfirmDeleteMessageId(null);
  }, []);

  const cancelReply = useCallback(() => {
    setReplyToMessageId(null);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setMessageDraft("");
  }, []);

  const handleDeleteMessage = useCallback(
    async (message: ChatMessage) => {
      if (!message.notificationId) return;

      setIsSending(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/${message.notificationId}`,
          {
            method: "DELETE",
          },
        );
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error || "Failed to delete message.");
        }

        if (editingMessageId === message.id) {
          setEditingMessageId(null);
          setMessageDraft("");
        }

        if (replyToMessageId === message.id) {
          setReplyToMessageId(null);
        }

        setConfirmDeleteMessageId(null);
        setOpenedActionMessageId(null);
        void loadData();
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "Failed to delete message.",
        );
      } finally {
        setIsSending(false);
      }
    },
    [editingMessageId, loadData, replyToMessageId],
  );

  const handleSendMessage = useCallback(async () => {
    if (!adminId || !selectedContactId || !selectedContact) return;

    const text = messageDraft.trim();
    if (!text) return;

    setIsSending(true);
    setError("");

    try {
      if (editingTarget?.notificationId && editingTarget.isMe) {
        const updatedMessage = composeDirectMessage({
          fromId: adminId,
          toId: selectedContactId,
          senderName: adminName,
          text,
        });
        const updateResponse = await fetch(
          `${API_BASE_URL}/notifications/${editingTarget.notificationId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: updatedMessage,
              is_read: editingTarget.rawIsRead,
            }),
          },
        );
        const updateData = await updateResponse.json().catch(() => ({}));

        if (!updateResponse.ok) {
          throw new Error(updateData?.error || "Failed to edit message.");
        }

        setMessageDraft("");
        setEditingMessageId(null);
        stopTyping();
        void loadData();
        window.dispatchEvent(new CustomEvent("admin-notifications-updated"));
        return;
      }

      const outgoingText = replyTarget
        ? `Reply to "${replyTarget.text.slice(0, REPLY_PREVIEW_LENGTH)}": ${text}`
        : text;
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: selectedContactId,
          is_read: 0,
          message: composeDirectMessage({
            fromId: adminId,
            toId: selectedContactId,
            senderName: adminName,
            text: outgoingText,
          }),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send message.");
      }

      setMessageDraft("");
      setReplyToMessageId(null);
      stopTyping();
      void loadData();
      window.dispatchEvent(new CustomEvent("admin-notifications-updated"));
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Failed to send message.",
      );
    } finally {
      setIsSending(false);
    }
  }, [
    adminId,
    adminName,
    editingTarget,
    loadData,
    messageDraft,
    replyTarget,
    selectedContact,
    selectedContactId,
    stopTyping,
  ]);

  return {
    adminAvatar,
    adminName,
    cancelDeleteMessage,
    cancelEdit,
    cancelReply,
    confirmDeleteMessageId,
    contacts: filteredContacts,
    editingTarget,
    error,
    handleCloseConversation,
    handleDeleteMessage,
    handleDraftChange,
    handleEditMessage,
    handleHideMessage,
    handleReplyMessage,
    handleSelectContact,
    handleSendMessage,
    handleToggleMessageActions,
    isLoading,
    isSelectedContactTyping: selectedContact
      ? Boolean(typingByContactId[selectedContact.id])
      : false,
    isSending,
    messageDraft,
    openedActionMessageId,
    promptDeleteMessage,
    replyTarget,
    searchQuery,
    selectedContact,
    selectedContactId,
    setSearchQuery,
    stopTyping,
    unreadTotal,
    visibleMessages,
  };
}
