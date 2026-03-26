const Setting = require('./setting.model');
const CriterionConfig = require('./criterion-config.model');
const Notification = require('../notification/notification.model');
const User = require('../user/user.model');
const { emitNotificationEvent } = require('../../app/realtime');

const lastSentNotification = new Map();

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
    const settings = await Setting.findAll();
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
    const deleted = await Setting.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json({ message: "Setting deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const deleteSettingByKey = async (req, res) => {
  try {
    const deleted = await Setting.deleteByKey(req.params.key);
    if (!deleted) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json({ message: "Setting deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getEvaluationCriteriaConfig = async (_req, res) => {
  try {
    const config = await CriterionConfig.getConfig();
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
  saveEvaluationCriteriaConfig
};
