const Feedback = require('../models/Feedback');
const db = require('../config/database');

const getFeedbackCharacterLimit = async () => {
  try {
    const [rows] = await db.query(
      "SELECT `value` FROM settings WHERE `key` = 'teacher_max_feedback_characters' LIMIT 1"
    );
    const parsed = Number(rows?.[0]?.value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1000;
  } catch {
    return 1000;
  }
};

const canStudentViewTeacherFeedback = async () => {
  try {
    const [rows] = await db.query(
      "SELECT `value` FROM settings WHERE `key` = 'student_can_view_teacher_feedback' LIMIT 1"
    );
    const normalized = String(rows?.[0]?.value || 'true').trim().toLowerCase();
    return normalized !== 'false' && normalized !== '0';
  } catch {
    return true;
  }
};

const ensureRoleTableRow = async (tableName, userId) => {
  const [existingRows] = await db.query(
    `SELECT user_id FROM ${tableName} WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  if (existingRows.length > 0) return;

  await db.query(
    `INSERT INTO ${tableName} (user_id) VALUES (?)`,
    [userId]
  );
};

const ensureFeedbackParticipants = async (teacherId, studentId) => {
  const [userRows] = await db.query(
    `
      SELECT id, role
      FROM users
      WHERE id IN (?, ?)
    `,
    [teacherId, studentId]
  );

  const teacherUser = userRows.find((row) => Number(row.id) === teacherId);
  const studentUser = userRows.find((row) => Number(row.id) === studentId);

  if (!teacherUser) {
    throw new Error('Teacher account was not found.');
  }
  if (!studentUser) {
    throw new Error('Student account was not found.');
  }

  const normalizedTeacherRole = String(teacherUser.role || '').trim().toLowerCase();
  const normalizedStudentRole = String(studentUser.role || '').trim().toLowerCase();

  if (normalizedTeacherRole !== 'teacher') {
    throw new Error('Selected teacher_id does not belong to a teacher account.');
  }
  if (normalizedStudentRole !== 'student') {
    throw new Error('Selected student_id does not belong to a student account.');
  }

  await ensureRoleTableRow('teachers', teacherId);
  await ensureRoleTableRow('students', studentId);
};

const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll();
    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
};

const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getFeedbacksByStudentId = async (req, res) => {
  try {
    const isVisible = await canStudentViewTeacherFeedback();
    if (!isVisible) {
      return res.json([]);
    }
    const feedbacks = await Feedback.findByStudentId(req.params.studentId);
    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getFeedbacksByTeacherId = async (req, res) => {
  try {
    const feedbacks = await Feedback.findByTeacherId(req.params.teacherId);
    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const createFeedback = async (req, res) => {
  try {
    const comment = String(req.body?.comment || '').trim();
    const teacherId = Number(req.body?.teacher_id);
    const studentId = Number(req.body?.student_id);
    const evaluationId = req.body?.evaluation_id ? Number(req.body.evaluation_id) : null;
    const maxCharacters = await getFeedbackCharacterLimit();

    if (!Number.isInteger(teacherId) || teacherId <= 0) {
      return res.status(400).json({ error: "A valid teacher_id is required." });
    }
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return res.status(400).json({ error: "A valid student_id is required." });
    }
    if (!comment) {
      return res.status(400).json({ error: "Feedback comment is required." });
    }
    if (comment.length > maxCharacters) {
      return res.status(400).json({ error: `Feedback must be ${maxCharacters} characters or fewer.` });
    }

    await ensureFeedbackParticipants(teacherId, studentId);

    const feedbackId = await Feedback.create(req.body);
    res.status(201).json({ 
      message: "Feedback created successfully", 
      feedbackId,
      maxCharacters,
      evaluationId: Number.isInteger(evaluationId) && evaluationId > 0 ? evaluationId : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const updated = await Feedback.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json({ message: "Feedback updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const deleted = await Feedback.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllFeedbacks,
  getFeedbackById,
  getFeedbacksByStudentId,
  getFeedbacksByTeacherId,
  createFeedback,
  updateFeedback,
  deleteFeedback
};
