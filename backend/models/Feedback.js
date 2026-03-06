const db = require('../config/database');

class Feedback {
  static async findAll() {
    try {
      const [rows] = await db.query(`
        SELECT f.*, 
               t.name as teacher_name, 
               s.name as student_name
        FROM feedbacks f
        LEFT JOIN users t ON f.teacher_id = t.id
        LEFT JOIN users s ON f.student_id = s.id
        ORDER BY f.created_at DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query(`
        SELECT f.*, 
               t.name as teacher_name, 
               s.name as student_name
        FROM feedbacks f
        LEFT JOIN users t ON f.teacher_id = t.id
        LEFT JOIN users s ON f.student_id = s.id
        WHERE f.id = ?
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByStudentId(studentId) {
    try {
      const [rows] = await db.query(`
        SELECT f.*, t.name as teacher_name
        FROM feedbacks f
        LEFT JOIN users t ON f.teacher_id = t.id
        WHERE f.student_id = ?
        ORDER BY f.created_at DESC
      `, [studentId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByTeacherId(teacherId) {
    try {
      const [rows] = await db.query(`
        SELECT f.*, s.name as student_name
        FROM feedbacks f
        LEFT JOIN users s ON f.student_id = s.id
        WHERE f.teacher_id = ?
        ORDER BY f.created_at DESC
      `, [teacherId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(feedbackData) {
    try {
      const { teacher_id, student_id, evaluation_id, comment } = feedbackData;
      
      const sql = `
        INSERT INTO feedbacks (teacher_id, student_id, evaluation_id, comment)
        VALUES (?, ?, ?, ?)
      `;
      
      const [result] = await db.query(sql, [teacher_id, student_id, evaluation_id, comment]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, feedbackData) {
    try {
      const { comment } = feedbackData;
      
      const sql = "UPDATE feedbacks SET comment = ? WHERE id = ?";
      const [result] = await db.query(sql, [comment, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query("DELETE FROM feedbacks WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Feedback;
