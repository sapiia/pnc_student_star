const db = require('../config/database');

class Question {
  static async findAll() {
    try {
      const [rows] = await db.query(`
        SELECT q.*, u.name as created_by_name
        FROM question q
        LEFT JOIN users u ON q.created_by = u.id
        ORDER BY q.created_at DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query(`
        SELECT q.*, u.name as created_by_name
        FROM question q
        LEFT JOIN users u ON q.created_by = u.id
        WHERE q.id = ?
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(questionData) {
    try {
      const { text, rating_scale, created_by } = questionData;
      
      const sql = "INSERT INTO question (text, rating_scale, created_by) VALUES (?, ?, ?)";
      const [result] = await db.query(sql, [text, rating_scale, created_by]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, questionData) {
    try {
      const { text, rating_scale, created_by } = questionData;
      
      const sql = "UPDATE question SET text = ?, rating_scale = ?, created_by = ? WHERE id = ?";
      const [result] = await db.query(sql, [text, rating_scale, created_by, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query("DELETE FROM question WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Question;
