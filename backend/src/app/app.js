const express = require('express');
const cors = require('cors');
const { uploadsDir } = require('../config/paths');
const {
  userRoutes,
  evaluationRoutes,
  feedbackRoutes,
  meetingScheduleRoutes,
  notificationRoutes,
  questionRoutes,
  settingRoutes,
  reportRoutes,
} = require('../modules');

const app = express();

// Middleware to parse JSON bodies and form data
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/meetings', meetingScheduleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

module.exports = app;

