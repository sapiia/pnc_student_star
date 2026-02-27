const express = require('express');
const userRoutes = require('../routes/userRoutes');
const evaluationRoutes = require('../routes/evaluationRoutes');
const feedbackRoutes = require('../routes/feedbackRoutes');
const meetingScheduleRoutes = require('../routes/meetingScheduleRoutes');
const notificationRoutes = require('../routes/notificationRoutes');
const questionRoutes = require('../routes/questionRoutes');
const settingRoutes = require('../routes/settingRoutes');
const db = require('../config/database');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/meetings', meetingScheduleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/settings', settingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

module.exports = app;
