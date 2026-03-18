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
  saveEvaluationCriteriaConfig,
  testRDIConnection
} = require('../controllers/settingController');

// GET /api/settings - Get all settings
router.get('/', getAllSettings);

// POST /api/settings/test-rdi-connection - Test RDI connection
router.post('/test-rdi-connection', testRDIConnection);

// GET /api/settings/evaluation-criteria - Get evaluation criteria config
router.get('/evaluation-criteria', getEvaluationCriteriaConfig);

// PUT /api/settings/evaluation-criteria - Update evaluation criteria config
router.put('/evaluation-criteria', saveEvaluationCriteriaConfig);

// GET /api/settings/:id - Get setting by ID
router.get('/:id', getSettingById);

// GET /api/settings/key/:key - Get setting by key
router.get('/key/:key', getSettingByKey);

// POST /api/settings - Create new setting
router.post('/', createSetting);

// PUT /api/settings/:id - Update setting
router.put('/:id', updateSetting);

// PUT /api/settings/key/:key - Update setting by key
router.put('/key/:key', updateSettingByKey);

// DELETE /api/settings/:id - Delete setting
router.delete('/:id', deleteSetting);

// DELETE /api/settings/key/:key - Delete setting by key
router.delete('/key/:key', deleteSettingByKey);

module.exports = router;
