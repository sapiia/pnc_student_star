import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import MessagesHeader from '../../components/teacher/messages/MessagesHeader';
import ContactsPanel from '../../components/teacher/messages/ContactsPanel';
import ChatHeader from '../../components/teacher/messages/ChatHeader';
import MessagesList from '../../components/teacher/messages/MessagesList';
import MessageComposer from '../../components/teacher/messages/MessageComposer';
import { useTeacherIdentity } from '../../hooks/useTeacherIdentity';

import { cn } from '../../lib/utils';
import { getRealtimeSocket, type NotificationRealtimePayload, type TypingRealtimePayload } from '../../lib/realtime';
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
} from '../../lib/teacher/utils';
import type { ApiUser, NotificationRecord, Contact, ChatMessage } from '../../lib/teacher/types';

export default function TeacherMessagesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedState = location.state as {
    selectedContactId?: number;
    selectedContactName?: string;
    isMobileChatOpen?: boolean;
  } | null;
  const queryContactToken = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return String(params.get('contactId') || params.get('studentId') || '').trim();
  }, [location.search]);
  const initialContactId = useMemo(() => {
    const fromState = Number(passedState?.selectedContactId);
    if (Number.isFinite(fromState) && fromState > 0) return fromState;
    const parsed = Number(queryContactToken);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [passedState?.selectedContactId, queryContactToken]);
  
  const { teacherId, teacherName, teacherAvatar } = useTeacherIdentity({ defaultName: 'Teacher' });
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(initialContactId);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(
    passedState?.isMobileChatOpen || Boolean(initialContactId)
  );
  const [messageDraft, setMessageDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Admin' | 'Teacher' | 'Student'>('All');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingByContactId, setTypingByContactId] = useState<Record<number, boolean>>({});
  const [openedActionMessageId, setOpenedActionMessageId] = useState<number | null>(null);
  const [confirmDeleteMessageId, setConfirmDeleteMessageId] = useState<number | null>(null);
  const [replyToMessageId, setReplyToMessageId] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [hiddenMessageIds, setHiddenMessageIds] = useState<number[]>([]);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const typingStopTimerRef = useRef<number | null>(null);
  const hasSentTypingRef = useRef(false);
  const hasRequestedContact = Boolean(
    passedState?.selectedContactId || passedState?.selectedContactName || queryContactToken
  );

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
    setError('');
    try {
      const [usersResponse, notificationsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/users`),
        fetch(`${API_BASE_URL}/notifications`),
      ]);

      const usersData = await usersResponse.json().catch(() => []);
      const notificationsData = await notificationsResponse.json().catch(() => []);

      if (!usersResponse.ok) {
        throw new Error(usersData?.error || 'Failed to load contacts.');
      }
      if (!notificationsResponse.ok) {
        throw new Error(notificationsData?.error || 'Failed to load messages.');
      }

      setUsers(Array.isArray(usersData) ? usersData : []);
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load messages.');
      setUsers([]);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!passedState?.selectedContactId) return;
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: {} });
  }, [passedState?.selectedContactId, navigate, location.pathname, location.search]);

  const updateContactInUrl = useCallback((nextId: number | null) => {
    const params = new URLSearchParams(location.search);
    const currentId = Number(params.get('contactId') || params.get('studentId') || '');
    if (nextId && nextId > 0) {
      if (currentId === nextId) return;
      params.set('contactId', String(nextId));
      params.delete('studentId');
    } else {
      if (!params.has('contactId') && !params.has('studentId')) return;
      params.delete('contactId');
      params.delete('studentId');
    }
    const nextSearch = params.toString();
    navigate({ pathname: location.pathname, search: nextSearch ? `?${nextSearch}` : '' }, { replace: true, state: {} });
  }, [location.pathname, location.search, navigate]);

  const handleSelectContact = useCallback((contactId: number) => {
    setSelectedContactId(contactId);
    setIsMobileChatOpen(true);
    updateContactInUrl(contactId);
  }, [updateContactInUrl]);

  useEffect(() => {
    if (!teacherId) return;

    const socket = getRealtimeSocket();
    const subscription = { userId: teacherId };
    const handleNotificationEvent = (payload: NotificationRealtimePayload = {}) => {
      if (Number(payload.userId) !== teacherId) return;
      void loadData();
    };
    const handleTypingEvent = (payload: TypingRealtimePayload = {}) => {
      const fromId = Number(payload.fromId);
      const toId = Number(payload.toId);
      if (!fromId || toId !== teacherId) return;
      setTypingByContactId((current) => ({ ...current, [fromId]: Boolean(payload.isTyping) }));
    };

    socket.emit('notification:subscribe', subscription);
    socket.on('notification:created', handleNotificationEvent);
    socket.on('notification:updated', handleNotificationEvent);
    socket.on('notification:deleted', handleNotificationEvent);
    socket.on('message:typing', handleTypingEvent);

    return () => {
      socket.emit('notification:unsubscribe', subscription);
      socket.off('notification:created', handleNotificationEvent);
      socket.off('notification:updated', handleNotificationEvent);
      socket.off('notification:deleted', handleNotificationEvent);
      socket.off('message:typing', handleTypingEvent);
    };
  }, [loadData, teacherId]);

  useEffect(() => {
    setTypingByContactId({});
    setOpenedActionMessageId(null);
    setConfirmDeleteMessageId(null);
    setReplyToMessageId(null);
    setEditingMessageId(null);
    // Smoothly focus the conversation area on contact switch
    if (messagesRef.current) {
      messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [selectedContactId]);

  const directNotifications = useMemo(() => (
    notifications
      .map((notification) => ({
        notification,
        parsed: parseDirectMessage(notification.message),
      }))
      .filter((item) => Boolean(item.parsed))
  ), [notifications]);

  const contacts = useMemo<Contact[]>(() => {
    if (!teacherId) return [];

    const eligibleUsers = users
      .filter((user) => Number(user.id) !== teacherId)
      .filter((user) => {
        const normalizedRole = String(user.role || '').trim().toLowerCase();
        return normalizedRole === 'admin' || normalizedRole === 'teacher' || normalizedRole === 'student';
      });

    return eligibleUsers.map((user) => {
      const contactId = Number(user.id);
      const contactMessages = directNotifications
        .filter(({ parsed }) => (
          parsed && (
            (parsed.fromId === teacherId && parsed.toId === contactId) ||
            (parsed.fromId === contactId && parsed.toId === teacherId)
          )
        ))
        .sort((left, right) => (
          new Date(String(right.notification.created_at || '')).getTime() -
          new Date(String(left.notification.created_at || '')).getTime()
        ));

      const lastMessage = contactMessages[0]?.parsed?.text || '';
      const activityCount = contactMessages.length;
      const unreadCount = contactMessages.filter(({ parsed, notification }) => (
        parsed && parsed.fromId === contactId && parsed.toId === teacherId && Number(notification.is_read) !== 1
      )).length;

      return {
        id: contactId,
        name: toDisplayName(user),
        studentId: String(user.student_id || user.resolved_student_id || '').trim() || undefined,
        role: toRoleLabel(String(user.role || '')),
        type: toContactType(String(user.role || '')),
        avatar: resolveAvatarUrl(
          String(user.profile_image || '').trim(),
          DEFAULT_AVATAR,
        ),
        lastMessage,
        timestamp: contactMessages[0]?.notification?.created_at,
        unreadCount,
        activityCount,
      };
    }).sort((left, right) => (
      right.activityCount - left.activityCount ||
      new Date(String(right.timestamp || '')).getTime() - new Date(String(left.timestamp || '')).getTime()
    ));
  }, [directNotifications, teacherId, users]);

  useEffect(() => {
    if (!passedState?.selectedContactId && !queryContactToken) return;

    let nextId: number | null = null;
    const fromState = Number(passedState?.selectedContactId);
    if (Number.isFinite(fromState) && fromState > 0) {
      nextId = fromState;
    }

    if (!nextId && queryContactToken) {
      const numeric = Number(queryContactToken);
      if (Number.isFinite(numeric) && numeric > 0) {
        nextId = numeric;
      }
    }

    if (queryContactToken) {
      const normalizedToken = queryContactToken.toLowerCase();
      if (!nextId || !contacts.some((contact) => contact.id === nextId)) {
        const matchedByStudentId = contacts.find((contact) => contact.studentId?.toLowerCase() === normalizedToken);
        if (matchedByStudentId) {
          nextId = matchedByStudentId.id;
        }
      }
      if (!nextId || !contacts.some((contact) => contact.id === nextId)) {
        const matchedByName = contacts.find((contact) => contact.name.toLowerCase() === normalizedToken);
        if (matchedByName) {
          nextId = matchedByName.id;
        }
      }
    }

    if (nextId) {
      setSelectedContactId(nextId);
      setIsMobileChatOpen(true);
      setSearchQuery('');
    }
  }, [contacts, passedState?.selectedContactId, queryContactToken]);

  const filteredContacts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return contacts.filter((contact) => {
      const matchesQuery =
        !normalizedQuery ||
        contact.name.toLowerCase().includes(normalizedQuery) ||
        contact.role.toLowerCase().includes(normalizedQuery) ||
        contact.lastMessage.toLowerCase().includes(normalizedQuery);
      const matchesRole = roleFilter === 'All' || contact.type === roleFilter;
      const matchesUnread = !showUnreadOnly || contact.unreadCount > 0;
      return matchesQuery && matchesRole && matchesUnread;
    });
  }, [contacts, roleFilter, searchQuery, showUnreadOnly]);

  useEffect(() => {
    if (isLoading) return;
    if (contacts.length === 0) {
      setSelectedContactId(null);
      if (!hasRequestedContact) {
        updateContactInUrl(null);
      }
      return;
    }

    const matchedByName = passedState?.selectedContactName
      ? contacts.find(
        (contact) => contact.name.toLowerCase() === passedState.selectedContactName?.trim().toLowerCase()
      )
      : null;

    const existsInContacts = contacts.some((contact) => contact.id === selectedContactId);
    if (!existsInContacts && selectedContactId !== null) {
      if (matchedByName) {
        setSelectedContactId(matchedByName.id);
        setIsMobileChatOpen(true);
        if (!hasRequestedContact) {
          updateContactInUrl(matchedByName.id);
        }
        return;
      }
      setSelectedContactId(null);
      if (!hasRequestedContact) {
        updateContactInUrl(null);
      }
      return;
    }

    if (selectedContactId === null) {
      if (matchedByName) {
        setSelectedContactId(matchedByName.id);
        setIsMobileChatOpen(true);
        if (!hasRequestedContact) {
          updateContactInUrl(matchedByName.id);
        }
        return;
      }
      if (!hasRequestedContact) {
        setSelectedContactId(contacts[0].id);
        updateContactInUrl(contacts[0].id);
      }
    }
  }, [contacts, hasRequestedContact, isLoading, passedState?.selectedContactName, selectedContactId, updateContactInUrl]);

  const selectedContact = filteredContacts.find((contact) => contact.id === selectedContactId) || null;

  const currentMessages = useMemo<ChatMessage[]>(() => {
    if (!teacherId || !selectedContactId) return [];

    return directNotifications
      .filter(({ parsed }) => (
        parsed && (
          (parsed.fromId === teacherId && parsed.toId === selectedContactId) ||
          (parsed.fromId === selectedContactId && parsed.toId === teacherId)
        )
      ))
      .sort((left, right) => (
        new Date(String(left.notification.created_at || '')).getTime() -
        new Date(String(right.notification.created_at || '')).getTime()
      ))
      .map(({ notification, parsed }) => ({
        id: Number(notification.id),
        isMe: Number(parsed?.fromId) === teacherId,
        fromId: Number(parsed?.fromId || 0),
        toId: Number(parsed?.toId || 0),
        senderName: String(parsed?.senderName || ''),
        text: String(parsed?.text || ''),
        createdAt: notification.created_at,
        notificationId: Number(notification.id),
        isRead: Number(notification.is_read) === 1,
        rawIsRead: Number(notification.is_read) === 1 ? 1 : 0,
      }));
  }, [directNotifications, selectedContactId, teacherId]);

  const visibleMessages = useMemo(() => (
    currentMessages.filter((message) => !hiddenMessageIds.includes(message.id))
  ), [currentMessages, hiddenMessageIds]);

  const replyTarget = useMemo(() => (
    currentMessages.find((message) => message.id === replyToMessageId) || null
  ), [currentMessages, replyToMessageId]);

  const editingTarget = useMemo(() => (
    currentMessages.find((message) => message.id === editingMessageId) || null
  ), [currentMessages, editingMessageId]);

  useEffect(() => {
    if (!teacherId || !selectedContactId) return;

    const unreadIncoming = currentMessages.filter((message) => !message.isMe && !message.isRead && message.notificationId);
    if (unreadIncoming.length === 0) return;

    const markRead = async () => {
      await Promise.all(
        unreadIncoming.map((message) => fetch(`${API_BASE_URL}/notifications/${message.notificationId}/read`, {
          method: 'PUT',
        }).catch(() => null))
      );
      void loadData();
    };

    void markRead();
  }, [currentMessages, loadData, selectedContactId, teacherId]);

  const scrollMessagesToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollMessagesToBottom();
  }, [visibleMessages, selectedContactId, scrollMessagesToBottom]);

  const unreadTotal = useMemo(() => (
    contacts.reduce((sum, contact) => sum + contact.unreadCount, 0)
  ), [contacts]);

  const emitTyping = useCallback((isTyping: boolean) => {
    if (!teacherId || !selectedContactId) return;
    const socket = getRealtimeSocket();
    socket.emit('message:typing', {
      fromId: teacherId,
      toId: selectedContactId,
      isTyping,
    });
  }, [selectedContactId, teacherId]);

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

  useEffect(() => () => {
    if (typingStopTimerRef.current) {
      window.clearTimeout(typingStopTimerRef.current);
    }
  }, []);

  const handleReplyMessage = (message: ChatMessage) => {
    setReplyToMessageId(message.id);
    setEditingMessageId(null);
    setConfirmDeleteMessageId(null);
    setOpenedActionMessageId(null);
  };

  const handleEditMessage = (message: ChatMessage) => {
    if (!message.isMe) return;
    setEditingMessageId(message.id);
    setReplyToMessageId(null);
    setConfirmDeleteMessageId(null);
    setMessageDraft(message.text);
    setOpenedActionMessageId(null);
  };

  const handleHideMessage = (messageId: number) => {
    setHiddenMessageIds((current) => (current.includes(messageId) ? current : [messageId, ...current]));
    setConfirmDeleteMessageId(null);
    setOpenedActionMessageId(null);
  };

  const promptDeleteMessage = (messageId: number) => {
    setConfirmDeleteMessageId(messageId);
    setOpenedActionMessageId(null);
  };

  const handleDeleteMessage = async (message: ChatMessage) => {
    if (!message.notificationId) return;

    setIsSending(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${message.notificationId}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete message.');
      }
      if (editingMessageId === message.id) {
        setEditingMessageId(null);
        setMessageDraft('');
      }
      if (replyToMessageId === message.id) {
        setReplyToMessageId(null);
      }
      setConfirmDeleteMessageId(null);
      setOpenedActionMessageId(null);
      void loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!teacherId || !selectedContactId || !selectedContact) return;

    const text = messageDraft.trim();
    if (!text) return;

    setIsSending(true);
    setError('');

    try {
      if (editingTarget?.notificationId && editingTarget.isMe) {
        const updatedMessage = composeDirectMessage({
          fromId: teacherId,
          toId: selectedContactId,
          senderName: teacherName,
          text,
        });
        const updateResponse = await fetch(`${API_BASE_URL}/notifications/${editingTarget.notificationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: updatedMessage,
            is_read: editingTarget.rawIsRead,
          }),
        });
        const updateData = await updateResponse.json().catch(() => ({}));
        if (!updateResponse.ok) {
          throw new Error(updateData?.error || 'Failed to edit message.');
        }
        setMessageDraft('');
        setEditingMessageId(null);
        stopTyping();
        void loadData();
        return;
      }

      const outgoingText = replyTarget
        ? `Reply to "${replyTarget.text.slice(0, 120)}": ${text}`
        : text;
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedContactId,
          is_read: 0,
          message: composeDirectMessage({
            fromId: teacherId,
            toId: selectedContactId,
            senderName: teacherName,
            text: outgoingText,
          }),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to send message.');
      }

      setMessageDraft('');
      setReplyToMessageId(null);
      stopTyping();
      void loadData();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleActions = (messageId: number) => {
    setOpenedActionMessageId((current) => (current === messageId ? null : messageId));
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setMessageDraft('');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TeacherMobileNav />
        <MessagesHeader
          unreadTotal={unreadTotal}
          onOpenNotifications={() => navigate('/teacher/notifications')}
        />

        <div className="flex-1 flex overflow-hidden relative">
          <ContactsPanel
            isMobileChatOpen={isMobileChatOpen}
            isCompactMode={isCompactMode}
            isLoading={isLoading}
            filteredContacts={filteredContacts}
            unreadTotal={unreadTotal}
            searchQuery={searchQuery}
            roleFilter={roleFilter}
            showUnreadOnly={showUnreadOnly}
            selectedContactId={selectedContactId}
            onToggleCompactMode={() => setIsCompactMode((prev) => !prev)}
            onSearchChange={setSearchQuery}
            onRoleFilterChange={setRoleFilter}
            onToggleUnreadOnly={() => setShowUnreadOnly((prev) => !prev)}
            onSelectContact={handleSelectContact}
          />
          <div className={cn(
            'flex-1 flex flex-col overflow-hidden bg-slate-50 transition-transform duration-300 md:translate-x-0 pb-20 md:pb-0',
            isMobileChatOpen ? 'translate-x-0 relative' : 'translate-x-full absolute md:relative w-full h-full'
          )}>
            {selectedContact ? (
              <>
                <ChatHeader
                  selectedContact={selectedContact}
                  onBack={() => setIsMobileChatOpen(false)}
                  onOpenStudentProfile={(studentId) => navigate(`/teacher/students/${studentId}`)}
                />
                <MessagesList
                  messagesRef={messagesRef}
                  visibleMessages={visibleMessages}
                  selectedContact={selectedContact}
                  teacherAvatar={teacherAvatar}
                  teacherName={teacherName}
                  openedActionMessageId={openedActionMessageId}
                  confirmDeleteMessageId={confirmDeleteMessageId}
                  isSending={isSending}
                  onToggleActions={handleToggleActions}
                  onReplyMessage={handleReplyMessage}
                  onEditMessage={handleEditMessage}
                  onHideMessage={handleHideMessage}
                  onPromptDelete={promptDeleteMessage}
                  onCancelDelete={() => setConfirmDeleteMessageId(null)}
                  onConfirmDelete={(message) => void handleDeleteMessage(message)}
                />
                <MessageComposer
                  messageDraft={messageDraft}
                  replyTarget={replyTarget}
                  editingTarget={editingTarget}
                  selectedContact={selectedContact}
                  typingByContactId={typingByContactId}
                  isSending={isSending}
                  error={error}
                  onDraftChange={handleDraftChange}
                  onStopTyping={stopTyping}
                  onCancelReply={() => setReplyToMessageId(null)}
                  onCancelEdit={handleCancelEdit}
                  onSendMessage={handleSendMessage}
                />
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="size-20 bg-slate-100 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Select a contact</h3>
                <p className="text-slate-500 font-bold max-w-xs mx-auto mt-2">
                  Choose a contact to view and send messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
