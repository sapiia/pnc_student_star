const db = require('../config/database');
const bcrypt = require('bcrypt');
const saltRounds = 10;
let userLifecycleColumnFlagsCache = null;

const getUserLifecycleColumnFlags = async () => {
  if (userLifecycleColumnFlagsCache) return userLifecycleColumnFlagsCache;

  const [rows] = await db.query(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME IN ('is_active', 'is_deleted')
    `
  );

  const columns = new Set(rows.map((row) => row.COLUMN_NAME));
  userLifecycleColumnFlagsCache = {
    hasIsActive: columns.has('is_active'),
    hasIsDeleted: columns.has('is_deleted')
  };

  return userLifecycleColumnFlagsCache;
};

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

  // Find users by filters
  static async findByFilters(filters) {
    try {
      let query = "SELECT * FROM users WHERE 1=1";
      const params = [];

      if (filters.generation) {
        query += " AND class LIKE ?";
        params.push(`%${filters.generation}%`);
      }

      if (filters.class_name) {
        query += " AND class = ?";
        params.push(filters.class_name);
      }

      if (filters.id) {
        query += " AND id = ?";
        params.push(filters.id);
      }

      // Note: gender filtering would require adding a gender field to the users table
      // For now, we'll include the parameter but won't filter by it
      if (filters.gender && false) { // Set to false to prevent filtering until gender field exists
        query += " AND gender = ?";
        params.push(filters.gender);
      }

      query += " ORDER BY first_name, last_name";

      const [rows] = await db.query(query, params);
      return rows;
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
      const { hasIsActive, hasIsDeleted } = await getUserLifecycleColumnFlags();
      const filters = [
        "role = 'student'",
        'class = ?'
      ];

      if (hasIsActive) {
        filters.push('is_active = 1');
      }

      if (hasIsDeleted) {
        filters.push('is_deleted = 0');
      }

      const query = `
        SELECT id, first_name, last_name, email, class, student_id, gender, profile_image
        FROM users 
        WHERE ${filters.join('\n        AND ')}
        ORDER BY first_name, last_name
      `;

      const [rows] = await db.query(query, [className]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get all students for teacher (all classes teacher has access to)
  static async getTeacherStudents(teacherId) {
    try {
      const { hasIsActive, hasIsDeleted } = await getUserLifecycleColumnFlags();
      const filters = ["role = 'student'"];

      if (hasIsActive) {
        filters.push('is_active = 1');
      }

      if (hasIsDeleted) {
        filters.push('is_deleted = 0');
      }

      const query = `
        SELECT id, first_name, last_name, email, class, student_id, gender, profile_image
        FROM users 
        WHERE ${filters.join('\n        AND ')}
        ORDER BY class, first_name, last_name
      `;

      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
