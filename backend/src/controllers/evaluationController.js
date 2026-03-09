const Evaluation = require('../models/Evaluation');

const getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.findAll();
    res.json(evaluations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
};

const getEvaluationById = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }
    res.json(evaluation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getEvaluationsByUserId = async (req, res) => {
  try {
    const evaluations = await Evaluation.findByUserId(req.params.userId);
    res.json(evaluations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const createEvaluation = async (req, res) => {
  try {
    const evaluationId = await Evaluation.create(req.body);
    res.status(201).json({ 
      message: "Evaluation created successfully", 
      evaluationId 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const updateEvaluation = async (req, res) => {
  try {
    const updated = await Evaluation.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Evaluation not found" });
    }
    res.json({ message: "Evaluation updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const deleteEvaluation = async (req, res) => {
  try {
    const deleted = await Evaluation.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Evaluation not found" });
    }
    res.json({ message: "Evaluation deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllEvaluations,
  getEvaluationById,
  getEvaluationsByUserId,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation
};
