const Notification = require('../models/Notification');

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

const createNotification = async (req, res) => {
  try {
    const notificationId = await Notification.create(req.body);
    res.status(201).json({ 
      message: "Notification created successfully", 
      notificationId 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const updateNotification = async (req, res) => {
  try {
    const updated = await Notification.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const updated = await Notification.markAsRead(req.params.id);
    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }
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
    const deleted = await Notification.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }
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
  createNotification,
  updateNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
};
