const db = require('../config/database');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class User {
  // Find all users
  static async findAll() {
    try {
      const [rows] = await db.query("SELECT * FROM users");
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Create new user
  static async create(userData) {
    try {
      const { name, email, password, role, class_name } = userData;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const sql = "INSERT INTO users (name, email, password, role, class) VALUES (?, ?, ?, ?, ?)";
      const [result] = await db.query(sql, [name, email, hashedPassword, role, class_name]);
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  static async update(id, userData) {
    try {
      const { name, email, role, class_name } = userData;
      const sql = "UPDATE users SET name = ?, email = ?, role = ?, class = ? WHERE id = ?";
      const [result] = await db.query(sql, [name, email, role, class_name, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
