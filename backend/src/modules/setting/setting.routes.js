const express = require('express');
const router = express.Router();
const {
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
} = require('./setting.controller');

// GET /api/settings - Get all settings
router.get('/', getAllSettings);

// Evaluation criteria config
router.get('/evaluation-criteria', getEvaluationCriteriaConfig);
router.put('/evaluation-criteria', saveEvaluationCriteriaConfig);

// Key-based routes (must come before :id)
router.get('/key/:key', getSettingByKey);
router.put('/key/:key', updateSettingByKey);
router.delete('/key/:key', deleteSettingByKey);

// ID-based routes
router.get('/:id', getSettingById);
router.post('/', createSetting);
router.put('/:id', updateSetting);
router.delete('/:id', deleteSetting);

module.exports = router;
