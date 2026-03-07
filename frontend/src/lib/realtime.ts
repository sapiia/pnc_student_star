import { io, type Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

let socket: Socket | null = null;

export type FeedbackRealtimePayload = {
  action?: string;
  feedbackId?: number | null;
  studentId?: number | null;
  teacherId?: number | null;
};

export type NotificationRealtimePayload = {
  action?: string;
  notificationId?: number | null;
  userId?: number | null;
};

export type TypingRealtimePayload = {
  fromId?: number | null;
  toId?: number | null;
  isTyping?: boolean;
};

export const getRealtimeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_BASE_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }

  return socket;
};
