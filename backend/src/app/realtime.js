const { Server } = require('socket.io');

let io = null;

const toPositiveInt = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const getFeedbackRoomNames = ({ studentId, teacherId }) => {
  const rooms = [];
  const normalizedStudentId = toPositiveInt(studentId);
  const normalizedTeacherId = toPositiveInt(teacherId);

  if (normalizedStudentId) {
    rooms.push(`student:${normalizedStudentId}`);
  }
  if (normalizedTeacherId) {
    rooms.push(`teacher:${normalizedTeacherId}`);
  }

  return rooms;
};

const getUserRoomName = (userId) => {
  const normalizedUserId = toPositiveInt(userId);
  return normalizedUserId ? `user:${normalizedUserId}` : null;
};

const getRoleRoomName = (role) => {
  const normalized = String(role || '').trim().toLowerCase();
  return normalized ? `role:${normalized}` : null;
};

const getRoleUserRoomName = (role, userId) => {
  const roleRoom = getRoleRoomName(role);
  const normalizedUserId = toPositiveInt(userId);
  return roleRoom && normalizedUserId ? `${roleRoom}:user:${normalizedUserId}` : null;
};

const initRealtime = (server) => {
  io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('feedback:subscribe', (payload = {}) => {
      const rooms = getFeedbackRoomNames({
        studentId: payload.studentId,
        teacherId: payload.teacherId,
      });

      rooms.forEach((room) => socket.join(room));
    });

    socket.on('feedback:unsubscribe', (payload = {}) => {
      const rooms = getFeedbackRoomNames({
        studentId: payload.studentId,
        teacherId: payload.teacherId,
      });

      rooms.forEach((room) => socket.leave(room));
    });

    socket.on('notification:subscribe', (payload = {}) => {
      const room = getUserRoomName(payload.userId);
      if (room) socket.join(room);

       // Optional role-scoped rooms
      const roleRoom = getRoleRoomName(payload.role);
      if (roleRoom) socket.join(roleRoom);

      const roleUserRoom = getRoleUserRoomName(payload.role, payload.userId);
      if (roleUserRoom) socket.join(roleUserRoom);
    });

    socket.on('notification:unsubscribe', (payload = {}) => {
      const room = getUserRoomName(payload.userId);
      if (room) socket.leave(room);

      const roleRoom = getRoleRoomName(payload.role);
      if (roleRoom) socket.leave(roleRoom);

      const roleUserRoom = getRoleUserRoomName(payload.role, payload.userId);
      if (roleUserRoom) socket.leave(roleUserRoom);
    });

    socket.on('message:typing', (payload = {}) => {
      const fromId = toPositiveInt(payload.fromId);
      const toId = toPositiveInt(payload.toId);
      if (!fromId || !toId) return;

      const toRoom = getUserRoomName(toId);
      if (!toRoom) return;

      io.to(toRoom).emit('message:typing', {
        fromId,
        toId,
        isTyping: Boolean(payload.isTyping),
      });
    });
  });

  return io;
};

const emitFeedbackEvent = ({ action, feedback }) => {
  if (!io || !feedback) return;

  const normalizedAction = String(action || 'changed').trim().toLowerCase();
  const payload = {
    action: normalizedAction,
    feedback,
    feedbackId: Number(feedback.id) || null,
    studentId: toPositiveInt(feedback.student_id),
    teacherId: toPositiveInt(feedback.teacher_id),
  };

  const rooms = getFeedbackRoomNames({
    studentId: payload.studentId,
    teacherId: payload.teacherId,
  });

  if (rooms.length === 0) {
    io.emit('feedback:changed', payload);
    io.emit(`feedback:${normalizedAction}`, payload);
    return;
  }

  rooms.forEach((room) => {
    io.to(room).emit('feedback:changed', payload);
    io.to(room).emit(`feedback:${normalizedAction}`, payload);
  });
};

const emitNotificationEvent = ({ action, notification }) => {
  if (!io || !notification) return;

  const normalizedAction = String(action || 'changed').trim().toLowerCase();
  const payload = {
    action: normalizedAction,
    notification,
    notificationId: Number(notification.id) || null,
    userId: toPositiveInt(notification.user_id),
    role: notification.user_role || null,
  };
  const room = getUserRoomName(payload.userId);
  const roleRoom = getRoleRoomName(payload.role);
  const roleUserRoom = getRoleUserRoomName(payload.role, payload.userId);

  if (!room && !roleRoom && !roleUserRoom) {
    io.emit('notification:changed', payload);
    io.emit(`notification:${normalizedAction}`, payload);
    return;
  }

  if (room) {
    io.to(room).emit('notification:changed', payload);
    io.to(room).emit(`notification:${normalizedAction}`, payload);
  }

  if (roleRoom) {
    io.to(roleRoom).emit('notification:changed', payload);
    io.to(roleRoom).emit(`notification:${normalizedAction}`, payload);
  }

  if (roleUserRoom) {
    io.to(roleUserRoom).emit('notification:changed', payload);
    io.to(roleUserRoom).emit(`notification:${normalizedAction}`, payload);
  }
};

module.exports = {
  initRealtime,
  emitFeedbackEvent,
  emitNotificationEvent,
};
