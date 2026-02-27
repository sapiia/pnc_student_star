const db = require('../config/database');

class Notification {
  static async findAll() {
    try {
      const [rows] = await db.query(`
        SELECT n.*, u.name as user_name
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        ORDER BY n.created_at DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query(`
        SELECT n.*, u.name as user_name
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        WHERE n.id = ?
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const [rows] = await db.query(`
        SELECT n.*, u.name as user_name
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
      `, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findUnreadByUserId(userId) {
    try {
      const [rows] = await db.query(`
        SELECT n.*, u.name as user_name
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        WHERE n.user_id = ? AND n.is_read = 0
        ORDER BY n.created_at DESC
      `, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(notificationData) {
    try {
      const { user_id, message, is_read } = notificationData;
      
      const sql = "INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, ?)";
      const [result] = await db.query(sql, [user_id, message, is_read || 0]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, notificationData) {
    try {
      const { message, is_read } = notificationData;
      
      const sql = "UPDATE notifications SET message = ?, is_read = ? WHERE id = ?";
      const [result] = await db.query(sql, [message, is_read, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async markAsRead(id) {
    try {
      const [result] = await db.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    try {
      const [result] = await db.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [userId]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query("DELETE FROM notifications WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Notification;
