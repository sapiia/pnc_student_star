const Feedback = require('../models/Feedback');

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
    const feedbackId = await Feedback.create(req.body);
    res.status(201).json({ 
      message: "Feedback created successfully", 
      feedbackId 
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
