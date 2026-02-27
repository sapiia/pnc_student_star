const express = require('express');
const router = express.Router();
const {
  getAllEvaluations,
  getEvaluationById,
  getEvaluationsByUserId,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation
} = require('../controllers/evaluationController');

// GET /api/evaluations - Get all evaluations
router.get('/', getAllEvaluations);

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
