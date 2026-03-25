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
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const configuredOrigins = new Set(
  String(process.env.FRONTEND_URL || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
);

const isPrivateIpv4Hostname = (hostname = '') => (
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
  || /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)
  || /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (configuredOrigins.has(origin)) return true;

  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol !== 'http:' && protocol !== 'https:') {
      return false;
    }

    if (!IS_PRODUCTION) {
      return hostname === 'localhost'
        || hostname === '127.0.0.1'
        || isPrivateIpv4Hostname(hostname);
    }

    return false;
  } catch {
    return false;
  }
};

// Middleware to parse JSON bodies and form data
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  },
  credentials: true
}));
app.use(require('cookie-parser')());
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

