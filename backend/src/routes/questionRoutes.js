const express = require('express');
const router = express.Router();
const {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');

// GET /api/questions - Get all questions
router.get('/', getAllQuestions);

// GET /api/questions/:id - Get question by ID
router.get('/:id', getQuestionById);

// POST /api/questions - Create new question
router.post('/', createQuestion);

// PUT /api/questions/:id - Update question
router.put('/:id', updateQuestion);

// DELETE /api/questions/:id - Delete question
router.delete('/:id', deleteQuestion);

module.exports = router;
