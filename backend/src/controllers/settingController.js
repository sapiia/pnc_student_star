const Setting = require('../models/Setting');
const CriterionConfig = require('../models/CriterionConfig');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { emitNotificationEvent } = require('../realtime');
const { getCache, setCache, delCache, getOrSetCache } = require('../utils/cache');

const lastSentNotification = new Map();

const SETTINGS_CACHE_KEY = 'settings:all';
const CRITERIA_CACHE_KEY = 'settings:criteria';

const notifyEvaluationChange = async (message) => {
  // Prevent duplicate identical notifications within a 60 second window
  const now = Date.now();
  if (lastSentNotification.has(message)) {
    if (now - lastSentNotification.get(message) < 60000) {
      return; // Skip if sent less than 60s ago
    }
  }
  lastSentNotification.set(message, now);


  try {
    const students = await User.findAllByRole('student');
    const teachers = await User.findAllByRole('teacher');
    const allRelevantUsers = [...students, ...teachers];

    for (const user of allRelevantUsers) {
      const notificationId = await Notification.create({
        user_id: user.id,
        message: message
      });
      emitNotificationEvent({
        action: 'created',
        notification: {
          id: notificationId,
          user_id: user.id,
          message: message,
          is_read: 0,
          created_at: new Date().toISOString()
        }
      });
    }
  } catch (err) {
    console.error('Error sending setting notifications:', err);
  }
};

const getAllSettings = async (req, res) => {
  try {
    const settings = await getOrSetCache(SETTINGS_CACHE_KEY, async () => {
      return await Setting.findAll();
    });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
};

const getSettingById = async (req, res) => {
  try {
    const setting = await Setting.findById(req.params.id);
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json(setting);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getSettingByKey = async (req, res) => {
  try {
    const setting = await Setting.findByKey(req.params.key);
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json(setting);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const createSetting = async (req, res) => {
  try {
    const settingId = await Setting.create(req.body);
    await delCache(SETTINGS_CACHE_KEY);
    res.status(201).json({ 
      message: "Setting created successfully", 
      settingId 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const updateSetting = async (req, res) => {
  try {
    const updated = await Setting.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Setting not found" });
    }
    await delCache(SETTINGS_CACHE_KEY);
    res.json({ message: "Setting updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const updateSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const updated = await Setting.updateByKey(key, value);
    if (!updated) {
      return res.status(404).json({ message: "Setting not found" });
    }

    await delCache(SETTINGS_CACHE_KEY);

    // Invalidate specific user profile cache if it's a department setting
    if (key.startsWith('profile_department_')) {
      const userId = key.replace('profile_department_', '');
      await delCache(`user:profile:${userId}`);
    }

    // Notify about evaluation process changes
    // But don't send individual role setting notifications if the admin is just hitting "save all"
    // Instead, we will notify broadly about permissions if needed.
    if (key === 'evaluation_interval_days') {
      await notifyEvaluationChange(`The evaluation cycle has been updated to ${value} days. Please check your dashboard for the new schedule.`);
    } else if (key.startsWith('student_can_') || key.startsWith('teacher_can_')) {
      await notifyEvaluationChange(`Administrator has updated the evaluation process and permission settings.`);
    }

    res.json({ message: "Setting updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const deleteSetting = async (req, res) => {
  try {
    const setting = await Setting.findById(req.params.id);
    const deleted = await Setting.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Setting not found" });
    }
    
    await delCache(SETTINGS_CACHE_KEY);
    if (setting && setting.key && setting.key.startsWith('profile_department_')) {
      const userId = setting.key.replace('profile_department_', '');
      await delCache(`user:profile:${userId}`);
    }

    res.json({ message: "Setting deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const deleteSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const deleted = await Setting.deleteByKey(key);
    if (!deleted) {
      return res.status(404).json({ message: "Setting not found" });
    }
    
    await delCache(SETTINGS_CACHE_KEY);
    if (key.startsWith('profile_department_')) {
      const userId = key.replace('profile_department_', '');
      await delCache(`user:profile:${userId}`);
    }

    res.json({ message: "Setting deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getEvaluationCriteriaConfig = async (_req, res) => {
  try {
    const config = await getOrSetCache(CRITERIA_CACHE_KEY, async () => {
      return await CriterionConfig.getConfig();
    });
    res.json(config);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to load evaluation criteria configuration.' });
  }
};

const saveEvaluationCriteriaConfig = async (req, res) => {
  try {
    const config = await CriterionConfig.saveConfig({
      ratingScale: req.body?.ratingScale,
      criteria: req.body?.criteria
    });

    await delCache(CRITERIA_CACHE_KEY);

    await notifyEvaluationChange('The evaluation criteria have been updated by the administrator. Please review the new criteria for your next self-evaluation.');

    res.json({
      message: 'Evaluation criteria configuration updated successfully',
      ...config
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to save evaluation criteria configuration.' });
  }
};

const { createClient } = require('redis');

const testRDIConnection = async (req, res) => {
  const { url, username, password } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic validation/parsing of URL
  // Expected format: redis://[user:password@]host:port or just host:port
  let redisUrl = url;
  if (!url.startsWith('redis://') && !url.startsWith('rediss://')) {
    // If it's just host:port, we try to prefix it
    redisUrl = `redis://${url}`;
  }

  const client = createClient({
    url: redisUrl,
    username: username || undefined,
    password: password || undefined,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: false // Don't retry for testing
    }
  });

  client.on('error', (err) => {
    // We catch this in the connect call usually, but listener is good practice
  });

  try {
    await client.connect();
    await client.ping();
    await client.quit();
    res.json({ message: 'Connection successful!' });
  } catch (err) {
    console.error('RDI Connection Test Failed:', err.message);
    res.status(500).json({ error: `Connection failed: ${err.message}` });
  }
};

module.exports = {
  getAllSettings,
  getSettingById,
  getSettingByKey,
  createSetting,
  updateSetting,
  updateSettingByKey,
  deleteSetting,
  deleteSettingByKey,
  getEvaluationCriteriaConfig,
  saveEvaluationCriteriaConfig,
  testRDIConnection
};
