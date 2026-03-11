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

  static async findAllByRole(role) {
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE role = ?", [role]);
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

  // Get teacher's assigned classes (unique class values from students)
  static async getTeacherClasses(teacherId) {
    try {
      // Get unique classes from students (could be extended to use a teacher_class_assignment table)
      const [rows] = await db.query(`
        SELECT DISTINCT class 
        FROM users 
        WHERE role = 'student' 
        AND class IS NOT NULL 
        AND class != ''
        ORDER BY class
      `);
      return rows.map(row => row.class);
    } catch (error) {
      throw error;
    }
  }

  // Get students by class
  static async getStudentsByClass(className) {
    try {
      const [rows] = await db.query(`
        SELECT id, first_name, last_name, email, class, student_id, gender, profile_image
        FROM users 
        WHERE role = 'student' 
        AND class = ?
        AND is_active = 1
        AND is_deleted = 0
        ORDER BY first_name, last_name
      `, [className]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get all students for teacher (all classes teacher has access to)
  static async getTeacherStudents(teacherId) {
    try {
      const [rows] = await db.query(`
        SELECT id, first_name, last_name, email, class, student_id, gender, profile_image
        FROM users 
        WHERE role = 'student' 
        AND is_active = 1
        AND is_deleted = 0
        ORDER BY class, first_name, last_name
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
