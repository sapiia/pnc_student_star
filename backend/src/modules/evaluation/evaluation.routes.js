const express = require('express');
const router = express.Router();
const {
  getAllEvaluations,
  getEvaluationById,
  getEvaluationsByUserId,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  getReportStats,
  getCriteriaAverages,
  getTrendData,
  getEngagementStats,
  getSummaryStats,
  exportReport
} = require('./evaluation.controller');

// GET /api/evaluations - Get all evaluations
router.get('/', getAllEvaluations);

// GET /api/evaluations/report/stats - Get report statistics
router.get('/report/stats', getReportStats);

// GET /api/evaluations/report/criteria - Get criteria-wise averages
router.get('/report/criteria', getCriteriaAverages);

// GET /api/evaluations/report/trends - Get trend data
router.get('/report/trends', getTrendData);

// GET /api/evaluations/report/engagement - Get engagement stats
router.get('/report/engagement', getEngagementStats);

// GET /api/evaluations/report/summary - Get summary stats
router.get('/report/summary', getSummaryStats);

// GET /api/evaluations/report/export - Export report to Excel
router.get('/report/export', exportReport);

// GET /api/evaluations/:id - Get evaluation by ID
router.get('/:id', getEvaluationById);

// GET /api/evaluations/user/:userId - Get evaluations by user ID
router.get('/user/:userId', getEvaluationsByUserId);

// POST /api/evaluations - Create new evaluation
router.post('/', createEvaluation);

// PUT /api/evaluations/:id - Update evaluation
router.put('/:id', updateEvaluation);

// DELETE /api/evaluations/:id - Delete evaluation
router.delete('/:id', deleteEvaluation);

module.exports = router;
