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
} from 'lucide-react';
import TeacherSidebar from '../components/TeacherSidebar';
import TeacherMobileNav from '../components/TeacherMobileNav';
import { cn } from '../lib/utils';
import { getRealtimeSocket, type NotificationRealtimePayload, type TypingRealtimePayload } from '../lib/realtime';
import { ChevronLeft } from 'lucide-react';

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
  type: 'Admin' | 'Teacher' | 'Student';
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
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const resolveAvatarUrl = (value: string | null | undefined, fallback: string) => {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw;
  }
  const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`;
  return `${API_ORIGIN}${normalizedPath}`;
};

const toDisplayName = (user: ApiUser) => {
  const fallback = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return String(user.name || '').trim() || fallback || String(user.email || `User ${user.id}`).trim();
};

const toRoleLabel = (role: string) => {
  const normalized = String(role || '').trim().toLowerCase();
  if (normalized === 'admin') return 'Admin Support';
  if (normalized === 'teacher') return 'Teacher';
  return 'Student';
};

const toContactType = (role: string): Contact['type'] => {
  const normalized = String(role || '').trim().toLowerCase();
  if (normalized === 'admin') return 'Admin';
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

export default function TeacherMessagesPage() {
  const navigate = useNavigate();
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [teacherName, setTeacherName] = useState('Teacher');
  const [teacherAvatar, setTeacherAvatar] = useState('https://picsum.photos/seed/teacher-self/100/100');
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
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
  const typingStopTimerRef = useRef<number | null>(null);
  const hasSentTypingRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return;
      const authUser = JSON.parse(raw);
      const resolvedTeacherId = Number(authUser?.id);
      if (Number.isInteger(resolvedTeacherId) && resolvedTeacherId > 0) {
        setTeacherId(resolvedTeacherId);
      }
      const resolvedTeacherName =
        String(authUser?.name || '').trim() ||
        [authUser?.first_name, authUser?.last_name].filter(Boolean).join(' ').trim();
      if (resolvedTeacherName) {
        setTeacherName(resolvedTeacherName);
      }
      const resolvedPhoto = String(authUser?.profile_image || '').trim();
      if (resolvedPhoto) {
        setTeacherAvatar(resolveAvatarUrl(resolvedPhoto, `https://picsum.photos/seed/teacher-${resolvedTeacherId || 'self'}/100/100`));
      } else if (Number.isInteger(resolvedTeacherId) && resolvedTeacherId > 0) {
        const savedPhoto = localStorage.getItem(`profile_photo_${resolvedTeacherId}`);
        if (savedPhoto) {
          setTeacherAvatar(resolveAvatarUrl(savedPhoto, `https://picsum.photos/seed/teacher-${resolvedTeacherId}/100/100`));
        } else {
          setTeacherAvatar(`https://picsum.photos/seed/teacher-${resolvedTeacherId}/100/100`);
        }
      }
    } catch {
      setTeacherId(null);
      setTeacherName('Teacher');
    }
  }, []);

  useEffect(() => {
    if (!teacherId) return;
    try {
      const stored = localStorage.getItem(`teacher_hidden_direct_messages_${teacherId}`);
      const parsed = stored ? JSON.parse(stored) : [];
      setHiddenMessageIds(Array.isArray(parsed) ? parsed.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0) : []);
    } catch {
      setHiddenMessageIds([]);
    }
  }, [teacherId]);

  useEffect(() => {
    if (!teacherId) return;
    localStorage.setItem(`teacher_hidden_direct_messages_${teacherId}`, JSON.stringify(hiddenMessageIds));
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
        role: toRoleLabel(String(user.role || '')),
        type: toContactType(String(user.role || '')),
        avatar: resolveAvatarUrl(
          String(user.profile_image || '').trim(),
          `https://picsum.photos/seed/user-${contactId}/100/100`,
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

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TeacherMobileNav />
        <header className="h-auto min-h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-2 md:py-0 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
            <h2 className="text-slate-900 text-sm md:text-lg font-bold leading-tight tracking-tight truncate">Messages</h2>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full shrink-0">
              <span className="size-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">{unreadTotal} New</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-2">
            <button
              onClick={() => navigate('/teacher/notifications')}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative shrink-0"
            >
              <Bell className="w-5 h-5" />
              {unreadTotal > 0 ? <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" /> : null}
            </button>
            <button className="hidden sm:block p-2 text-slate-500 hover:bg-slate-100 rounded-full shrink-0">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <div className={cn(
            "w-full md:w-[350px] border-r border-slate-200 bg-white flex flex-col shrink-0 transition-transform duration-300 md:translate-x-0 pb-20 md:pb-0",
            isMobileChatOpen ? "-translate-x-full absolute md:relative w-full h-full" : "translate-x-0 relative"
          )}>
            <div className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="px-6 py-8 text-sm font-medium text-slate-500">Loading contacts...</div>
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setSelectedContactId(contact.id);
                      setIsMobileChatOpen(true);
                    }}
                    className={cn(
                      'w-full p-6 text-left border-b border-slate-50 transition-all relative group',
                      selectedContactId === contact.id ? 'bg-primary/5' : 'hover:bg-slate-50'
                    )}
                  >
                    {selectedContactId === contact.id ? (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    ) : null}
                    <div className="flex gap-4">
                      <div className="size-12 rounded-xl overflow-hidden shrink-0 shadow-sm bg-slate-200">
                        <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-black text-slate-900 truncate">{contact.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">{formatDateTime(contact.timestamp)}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate font-medium">{contact.lastMessage || 'No messages yet'}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{contact.role}</p>
                          {contact.unreadCount > 0 ? (
                            <span className="bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{contact.unreadCount}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-6 py-8 text-sm font-medium text-slate-500">No contacts found.</div>
              )}
            </div>
          </div>

          <div className={cn(
            "flex-1 flex flex-col overflow-hidden bg-slate-50 transition-transform duration-300 md:translate-x-0 pb-20 md:pb-0",
            isMobileChatOpen ? "translate-x-0 relative" : "translate-x-full absolute md:relative w-full h-full"
          )}>
            {selectedContact ? (
              <>
                <div className="p-4 md:p-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                    <button 
                      onClick={() => setIsMobileChatOpen(false)}
                      className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="size-10 md:size-12 rounded-2xl overflow-hidden shrink-0 shadow-sm bg-slate-200">
                      <img src={selectedContact.avatar} alt={selectedContact.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm md:text-lg font-black text-slate-900 truncate">{selectedContact.name}</h3>
                      <p className="text-[10px] md:text-xs font-bold text-slate-500">{selectedContact.role}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                  {visibleMessages.length > 0 ? (
                    visibleMessages.map((msg) => (
                      <div key={msg.id} className={cn('flex gap-4 max-w-2xl', msg.isMe ? 'ml-auto flex-row-reverse' : '')}>
                        <div className="size-10 rounded-xl overflow-hidden shrink-0 shadow-sm bg-slate-200">
                          <img
                            src={msg.isMe ? teacherAvatar : selectedContact.avatar}
                            alt={msg.isMe ? teacherName : selectedContact.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className={cn('space-y-2', msg.isMe ? 'text-right' : '')}>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setOpenedActionMessageId((current) => (current === msg.id ? null : msg.id))}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                setOpenedActionMessageId((current) => (current === msg.id ? null : msg.id));
                              }
                            }}
                            className={cn(
                            'p-5 rounded-2xl shadow-sm border cursor-pointer',
                            msg.isMe
                              ? 'bg-primary text-white border-primary rounded-tr-none'
                              : 'bg-white text-slate-700 border-slate-200 rounded-tl-none'
                          )}>
                            <p className="leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                          </div>
                          {openedActionMessageId === msg.id ? (
                            <div className={cn('flex items-center gap-2', msg.isMe ? 'justify-end' : '')}>
                              <button
                                type="button"
                                onClick={() => handleReplyMessage(msg)}
                                className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200"
                              >
                                Reply
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditMessage(msg)}
                                disabled={!msg.isMe}
                                className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleHideMessage(msg.id)}
                                className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200"
                              >
                                Hide
                              </button>
                              <button
                                type="button"
                                onClick={() => promptDeleteMessage(msg.id)}
                                className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 hover:bg-rose-100"
                              >
                                Delete
                              </button>
                            </div>
                          ) : null}
                          {confirmDeleteMessageId === msg.id ? (
                            <div className={cn('rounded-lg border border-rose-100 bg-rose-50 px-3 py-2', msg.isMe ? 'text-right' : '')}>
                              <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">Delete this message?</p>
                              <div className={cn('mt-2 flex gap-2', msg.isMe ? 'justify-end' : '')}>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteMessageId(null)}
                                  className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteMessage(msg)}
                                  disabled={isSending}
                                  className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                                >
                                  {isSending ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            </div>
                          ) : null}
                          <div className={cn('flex items-center gap-2 text-[10px] font-bold text-slate-400', msg.isMe ? 'justify-end' : '')}>
                            {msg.isMe ? <CheckCheck className="w-3 h-3 text-primary" /> : null}
                            <Clock className="w-3 h-3" />
                            <span>{formatDateTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="size-20 bg-slate-100 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
                        <MessageSquare className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">No messages yet</h3>
                      <p className="text-slate-500 font-bold max-w-xs mx-auto mt-2">
                        Start a conversation with {selectedContact.name} by typing a message below.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-8 bg-white border-t border-slate-200">
                  {replyTarget ? (
                    <div className="mb-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">Replying</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{replyTarget.text}</p>
                      <button
                        type="button"
                        onClick={() => setReplyToMessageId(null)}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : null}
                  {editingTarget ? (
                    <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Editing Message</p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMessageId(null);
                          setMessageDraft('');
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700"
                      >
                        Cancel Edit
                      </button>
                    </div>
                  ) : null}
                  <div className="relative">
                    <textarea
                      value={messageDraft}
                      onChange={(e) => handleDraftChange(e.target.value)}
                      onBlur={stopTyping}
                      placeholder={editingTarget ? 'Edit your message...' : `Type your message to ${selectedContact.name}...`}
                      className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                      rows={2}
                    />
                    {typingByContactId[selectedContact.id] ? (
                      <p className="mt-2 text-[11px] font-bold text-slate-500">{selectedContact.name} is typing...</p>
                    ) : null}
                    <button
                      onClick={handleSendMessage}
                      disabled={isSending || !messageDraft.trim()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 size-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60"
                      title={editingTarget ? 'Save edit' : 'Send message'}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  {error ? <p className="mt-3 text-xs font-bold text-rose-600">{error}</p> : null}
                </div>
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

