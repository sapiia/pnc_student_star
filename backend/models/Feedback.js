const db = require('../config/database');

const getUsersTableColumns = async () => {
  const [rows] = await db.query("SHOW COLUMNS FROM users");
  return new Set(rows.map((row) => row.Field));
};

const buildDisplayNameSql = (alias, columns) => {
  const parts = [];

  if (columns.has('name')) {
    parts.push(`NULLIF(TRIM(${alias}.name), '')`);
  }
  if (columns.has('first_name') || columns.has('last_name')) {
    const firstNameExpr = columns.has('first_name') ? `COALESCE(${alias}.first_name, '')` : `''`;
    const lastNameExpr = columns.has('last_name') ? `COALESCE(${alias}.last_name, '')` : `''`;
    parts.push(`NULLIF(TRIM(CONCAT(${firstNameExpr}, ' ', ${lastNameExpr})), '')`);
  }
  if (columns.has('email')) {
    parts.push(`${alias}.email`);
  }

  return `COALESCE(${parts.length > 0 ? parts.join(', ') : "''"})`;
};

class Feedback {
  static async findAll() {
    try {
      const columns = await getUsersTableColumns();
      const [rows] = await db.query(`
        SELECT f.*, 
               ${buildDisplayNameSql('t', columns)} as teacher_name, 
               ${buildDisplayNameSql('s', columns)} as student_name,
               ${columns.has('profile_image') ? 't.profile_image as teacher_profile_image,' : ''}
               ${columns.has('profile_image') ? 's.profile_image as student_profile_image' : 'NULL as student_profile_image'}
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
      const columns = await getUsersTableColumns();
      const [rows] = await db.query(`
        SELECT f.*, 
               ${buildDisplayNameSql('t', columns)} as teacher_name, 
               ${buildDisplayNameSql('s', columns)} as student_name,
               ${columns.has('profile_image') ? 't.profile_image as teacher_profile_image,' : ''}
               ${columns.has('profile_image') ? 's.profile_image as student_profile_image' : 'NULL as student_profile_image'}
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
      const columns = await getUsersTableColumns();
      const [rows] = await db.query(`
        SELECT f.*, 
               ${buildDisplayNameSql('t', columns)} as teacher_name,
               ${columns.has('profile_image') ? 't.profile_image as teacher_profile_image' : 'NULL as teacher_profile_image'}
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
      const columns = await getUsersTableColumns();
      const [rows] = await db.query(`
        SELECT f.*, 
               ${buildDisplayNameSql('s', columns)} as student_name,
               ${columns.has('profile_image') ? 's.profile_image as student_profile_image' : 'NULL as student_profile_image'}
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
