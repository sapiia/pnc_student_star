<<<<<<< HEAD:backend/src/controllers/evaluationController.js
const Evaluation = require('../models/Evaluation');
const redisClient = require('../config/redis');
=======
const Evaluation = require('./evaluation.model');
>>>>>>> e50e2c770a5c55e523530447ea2bb6c6066fc2ec:backend/src/modules/evaluation/evaluation.controller.js
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

const getUserTableColumns = async () => {
  const db = require('../../config/database');
  const [rows] = await db.query('SHOW COLUMNS FROM users');
  return new Set(rows.map((row) => row.Field));
};

const buildDisplayName = (row, columns) => {
  const direct = String(row?.name || '').trim();
  if (direct) return direct;
  const first = columns.has('first_name') ? String(row?.first_name || '').trim() : '';
  const last = columns.has('last_name') ? String(row?.last_name || '').trim() : '';
  const full = `${first} ${last}`.trim();
  if (full) return full;
  const email = String(row?.email || '').trim();
  return email || `User #${row?.id || ''}`.trim();
};

const parseQuarterLabel = (value = '') => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;
  const yqMatch = trimmed.match(/^(\d{4})\s*[-/ ]\s*Q([1-4])$/i);
  if (yqMatch) return { year: Number(yqMatch[1]), quarter: Number(yqMatch[2]) };
  const qyMatch = trimmed.match(/^Q([1-4])\s*[-/ ]?\s*(\d{4})$/i);
  if (qyMatch) return { year: Number(qyMatch[2]), quarter: Number(qyMatch[1]) };
  return null;
};

const getQuarterFromEvaluation = (evaluation) => {
  const parsed = parseQuarterLabel(evaluation?.period);
  if (parsed) return parsed;
  const dateValue = evaluation?.submitted_at || evaluation?.created_at;
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getUTCFullYear();
  const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
  return { year, quarter };
};

