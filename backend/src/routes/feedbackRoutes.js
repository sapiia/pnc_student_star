const express = require('express');
const router = express.Router();
const {
  getAllFeedbacks,
  getFeedbackById,
  getFeedbacksByStudentId,
  getFeedbacksByTeacherId,
  createFeedback,
  updateFeedback,
  deleteFeedback
} = require('../controllers/feedbackController');

// GET /api/feedbacks - Get all feedbacks
router.get('/', getAllFeedbacks);

// GET /api/feedbacks/:id - Get feedback by ID
router.get('/:id', getFeedbackById);

// GET /api/feedbacks/student/:studentId - Get feedbacks by student ID
router.get('/student/:studentId', getFeedbacksByStudentId);

// GET /api/feedbacks/teacher/:teacherId - Get feedbacks by teacher ID
router.get('/teacher/:teacherId', getFeedbacksByTeacherId);

// POST /api/feedbacks - Create new feedback
router.post('/', createFeedback);

// PUT /api/feedbacks/:id - Update feedback
router.put('/:id', updateFeedback);

// DELETE /api/feedbacks/:id - Delete feedback
router.delete('/:id', deleteFeedback);

module.exports = router;
