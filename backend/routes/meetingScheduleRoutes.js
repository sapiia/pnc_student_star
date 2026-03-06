const express = require('express');
const router = express.Router();
const {
  getAllMeetings,
  getMeetingById,
  getMeetingsByStudentId,
  createMeeting,
  updateMeeting,
  deleteMeeting
} = require('../controllers/meetingScheduleController');

// GET /api/meetings - Get all meetings
router.get('/', getAllMeetings);

// GET /api/meetings/:id - Get meeting by ID
router.get('/:id', getMeetingById);

// GET /api/meetings/student/:studentId - Get meetings by student ID
router.get('/student/:studentId', getMeetingsByStudentId);

// POST /api/meetings - Create new meeting
router.post('/', createMeeting);

// PUT /api/meetings/:id - Update meeting
router.put('/:id', updateMeeting);

// DELETE /api/meetings/:id - Delete meeting
router.delete('/:id', deleteMeeting);

module.exports = router;
