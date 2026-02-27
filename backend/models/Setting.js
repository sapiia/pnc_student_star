const db = require('../config/database');

class Setting {
  static async findAll() {
    try {
      const [rows] = await db.query("SELECT * FROM settings ORDER BY `key`");
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query("SELECT * FROM settings WHERE id = ?", [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByKey(key) {
    try {
      const [rows] = await db.query("SELECT * FROM settings WHERE `key` = ?", [key]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(settingData) {
    try {
      const { key, value } = settingData;
      
      const sql = "INSERT INTO settings (`key`, `value`) VALUES (?, ?)";
      const [result] = await db.query(sql, [key, value]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, settingData) {
    try {
      const { key, value } = settingData;
      
      const sql = "UPDATE settings SET `key` = ?, `value` = ? WHERE id = ?";
      const [result] = await db.query(sql, [key, value, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateByKey(key, value) {
    try {
      const [result] = await db.query("UPDATE settings SET `value` = ? WHERE `key` = ?", [value, key]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query("DELETE FROM settings WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async deleteByKey(key) {
    try {
      const [result] = await db.query("DELETE FROM settings WHERE `key` = ?", [key]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Setting;
