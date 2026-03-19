const express = require('express');
const router = express.Router();
const {
  getOverviewStats,
  getStudentReports,
  getTeacherReports,
  getFilterOptions
} = require('../controllers/reportController');

// GET /api/reports/overview - Get overview statistics
router.get('/overview', getOverviewStats);

// GET /api/reports/students - Get student performance reports
router.get('/students', getStudentReports);

// GET /api/reports/teachers - Get teacher performance reports
router.get('/teachers', getTeacherReports);

// GET /api/reports/filters - Get filter options (generations, classes)
router.get('/filters', getFilterOptions);

module.exports = router;