// Export report to Excel
const exportReport = async (req, res) => {
  try {
    const {
      class: classFilter,
      gender,
      generation,
      scope = 'students',
      quarter,
      level
    } = req.query;
    const scopeValue = String(scope || 'students').toLowerCase();

    if (scopeValue === 'teachers') {
      const db = require('../../config/database');
      const columns = await getUserTableColumns();

      const teacherFields = ['id'];
      ['name', 'first_name', 'last_name', 'email', 'class', 'profile_image'].forEach((field) => {
        if (columns.has(field)) teacherFields.push(field);
      });
      const [teacherRows] = await db.query(
        `SELECT ${teacherFields.join(', ')} FROM users WHERE role = 'teacher'`
      );
      const [studentRows] = await db.query(
        "SELECT id FROM users WHERE role = 'student'"
      );
      const [feedbackRows] = await db.query(
        `
          SELECT f.*, e.period, e.average_score, e.submitted_at, e.created_at
          FROM feedbacks f
          LEFT JOIN evaluations e ON f.evaluation_id = e.id
        `
      );

      const requestedQuarter = parseQuarterLabel(quarter);
      const filteredFeedbacks = requestedQuarter
        ? feedbackRows.filter((feedback) => {
            const evalQuarter = getQuarterFromEvaluation(feedback);
            return (
              evalQuarter &&
              evalQuarter.year === requestedQuarter.year &&
              evalQuarter.quarter === requestedQuarter.quarter
            );
          })
        : feedbackRows;

      const feedbackByTeacher = new Map();
      filteredFeedbacks.forEach((feedback) => {
        const teacherId = Number(feedback.teacher_id);
        if (!Number.isInteger(teacherId) || teacherId <= 0) return;
        const list = feedbackByTeacher.get(teacherId) || [];
        list.push(feedback);
        feedbackByTeacher.set(teacherId, list);
      });

      const teacherPerformance = teacherRows.map((teacher) => {
        const teacherId = Number(teacher.id);
        const list = feedbackByTeacher.get(teacherId) || [];
        const uniqueStudents = new Set(list.map((f) => Number(f.student_id)).filter((id) => Number.isInteger(id) && id > 0));
        const scores = list
          .map((f) => Number(f.average_score || 0))
          .filter((score) => Number.isFinite(score));
        const avgScore = scores.length > 0
          ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1))
          : 0;

        return {
          id: teacherId,
          name: buildDisplayName(teacher, columns),
          dept: String(teacher.class || 'Teaching Staff'),
          avgScore,
          studentCount: uniqueStudents.size
        };
      }).sort((a, b) => b.studentCount - a.studentCount || b.avgScore - a.avgScore);

      const totalStudents = studentRows.length;
      const studentsWithFeedback = new Set(
        filteredFeedbacks.map((feedback) => Number(feedback.student_id)).filter((id) => Number.isInteger(id) && id > 0)
      );
      const completed = studentsWithFeedback.size;
      const pending = Math.max(0, totalStudents - completed);

      const workbook = XLSX.utils.book_new();
      const summaryData = [
        ['PNC Student Star - Teacher Report'],
        ['Generated:', new Date().toLocaleString()],
        [''],
        ['Summary'],
        ['Total Teachers', teacherRows.length],
        ['Total Students', totalStudents],
        ['Students With Feedback', completed],
        ['Pending Feedback', pending],
        [''],
        ['Filters Applied'],
        ['Quarter', quarter || 'All']
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      const performanceData = [['Teacher', 'Department', 'Avg Score', 'Students']];
      teacherPerformance.forEach((teacher) => {
        performanceData.push([teacher.name, teacher.dept, teacher.avgScore, teacher.studentCount]);
      });
      const performanceSheet = XLSX.utils.aoa_to_sheet(performanceData);
      XLSX.utils.book_append_sheet(workbook, performanceSheet, 'Teacher Performance');

      const feedbackStatusData = [
        ['Status', 'Count'],
        ['With Feedback', completed],
        ['Pending', pending]
      ];
      const feedbackSheet = XLSX.utils.aoa_to_sheet(feedbackStatusData);
      XLSX.utils.book_append_sheet(workbook, feedbackSheet, 'Feedback Status');

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `Admin_Teachers_Report_${timestamp}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      return res.send(buffer);
    }

    const db = require('../../config/database');
    const [columnRows] = await db.query('SHOW COLUMNS FROM users');
    const userColumns = new Set(columnRows.map((row) => row.Field));

    const normalizeGender = (value) => {
      const normalized = String(value || '').trim().toLowerCase();
      if (!normalized || normalized === 'all') return null;
      return normalized;
    };

    const normalizeLevel = (value) => {
      const normalized = String(value || '').trim().toLowerCase();
      if (!normalized || normalized === 'all') return null;
      if (['low', 'medium', 'high'].includes(normalized)) return normalized;
      return null;
    };

    const getScoreLevel = (score) => {
      if (score === null || score === undefined || Number.isNaN(score)) return null;
      if (Number(score) < 3) return 'low';
      if (Number(score) < 4) return 'medium';
      return 'high';
    };

    const buildStudentWhere = () => {
      let where = `WHERE role = 'student'`;
      const params = [];

      if (userColumns.has('is_active')) {
        where += ' AND is_active = 1';
      }
      if (userColumns.has('is_deleted')) {
        where += ' AND is_deleted = 0';
      }

      if (classFilter && classFilter !== 'All') {
        where += ' AND class = ?';
        params.push(classFilter);
      }

      const normalizedGender = normalizeGender(gender);
      if (normalizedGender) {
        where += ' AND gender = ?';
        params.push(normalizedGender);
      }

      const generationValue = String(generation || '').trim();
      if (generationValue) {
        if (userColumns.has('generation')) {
          where += ' AND (generation = ? OR class LIKE ?)';
          params.push(generationValue, `%${generationValue}%`);
        } else {
          where += ' AND class LIKE ?';
          params.push(`%${generationValue}%`);
        }
      }

      return { where, params };
    };

    const getDisplayNameFromUser = (row = {}) => {
      const fullName = String(row.name || '').trim();
      if (fullName) return fullName;
      return [row.first_name, row.last_name].filter(Boolean).join(' ').trim();
    };

    const buildStudentExport = async () => {
      const normalizedLevel = normalizeLevel(level);
      const { where, params } = buildStudentWhere();
      const selectColumns = ['id'];
      if (userColumns.has('name')) selectColumns.push('name');
      if (userColumns.has('first_name')) selectColumns.push('first_name');
      if (userColumns.has('last_name')) selectColumns.push('last_name');
      if (userColumns.has('email')) selectColumns.push('email');
      if (userColumns.has('student_id')) selectColumns.push('student_id');
      if (userColumns.has('class')) selectColumns.push('class');
      if (userColumns.has('gender')) selectColumns.push('gender');
      if (userColumns.has('generation')) selectColumns.push('generation');

      let [studentRows] = await db.query(
        `SELECT ${selectColumns.join(', ')} FROM users ${where}`,
        params
      );

      const studentIds = studentRows.map((row) => Number(row.id)).filter((id) => Number.isInteger(id));
      const placeholders = studentIds.map(() => '?').join(', ');
      let evalRows = studentIds.length === 0
        ? []
        : (await db.query(
            `SELECT * FROM evaluations WHERE user_id IN (${placeholders}) ORDER BY submitted_at DESC, created_at DESC`,
            studentIds
          ))[0];

      if (normalizedLevel) {
        const levelTotals = new Map();
        evalRows.forEach((row) => {
          const userId = Number(row.user_id);
          const score = Number(row.average_score || 0);
          if (!Number.isInteger(userId) || !Number.isFinite(score)) return;
          const entry = levelTotals.get(userId) || { total: 0, count: 0 };
          entry.total += score;
          entry.count += 1;
          levelTotals.set(userId, entry);
        });

        const allowedIds = new Set();
        levelTotals.forEach((entry, userId) => {
          if (entry.count <= 0) return;
          const avg = entry.total / entry.count;
          if (getScoreLevel(avg) === normalizedLevel) {
            allowedIds.add(userId);
          }
        });

        studentRows = studentRows.filter((row) => allowedIds.has(Number(row.id)));
        const allowedIdList = new Set(studentRows.map((row) => Number(row.id)));
        evalRows = evalRows.filter((row) => allowedIdList.has(Number(row.user_id)));
      }

      const studentMap = new Map();
      studentRows.forEach((row) => {
        studentMap.set(Number(row.id), {
          ...row,
          displayName: getDisplayNameFromUser(row) || `Student #${row.id}`
        });
      });

      const evalIdList = evalRows.map((row) => Number(row.id)).filter((id) => Number.isInteger(id));
      const evalPlaceholders = evalIdList.map(() => '?').join(', ');
      const responseRows = evalIdList.length === 0
        ? []
        : (await db.query(
            `
              SELECT evaluation_id, criterion_key, criterion_name, criterion_icon, star_value
              FROM evaluation_responses
              WHERE evaluation_id IN (${evalPlaceholders})
            `,
            evalIdList
          ))[0];

      const evalUserMap = new Map();
      evalRows.forEach((row) => {
        evalUserMap.set(Number(row.id), Number(row.user_id));
      });

      const criteriaMap = new Map();
      responseRows.forEach((row) => {
        const key = String(row.criterion_key || row.criterion_name || '').trim();
        if (!key) return;
        const entry = criteriaMap.get(key) || {
          name: String(row.criterion_name || row.criterion_key || key).trim(),
          total: 0,
          count: 0,
          students: new Set()
        };
        entry.total += Number(row.star_value || 0);
        entry.count += 1;
        const userId = evalUserMap.get(Number(row.evaluation_id));
        if (Number.isInteger(userId)) {
          entry.students.add(userId);
        }
        criteriaMap.set(key, entry);
      });

      const criteriaAverages = Array.from(criteriaMap.values()).map((entry) => ({
        name: entry.name,
        value: entry.count > 0 ? Number((entry.total / entry.count).toFixed(2)) : 0,
        studentCount: entry.students.size
      })).sort((a, b) => b.value - a.value);

      const trendMap = new Map();
      evalRows.forEach((row) => {
        const period = String(row.period || '').trim();
        const dateValue = row.submitted_at || row.created_at;
        const label = period || (dateValue ? new Date(dateValue).toISOString().slice(0, 7) : 'Unknown');
        const entry = trendMap.get(label) || { total: 0, count: 0, students: new Set() };
        entry.total += Number(row.average_score || 0);
        entry.count += 1;
        if (Number.isInteger(row.user_id)) {
          entry.students.add(Number(row.user_id));
        }
        trendMap.set(label, entry);
      });

      const trendData = Array.from(trendMap.entries())
        .map(([label, entry]) => ({
          name: label,
          avg: entry.count > 0 ? Number((entry.total / entry.count).toFixed(2)) : 0,
          completion: entry.count,
          studentCount: entry.students.size
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(-12);

      const totalStudents = studentRows.length;
      const evaluatedStudents = new Set(evalRows.map((row) => Number(row.user_id)).filter((id) => Number.isInteger(id))).size;
      const completionRate = totalStudents > 0 ? Math.round((evaluatedStudents / totalStudents) * 100) : 0;
      const avgScore = evalRows.length > 0
        ? Number((evalRows.reduce((sum, row) => sum + Number(row.average_score || 0), 0) / evalRows.length).toFixed(2))
        : 0;

      const summary = {
        totalStudents,
        avgScore,
        completionRate,
        totalEvaluations: evalRows.length
      };

      const engagement = [
        { name: 'Completed', value: completionRate },
        { name: 'Pending', value: Math.max(0, 100 - completionRate) }
      ];

      return {
        summary,
        criteriaAverages,
        trendData,
        engagement,
        students: studentRows,
        evaluations: evalRows,
        studentMap
      };
    };

    const buildTeacherExport = async () => {
      const teacherFilters = [];
      if (userColumns.has('is_active')) {
        teacherFilters.push('is_active = 1');
      }
      if (userColumns.has('is_deleted')) {
        teacherFilters.push('is_deleted = 0');
      }
      const teacherWhere = `WHERE role = 'teacher'${teacherFilters.length ? ` AND ${teacherFilters.join(' AND ')}` : ''}`;
      const teacherSelect = ['id'];
      if (userColumns.has('name')) teacherSelect.push('name');
      if (userColumns.has('first_name')) teacherSelect.push('first_name');
      if (userColumns.has('last_name')) teacherSelect.push('last_name');
      if (userColumns.has('email')) teacherSelect.push('email');
      if (userColumns.has('class')) teacherSelect.push('class');
      const [teacherRows] = await db.query(
        `SELECT ${teacherSelect.join(', ')} FROM users ${teacherWhere}`
      );

      const studentFilters = [];
      if (userColumns.has('is_active')) {
        studentFilters.push('is_active = 1');
      }
      if (userColumns.has('is_deleted')) {
        studentFilters.push('is_deleted = 0');
      }
      const studentWhere = `WHERE role = 'student'${studentFilters.length ? ` AND ${studentFilters.join(' AND ')}` : ''}`;
      const studentSelect = ['id'];
      if (userColumns.has('name')) studentSelect.push('name');
      if (userColumns.has('first_name')) studentSelect.push('first_name');
      if (userColumns.has('last_name')) studentSelect.push('last_name');
      if (userColumns.has('email')) studentSelect.push('email');
      if (userColumns.has('student_id')) studentSelect.push('student_id');
      if (userColumns.has('class')) studentSelect.push('class');
      if (userColumns.has('gender')) studentSelect.push('gender');
      const [studentRows] = await db.query(
        `SELECT ${studentSelect.join(', ')} FROM users ${studentWhere}`
      );

      const teacherMap = new Map();
      teacherRows.forEach((row) => {
        teacherMap.set(Number(row.id), {
          ...row,
          displayName: getDisplayNameFromUser(row) || `Teacher #${row.id}`
        });
      });

      const studentMap = new Map();
      studentRows.forEach((row) => {
        studentMap.set(Number(row.id), {
          ...row,
          displayName: getDisplayNameFromUser(row) || `Student #${row.id}`
        });
      });

      const parseQuarter = (value = '') => {
        const trimmed = String(value || '').trim();
        if (!trimmed) return null;
        const yqMatch = trimmed.match(/^(\d{4})\s*[-/ ]\s*Q([1-4])$/i);
        if (yqMatch) return { year: yqMatch[1], quarter: yqMatch[2] };
        const qyMatch = trimmed.match(/^Q([1-4])\s*[-/ ]?\s*(\d{4})$/i);
        if (qyMatch) return { year: qyMatch[2], quarter: qyMatch[1] };
        return null;
      };

      const quarterParts = parseQuarter(quarter);
      const quarterPeriodA = quarterParts ? `${quarterParts.year}-Q${quarterParts.quarter}` : null;
      const quarterPeriodB = quarterParts ? `Q${quarterParts.quarter} ${quarterParts.year}` : null;

      let feedbackQuery = `
        SELECT f.id, f.teacher_id, f.student_id, f.evaluation_id, f.comment, f.created_at, e.period
        FROM feedbacks f
        LEFT JOIN evaluations e ON f.evaluation_id = e.id
      `;
      const feedbackParams = [];
      if (quarterParts) {
        feedbackQuery += ' WHERE (e.period = ? OR e.period = ?)';
        feedbackParams.push(quarterPeriodA, quarterPeriodB);
      }
      const [feedbackRows] = await db.query(feedbackQuery, feedbackParams);

      const evaluationIds = Array.from(
        new Set(feedbackRows.map((row) => Number(row.evaluation_id)).filter((id) => Number.isInteger(id)))
      );
      const evalPlaceholders = evaluationIds.map(() => '?').join(', ');
      const evaluationRows = evaluationIds.length === 0
        ? []
        : (await db.query(
            `SELECT id, average_score, period FROM evaluations WHERE id IN (${evalPlaceholders})`,
            evaluationIds
          ))[0];
      const evaluationMap = new Map();
      evaluationRows.forEach((row) => {
        evaluationMap.set(Number(row.id), row);
      });

      const feedbackByTeacher = new Map();
      feedbackRows.forEach((feedback) => {
        const teacherId = Number(feedback.teacher_id);
        if (!Number.isInteger(teacherId)) return;
        const list = feedbackByTeacher.get(teacherId) || [];
        list.push(feedback);
        feedbackByTeacher.set(teacherId, list);
      });

      const teacherPerformance = teacherRows.map((teacher) => {
        const teacherId = Number(teacher.id);
        const feedbackList = feedbackByTeacher.get(teacherId) || [];
        const uniqueStudents = new Set(
          feedbackList.map((feedback) => Number(feedback.student_id)).filter((id) => Number.isInteger(id))
        );
        const evaluationScores = feedbackList
          .map((feedback) => evaluationMap.get(Number(feedback.evaluation_id))?.average_score)
          .filter((score) => typeof score === 'number');
        const avgScore = evaluationScores.length > 0
          ? Number((evaluationScores.reduce((sum, score) => sum + Number(score || 0), 0) / evaluationScores.length).toFixed(1))
          : 0;

        return {
          id: teacherId,
          name: teacherMap.get(teacherId)?.displayName || `Teacher #${teacherId}`,
          dept: teacher.class || 'Teaching Staff',
          studentCount: uniqueStudents.size,
          avgScore
        };
      }).sort((a, b) => b.studentCount - a.studentCount || b.avgScore - a.avgScore);

      const totalStudents = studentRows.length;
      const studentsWithFeedback = new Set(
        feedbackRows.map((feedback) => Number(feedback.student_id)).filter((id) => Number.isInteger(id))
      );
      const completed = studentsWithFeedback.size;
      const pending = Math.max(0, totalStudents - completed);

      return {
        teacherPerformance,
        feedbackStatus: { completed, pending, totalStudents },
        feedbackRows,
        teacherMap,
        studentMap,
        quarterLabel: quarterParts ? `Q${quarterParts.quarter} ${quarterParts.year}` : 'All'
      };
    };

    const workbook = XLSX.utils.book_new();
    const generatedAt = new Date().toLocaleString();

    if (scope === 'teachers') {
      const teacherData = await buildTeacherExport();

      const summaryData = [
        ['PNC Student Star - Teacher Feedback Report'],
        ['Generated:', generatedAt],
        ['Quarter', teacherData.quarterLabel],
        [''],
        ['Feedback Coverage'],
        ['Total Students', teacherData.feedbackStatus.totalStudents],
        ['Students With Feedback', teacherData.feedbackStatus.completed],
        ['Pending', teacherData.feedbackStatus.pending]
      ];
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');

      const performanceData = [['Teacher ID', 'Teacher Name', 'Department', 'Students With Feedback', 'Average Score']];
      teacherData.teacherPerformance.forEach((row) => {
        performanceData.push([row.id, row.name, row.dept, row.studentCount, row.avgScore]);
      });
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(performanceData), 'Teacher Performance');

      const feedbackDetailData = [
        ['Feedback ID', 'Teacher Name', 'Student Name', 'Evaluation Period', 'Comment', 'Created At']
      ];
      teacherData.feedbackRows.forEach((feedback) => {
        const teacherName = teacherData.teacherMap.get(Number(feedback.teacher_id))?.displayName || `Teacher #${feedback.teacher_id}`;
        const studentName = teacherData.studentMap.get(Number(feedback.student_id))?.displayName || `Student #${feedback.student_id}`;
        feedbackDetailData.push([
          feedback.id,
          teacherName,
          studentName,
          feedback.period || '',
          feedback.comment || '',
          feedback.created_at || ''
        ]);
      });
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(feedbackDetailData), 'Feedback Detail');
    } else {
      const studentData = await buildStudentExport();

      const summaryData = [
        [`PNC Student Star - ${scope === 'students' ? 'Student' : 'Overview'} Report`],
        ['Generated:', generatedAt],
        [''],
        ['Summary Statistics'],
        ['Total Students', studentData.summary.totalStudents || 0],
        ['Average Score', studentData.summary.avgScore || 0],
        ['Completion Rate', (studentData.summary.completionRate || 0) + '%'],
        ['Total Evaluations', studentData.summary.totalEvaluations || 0],
        [''],
        ['Filters Applied'],
        ['Class', classFilter || 'All'],
        ['Gender', gender || 'All'],
        ['Generation', generation || 'All'],
        ['Level', level || 'All']
      ];
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');

      const criteriaData = [['Criteria Name', 'Average Score', 'Students Count']];
      studentData.criteriaAverages.forEach((criteria) => {
        criteriaData.push([criteria.name, criteria.value, criteria.studentCount || 0]);
      });
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(criteriaData), 'Criteria Averages');

      const trendData = [['Period', 'Average Score', 'Evaluation Count', 'Student Count']];
      studentData.trendData.forEach((trend) => {
        trendData.push([trend.name, trend.avg, trend.completion, trend.studentCount || 0]);
      });
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(trendData), 'Trend Data');

      const engagementData = [
        ['Status', 'Percentage'],
        [studentData.engagement[0]?.name || 'Completed', studentData.engagement[0]?.value || 0],
        [studentData.engagement[1]?.name || 'Pending', studentData.engagement[1]?.value || 0]
      ];
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(engagementData), 'Engagement');

      const evalData = [['Student ID', 'Name', 'Email', 'Class', 'Gender', 'Period', 'Average Score', 'Criteria Count', 'Submitted At']];
      studentData.evaluations.forEach((evalRow) => {
        const user = studentData.studentMap.get(Number(evalRow.user_id));
        if (user) {
          evalData.push([
            user.student_id || user.id,
            user.displayName || '',
            user.email || '',
            user.class || '',
            user.gender || '',
            evalRow.period || '',
            evalRow.average_score || 0,
            evalRow.criteria_count || 0,
            evalRow.submitted_at || ''
          ]);
        }
      });
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(evalData), 'Student Evaluations');
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const safeScope = String(scope || 'overview').toLowerCase();
    const filename = `Admin_${safeScope}_Report_${timestamp}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

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
