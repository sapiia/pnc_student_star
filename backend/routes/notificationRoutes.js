const express = require('express');
const router = express.Router();
const {
  getAllNotifications,
  getNotificationById,
  getNotificationsByUserId,
  getUnreadNotificationsByUserId,
  createNotification,
  updateNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// GET /api/notifications - Get all notifications
router.get('/', getAllNotifications);

// GET /api/notifications/:id - Get notification by ID
router.get('/:id', getNotificationById);

// GET /api/notifications/user/:userId - Get notifications by user ID
router.get('/user/:userId', getNotificationsByUserId);

// GET /api/notifications/user/:userId/unread - Get unread notifications by user ID
router.get('/user/:userId/unread', getUnreadNotificationsByUserId);

// POST /api/notifications - Create new notification
router.post('/', createNotification);

// PUT /api/notifications/:id - Update notification
router.put('/:id', updateNotification);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', markNotificationAsRead);

// PUT /api/notifications/user/:userId/read-all - Mark all notifications as read for user
router.put('/user/:userId/read-all', markAllNotificationsAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', deleteNotification);

module.exports = router;
