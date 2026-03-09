import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Clock,
  MessageSquare,
  Search,
  Send,
  Settings,
  ArrowLeft,
  ChevronRight,
  User,
  X,
} from 'lucide-react';

import Sidebar from '../components/layout/sidebar/Sidebar';
import StudentMobileNav from '../components/StudentMobileNav';

import { cn } from '../lib/utils';
import { getRealtimeSocket, type NotificationRealtimePayload, type TypingRealtimePayload } from '../lib/realtime';

type ApiUser = {
  id: number;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  role?: string | null;
  profile_image?: string | null;
};

type NotificationRecord = {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at?: string;
};

type DirectMessage = {
  fromId: number;
  toId: number;
  senderName: string;
  text: string;
};

type Contact = {
  id: number;
  name: string;
  role: string;
  type: 'Teacher' | 'Student';
  avatar: string;
  lastMessage: string;
  timestamp?: string;
  unreadCount: number;
  activityCount: number;
};

type ChatMessage = {
  id: number;
  isMe: boolean;
  fromId: number;
  toId: number;
  senderName: string;
  text: string;
  createdAt?: string;
  notificationId?: number;
  isRead?: boolean;
  rawIsRead: number;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const toDisplayName = (user: ApiUser) => {
  const fallback = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return String(user.name || '').trim() || fallback || String(user.email || `User ${user.id}`).trim();
};

const toRoleLabel = (role: string) => {
  const normalized = String(role || '').trim().toLowerCase();
  if (normalized === 'teacher') return 'Teacher';
  return 'Student';
};

const toContactType = (role: string): Contact['type'] => {
  const normalized = String(role || '').trim().toLowerCase();
  if (normalized === 'teacher') return 'Teacher';
  return 'Student';
};

const formatDateTime = (value?: string) => {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const parseDirectMessage = (raw: string): DirectMessage | null => {
  const text = String(raw || '').trim();
  const match = text.match(/^\[DirectMessage\]\s+from=(\d+);\s*to=(\d+);\s*sender_name=(.*?);\s*text=(.*)$/);
  if (!match) return null;

  return {
    fromId: Number(match[1]),
    toId: Number(match[2]),
    senderName: String(match[3] || 'User').trim() || 'User',
    text: String(match[4] || '').trim(),
  };
};

const composeDirectMessage = (payload: DirectMessage) => (
  `[DirectMessage] from=${payload.fromId}; to=${payload.toId}; sender_name=${payload.senderName}; text=${payload.text}`
);

export default function MeetingPage() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState('Student');
  const [studentAvatar, setStudentAvatar] = useState('https://picsum.photos/seed/student-self/100/100');
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingByContactId, setTypingByContactId] = useState<Record<number, boolean>>({});
  const [openedActionMessageId, setOpenedActionMessageId] = useState<number | null>(null);
  const [confirmDeleteMessageId, setConfirmDeleteMessageId] = useState<number | null>(null);
  const [replyToMessageId, setReplyToMessageId] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [hiddenMessageIds, setHiddenMessageIds] = useState<number[]>([]);
  const [isMobileContactListOpen, setIsMobileContactListOpen] = useState(true);
  const typingStopTimerRef = useRef<number | null>(null);
  const hasSentTypingRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return;
      const authUser = JSON.parse(raw);
      const resolvedStudentId = Number(authUser?.id);
      if (Number.isInteger(resolvedStudentId) && resolvedStudentId > 0) {
        setStudentId(resolvedStudentId);
      }
      const resolvedStudentName =
        String(authUser?.name || '').trim() ||
        [authUser?.first_name, authUser?.last_name].filter(Boolean).join(' ').trim();
      if (resolvedStudentName) {
        setStudentName(resolvedStudentName);
      }
      const resolvedPhoto = String(authUser?.profile_image || '').trim();
      if (resolvedPhoto) {
        setStudentAvatar(resolvedPhoto);
      } else if (Number.isInteger(resolvedStudentId) && resolvedStudentId > 0) {
        const savedPhoto = localStorage.getItem(`profile_photo_${resolvedStudentId}`);
        if (savedPhoto) {
          setStudentAvatar(savedPhoto);
        } else {
          setStudentAvatar(`https://picsum.photos/seed/student-${resolvedStudentId}/100/100`);
        }
      }
    } catch {
      setStudentId(null);
      setStudentName('Student');
    }
  }, []);

  useEffect(() => {
    if (!studentId) return;
    try {
      const stored = localStorage.getItem(`student_hidden_direct_messages_${studentId}`);
      const parsed = stored ? JSON.parse(stored) : [];
      setHiddenMessageIds(Array.isArray(parsed) ? parsed.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0) : []);
    } catch {
      setHiddenMessageIds([]);
    }
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;
    localStorage.setItem(`student_hidden_direct_messages_${studentId}`, JSON.stringify(hiddenMessageIds));
  }, [hiddenMessageIds, studentId]);

  const loadData = useCallback(async () => {
    if (!studentId) {
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
  }, [studentId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!studentId) return;

    const socket = getRealtimeSocket();
    const subscription = { userId: studentId };
    const handleNotificationEvent = (payload: NotificationRealtimePayload = {}) => {
      if (Number(payload.userId) !== studentId) return;
      void loadData();
    };
    const handleTypingEvent = (payload: TypingRealtimePayload = {}) => {
      const fromId = Number(payload.fromId);
      const toId = Number(payload.toId);
      if (!fromId || toId !== studentId) return;
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
  }, [loadData, studentId]);

  useEffect(() => {
    setTypingByContactId({});
    setOpenedActionMessageId(null);
    setConfirmDeleteMessageId(null);
    setReplyToMessageId(null);
    setEditingMessageId(null);
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
    if (!studentId) return [];

    const eligibleUsers = users
      .filter((user) => Number(user.id) !== studentId)
      .filter((user) => {
        const normalizedRole = String(user.role || '').trim().toLowerCase();
        return normalizedRole === 'teacher' || normalizedRole === 'student';
      });

    return eligibleUsers.map((user) => {
      const contactId = Number(user.id);
      const contactMessages = directNotifications
        .filter(({ parsed }) => (
          parsed && (
            (parsed.fromId === studentId && parsed.toId === contactId) ||
            (parsed.fromId === contactId && parsed.toId === studentId)
          )
        ))
        .sort((left, right) => (
          new Date(String(right.notification.created_at || '')).getTime() -
          new Date(String(left.notification.created_at || '')).getTime()
        ));

      const lastMessage = contactMessages[0]?.parsed?.text || '';
      const activityCount = contactMessages.length;
      const unreadCount = contactMessages.filter(({ parsed, notification }) => (
        parsed && parsed.fromId === contactId && parsed.toId === studentId && Number(notification.is_read) !== 1
      )).length;

      return {
        id: contactId,
        name: toDisplayName(user),
        role: toRoleLabel(String(user.role || '')),
        type: toContactType(String(user.role || '')),
        avatar: String(user.profile_image || '').trim() || `https://picsum.photos/seed/user-${contactId}/100/100`,
        lastMessage,
        timestamp: contactMessages[0]?.notification?.created_at,
        unreadCount,
        activityCount,
      };
    }).sort((left, right) => (
      right.activityCount - left.activityCount ||
      new Date(String(right.timestamp || '')).getTime() - new Date(String(left.timestamp || '')).getTime()
    ));
  }, [directNotifications, studentId, users]);

  const filteredContacts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return contacts;

    return contacts.filter((contact) => (
      contact.name.toLowerCase().includes(normalizedQuery) ||
      contact.role.toLowerCase().includes(normalizedQuery) ||
      contact.lastMessage.toLowerCase().includes(normalizedQuery)
    ));
  }, [contacts, searchQuery]);

  useEffect(() => {
    if (filteredContacts.length === 0) {
      setSelectedContactId(null);
      return;
    }

    const exists = filteredContacts.some((contact) => contact.id === selectedContactId);
    if (!exists) {
      setSelectedContactId(filteredContacts[0].id);
    }
  }, [filteredContacts, selectedContactId]);

  const selectedContact = filteredContacts.find((contact) => contact.id === selectedContactId) || null;

  const handleContactSelect = (contactId: number) => {
    setSelectedContactId(contactId);
    setIsMobileContactListOpen(false);
  };

  const currentMessages = useMemo<ChatMessage[]>(() => {
    if (!studentId || !selectedContactId) return [];

    return directNotifications
      .filter(({ parsed }) => (
        parsed && (
          (parsed.fromId === studentId && parsed.toId === selectedContactId) ||
          (parsed.fromId === selectedContactId && parsed.toId === studentId)
        )
      ))
      .sort((left, right) => (
        new Date(String(left.notification.created_at || '')).getTime() -
        new Date(String(right.notification.created_at || '')).getTime()
      ))
      .map(({ notification, parsed }) => ({
        id: Number(notification.id),
        isMe: Number(parsed?.fromId) === studentId,
        fromId: Number(parsed?.fromId || 0),
        toId: Number(parsed?.toId || 0),
        senderName: String(parsed?.senderName || ''),
        text: String(parsed?.text || ''),
        createdAt: notification.created_at,
        notificationId: Number(notification.id),
        isRead: Number(notification.is_read) === 1,
        rawIsRead: Number(notification.is_read) === 1 ? 1 : 0,
      }));
  }, [directNotifications, selectedContactId, studentId]);

  const visibleMessages = useMemo(() => (
    currentMessages.filter((message) => !hiddenMessageIds.includes(message.id))
  ), [currentMessages, hiddenMessageIds]);

  const replyToMessage = useMemo(() => (
    currentMessages.find((message) => message.id === replyToMessageId) || null
  ), [currentMessages, replyToMessageId]);

  const editingMessage = useMemo(() => (
    currentMessages.find((message) => message.id === editingMessageId) || null
  ), [currentMessages, editingMessageId]);

  useEffect(() => {
    if (!studentId || !selectedContactId) return;

    const unreadIncoming = currentMessages.filter((message) => !message.isMe && !message.isRead && message.notificationId);
    if (unreadIncoming.length === 0) return;

    const markRead = async () => {
      await Promise.all(
        unreadIncoming.map((message) => fetch(`${API_BASE_URL}/notifications/${message.notificationId}/read`, {
          method: 'PUT',
        }).catch(() => null))
      );
      void loadData();
      window.dispatchEvent(new CustomEvent('student-notifications-updated'));
    };

    void markRead();
  }, [currentMessages, loadData, selectedContactId, studentId]);

  const unreadTotal = useMemo(() => (
    contacts.reduce((sum, contact) => sum + contact.unreadCount, 0)
  ), [contacts]);

  const emitTyping = useCallback((isTyping: boolean) => {
    if (!studentId || !selectedContactId) return;
    const socket = getRealtimeSocket();
    socket.emit('message:typing', {
      fromId: studentId,
      toId: selectedContactId,
      isTyping,
    });
  }, [selectedContactId, studentId]);

  const handleDraftChange = (nextValue: string) => {
    setMessageDraft(nextValue);
    if (!studentId || !selectedContactId) return;

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
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${message.notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete message.');
      
      setConfirmDeleteMessageId(null);
      void loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!studentId || !selectedContactId || !selectedContact) return;
    const text = messageDraft.trim();
    if (!text) return;

    setIsSending(true);
    try {
      if (editingMessage?.notificationId && editingMessage.isMe) {
        const updatedMessage = composeDirectMessage({
          fromId: studentId,
          toId: selectedContactId,
          senderName: studentName,
          text,
        });
        const res = await fetch(`${API_BASE_URL}/notifications/${editingMessage.notificationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: updatedMessage, is_read: editingMessage.rawIsRead }),
        });
        if (!res.ok) throw new Error('Failed to update');
        setEditingMessageId(null);
      } else {
        const outgoingText = replyToMessage ? `Reply to "${replyToMessage.text.slice(0, 100)}": ${text}` : text;
        const res = await fetch(`${API_BASE_URL}/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: selectedContactId,
            is_read: 0,
            message: composeDirectMessage({ fromId: studentId, toId: selectedContactId, senderName: studentName, text: outgoingText }),
          }),
        });
        if (!res.ok) throw new Error('Failed to send');
        setReplyToMessageId(null);
      }
      setMessageDraft('');
      stopTyping();
      void loadData();
      window.dispatchEvent(new CustomEvent('student-notifications-updated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden pb-24 md:pb-0">
        <StudentMobileNav />
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3 md:gap-4">
            {!isMobileContactListOpen && (
              <button
                onClick={() => setIsMobileContactListOpen(true)}
                className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-slate-900 text-sm md:text-lg font-black uppercase tracking-widest">Messages</h2>
            {unreadTotal > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full">
                <span className="size-2 bg-primary rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">{unreadTotal} New</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/notifications')} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl relative">
              <Bell className="w-5 h-5" />
              {unreadTotal > 0 && <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full ring-2 ring-white" />}
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          {/* Contacts Sidebar */}
          <div className={cn(
            "absolute inset-0 z-20 md:relative md:inset-auto md:z-0 w-full md:w-[320px] lg:w-[380px] border-r border-slate-200 bg-white flex flex-col shrink-0 transition-transform duration-300 md:translate-x-0 outline-none",
            isMobileContactListOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}>
            <div className="p-4 md:p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="size-12 bg-slate-100 rounded-2xl" />
                      <div className="flex-1 space-y-2 py-1"><div className="h-3 bg-slate-100 rounded w-1/3" /><div className="h-2 bg-slate-100 rounded w-2/3" /></div>
                    </div>
                  ))}
                </div>
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleContactSelect(contact.id)}
                    className={cn(
                      'w-full p-4 text-left rounded-2xl flex items-center gap-4 transition-all mb-1',
                      selectedContactId === contact.id ? 'bg-primary/5 text-primary' : 'hover:bg-slate-50 text-slate-600'
                    )}
                  >
                    <div className="size-12 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-100 bg-slate-100">
                      <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="text-sm font-black truncate">{contact.name}</h4>
                        {contact.timestamp && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap ml-2">
                            {formatDateTime(contact.timestamp)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium truncate opacity-70 mb-1">{contact.lastMessage || 'No messages'}</p>
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                          contact.type === 'Teacher' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                        )}>
                          {contact.role}
                        </span>
                        {contact.unreadCount > 0 && (
                          <span className="bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-primary/20">
                            {contact.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="md:hidden w-4 h-4 text-slate-300" />
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <User className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest">No contacts</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={cn(
            "flex-1 flex flex-col overflow-hidden bg-slate-50 transition-transform duration-300",
            !isMobileContactListOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          )}>
            {selectedContact ? (
              <>
                <div className="px-4 md:px-8 py-3 md:py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="size-10 md:size-12 rounded-xl md:rounded-2xl overflow-hidden shrink-0 shadow-sm bg-slate-100 border border-slate-200">
                      <img src={selectedContact.avatar} alt={selectedContact.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-lg font-black text-slate-900 leading-tight">{selectedContact.name}</h3>
                      <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400">{selectedContact.role}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
                  {visibleMessages.length > 0 ? (
                    visibleMessages.map((msg) => (
                      <div key={msg.id} className={cn('flex gap-3 md:gap-4 max-w-[85%] md:max-w-2xl', msg.isMe ? 'ml-auto flex-row-reverse' : '')}>
                        <div className="shrink-0 mt-1">
                          <div className="size-8 md:size-10 rounded-xl overflow-hidden shadow-sm bg-slate-100 border border-slate-200">
                            <img src={msg.isMe ? studentAvatar : selectedContact.avatar} alt="User" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className={cn('space-y-2', msg.isMe ? 'text-right' : 'text-left')}>
                          <div
                            onClick={() => setOpenedActionMessageId(openedActionMessageId === msg.id ? null : msg.id)}
                            className={cn(
                              'p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border cursor-pointer inline-block text-sm md:text-base font-medium transition-all active:scale-[0.98]',
                              msg.isMe ? 'bg-primary text-white border-primary rounded-tr-none' : 'bg-white text-slate-700 border-slate-200 rounded-tl-none hover:border-primary/20'
                            )}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                          
                          {openedActionMessageId === msg.id && (
                            <div className={cn('flex flex-wrap items-center gap-2 pt-1', msg.isMe ? 'justify-end' : 'justify-start')}>
                              <button onClick={() => handleReplyMessage(msg)} className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-200 text-slate-700 hover:bg-slate-300">Reply</button>
                              {msg.isMe && <button onClick={() => handleEditMessage(msg)} className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-200 text-slate-700 hover:bg-slate-300">Edit</button>}
                              <button onClick={() => handleHideMessage(msg.id)} className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-200 text-slate-700 hover:bg-slate-300">Hide</button>
                              <button onClick={() => promptDeleteMessage(msg.id)} className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-rose-500 text-white hover:bg-rose-600">Delete</button>
                            </div>
                          )}

                          {confirmDeleteMessageId === msg.id && (
                            <div className="mt-2 p-3 rounded-xl border border-rose-100 bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-700 space-y-2">
                              <p>Delete this message?</p>
                              <div className="flex gap-2">
                                <button onClick={() => setConfirmDeleteMessageId(null)} className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-600">No</button>
                                <button onClick={() => void handleDeleteMessage(msg)} className="px-2 py-1 bg-rose-600 text-white rounded">Yes, Delete</button>
                              </div>
                            </div>
                          )}

                          <div className={cn('flex items-center gap-2 text-[10px] font-bold text-slate-400', msg.isMe ? 'justify-end' : '')}>
                            {msg.isMe && <CheckCheck className="w-3 h-3 text-primary" />}
                            <Clock className="w-3 h-3" />
                            <span>{formatDateTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                      <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
                      <h3 className="text-xl font-black text-slate-900">Say Hello!</h3>
                      <p className="text-slate-500 font-bold max-w-xs mt-2">Start a conversation with {selectedContact.name} below.</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 md:p-8 bg-white border-t border-slate-200">
                  {replyToMessage && (
                    <div className="mb-3 p-3 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-widest text-primary">Replying to</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{replyToMessage.text}</p>
                      </div>
                      <button onClick={() => setReplyToMessageId(null)} className="p-1 px-2 text-slate-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                  {editingMessage && (
                    <div className="mb-3 p-3 rounded-2xl border border-amber-200 bg-amber-50 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-widest text-amber-700">Editing Message</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{editingMessage.text}</p>
                      </div>
                      <button onClick={() => { setEditingMessageId(null); setMessageDraft(''); }} className="p-1 px-2 text-slate-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                  
                  <div className="relative flex items-end gap-2">
                    <textarea
                      value={messageDraft}
                      onChange={(e) => handleDraftChange(e.target.value)}
                      onBlur={stopTyping}
                      placeholder={editingMessage ? 'Update message...' : `Message ${selectedContact.name.split(' ')[0]}...`}
                      className="flex-1 pl-4 md:pl-6 pr-12 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-3xl text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all resize-none font-medium min-h-[48px] max-h-[120px]"
                      rows={1}
                    />
                    <button
                      onClick={() => void handleSendMessage()}
                      disabled={isSending || !messageDraft.trim()}
                      className="absolute right-2 bottom-1.5 md:bottom-2 size-8 md:size-10 bg-primary text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-40 disabled:scale-95"
                    >
                      <Send className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                  {typingByContactId[selectedContact.id] && (
                    <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">{selectedContact.name} is typing...</p>
                  )}
                  {error && <p className="mt-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">{error}</p>}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50">
                <div className="size-20 bg-white shadow-xl shadow-slate-200/50 text-slate-200 rounded-[2.5rem] flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Select Conversation</h3>
                <p className="text-slate-500 font-bold max-w-xs mt-2">Pick a contact from the list to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


