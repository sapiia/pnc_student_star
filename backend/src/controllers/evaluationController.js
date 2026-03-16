const Evaluation = require('../models/Evaluation');
const XLSX = require('xlsx');

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
    if (err?.status) {
      return res.status(err.status).json({ error: err.message, ...(err.meta || {}) });
    }
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

// Get report statistics for teacher's students
const getReportStats = async (req, res) => {
  try {
    const { class: classFilter, gender, period } = req.query;
    const teacherId = req.user?.id;
    
    const stats = await Evaluation.getReportStats(teacherId, {
      class: classFilter,
      gender,
      period
    });
    
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get criteria-wise average scores
const getCriteriaAverages = async (req, res) => {
  try {
    const { class: classFilter, gender } = req.query;
    
    const averages = await Evaluation.getCriteriaAverages({
      class: classFilter,
      gender
    });
    
    res.json(averages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get trend data for charts
const getTrendData = async (req, res) => {
  try {
    const { class: classFilter, gender } = req.query;
    
    const trends = await Evaluation.getTrendData({
      class: classFilter,
      gender
    });
    
    res.json(trends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get engagement statistics
const getEngagementStats = async (req, res) => {
  try {
    const { class: classFilter, gender } = req.query;
    
    const engagement = await Evaluation.getEngagementStats({
      class: classFilter,
      gender
    });
    
    res.json(engagement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get summary statistics
const getSummaryStats = async (req, res) => {
  try {
    const { class: classFilter, gender } = req.query;
    
    const summary = await Evaluation.getSummaryStats({
      class: classFilter,
      gender
    });
    
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Export report to Excel
const exportReport = async (req, res) => {
  try {
    const { class: classFilter, gender, generation } = req.query;
    
    // Get all data needed for export
    const filters = { class: classFilter, gender };
    
    // Fetch all data
    const summary = await Evaluation.getSummaryStats(filters);
    const criteriaAverages = await Evaluation.getCriteriaAverages(filters);
    const trends = await Evaluation.getTrendData(filters);
    const engagement = await Evaluation.getEngagementStats(filters);
    
    // Get all evaluations for detailed sheet
    const allEvaluations = await Evaluation.findAll();
    
    // Get user data for evaluations
    const db = require('../config/database');
    const [userRows] = await db.query('SELECT id, name, email, student_id, class, gender FROM users WHERE role = "student"');
    const userMap = {};
    userRows.forEach(user => {
      userMap[user.id] = user;
    });
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // 1. Summary Statistics Sheet
    const summaryData = [
      ['PNC Student Star - Teacher Report'],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['Summary Statistics'],
      ['Total Students', summary.totalStudents || 0],
      ['Average Score', summary.avgScore || 0],
      ['Completion Rate', (summary.completionRate || 0) + '%'],
      ['Total Evaluations', summary.totalEvaluations || 0],
      [''],
      ['Filters Applied'],
      ['Class', classFilter || 'All'],
      ['Gender', gender || 'All'],
      ['Generation', generation || 'All']
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // 2. Criteria Averages Sheet
    const criteriaData = [['Criteria Name', 'Average Score', 'Students Count']];
    criteriaAverages.forEach(criteria => {
      criteriaData.push([criteria.name, criteria.value, criteria.studentCount || 0]);
    });
    const criteriaSheet = XLSX.utils.aoa_to_sheet(criteriaData);
    XLSX.utils.book_append_sheet(workbook, criteriaSheet, 'Criteria Averages');
    
    // 3. Trend Data Sheet
    const trendData = [['Period', 'Average Score', 'Evaluation Count', 'Student Count']];
    trends.forEach(trend => {
      trendData.push([trend.name, trend.avg, trend.completion, trend.studentCount || 0]);
    });
    const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
    XLSX.utils.book_append_sheet(workbook, trendSheet, 'Trend Data');
    
    // 4. Engagement Stats Sheet
    const engagementData = [
      ['Status', 'Percentage'],
      [engagement[0]?.name || 'Completed', engagement[0]?.value || 0],
      [engagement[1]?.name || 'Pending', engagement[1]?.value || 0]
    ];
    const engagementSheet = XLSX.utils.aoa_to_sheet(engagementData);
    XLSX.utils.book_append_sheet(workbook, engagementSheet, 'Engagement');
    
    // 5. Student Evaluations Sheet
    const evalData = [['Student ID', 'Name', 'Email', 'Class', 'Gender', 'Period', 'Average Score', 'Criteria Count', 'Submitted At']];
    allEvaluations.forEach(eval_ => {
      const user = userMap[eval_.user_id];
      if (user) {
        evalData.push([
          user.student_id || user.id,
          user.name || '',
          user.email || '',
          user.class || '',
          user.gender || '',
          eval_.period || '',
          eval_.average_score || 0,
          eval_.criteria_count || 0,
          eval_.submitted_at || ''
        ]);
      }
    });
    const evalSheet = XLSX.utils.aoa_to_sheet(evalData);
    XLSX.utils.book_append_sheet(workbook, evalSheet, 'Student Evaluations');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Teacher_Report_${timestamp}.xlsx`;
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send the workbook
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to export report: ' + err.message });
  }
};

module.exports = {
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
};
