const Notification = require('./notification.model');
const { emitNotificationEvent } = require('../../app/realtime');

const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll();
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getNotificationsByUserId = async (req, res) => {
  try {
    const notifications = await Notification.findByUserId(req.params.userId);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getUnreadNotificationsByUserId = async (req, res) => {
  try {
    const notifications = await Notification.findUnreadByUserId(req.params.userId);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getStudentTeacherReplyThread = async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const teacherId = Number(req.params.teacherId);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      return res.status(400).json({ error: 'A valid studentId is required.' });
    }
    if (!Number.isInteger(teacherId) || teacherId <= 0) {
      return res.status(400).json({ error: 'A valid teacherId is required.' });
    }

    const thread = await Notification.findStudentReplyThread(studentId, teacherId);
    res.json(thread);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const notificationId = await Notification.create(req.body);
    const notification = await Notification.findById(notificationId);
    emitNotificationEvent({
      action: 'created',
      notification: notification || {
        id: notificationId,
        ...req.body,
      },
    });

    res.status(201).json({ 
      message: "Notification created successfully", 
      notificationId,
      notification: notification || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const updateNotification = async (req, res) => {
  try {
    const notificationId = Number(req.params.id);
    const updated = await Notification.update(notificationId, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const notification = await Notification.findById(notificationId);
    emitNotificationEvent({
      action: 'updated',
      notification: notification || {
        id: notificationId,
        ...req.body,
      },
    });

    res.json({ message: "Notification updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = Number(req.params.id);
    const updated = await Notification.markAsRead(notificationId);
    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const notification = await Notification.findById(notificationId);
    emitNotificationEvent({
      action: 'updated',
      notification: notification || {
        id: notificationId,
        is_read: 1,
      },
    });

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const updatedCount = await Notification.markAllAsRead(req.params.userId);
    res.json({ 
      message: "All notifications marked as read", 
      updatedCount 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notificationId = Number(req.params.id);
    const existingNotification = await Notification.findById(notificationId);
    const deleted = await Notification.delete(notificationId);
    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    emitNotificationEvent({
      action: 'deleted',
      notification: existingNotification || { id: notificationId },
    });

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllNotifications,
  getNotificationById,
  getNotificationsByUserId,
  getUnreadNotificationsByUserId,
  getStudentTeacherReplyThread,
  createNotification,
  updateNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
};
