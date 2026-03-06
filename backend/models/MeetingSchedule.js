const db = require('../config/database');

class MeetingSchedule {
  static async findAll() {
    try {
      const [rows] = await db.query(`
        SELECT ms.*, 
               s.name as student_name,
               eo.name as education_officer_name,
               m.name as manager_name
        FROM meeting_schedule ms
        LEFT JOIN users s ON ms.student_id = s.id
        LEFT JOIN users eo ON ms.education_officer_id = eo.id
        LEFT JOIN users m ON ms.manager_id = m.id
        ORDER BY ms.meeting_date DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query(`
        SELECT ms.*, 
               s.name as student_name,
               eo.name as education_officer_name,
               m.name as manager_name
        FROM meeting_schedule ms
        LEFT JOIN users s ON ms.student_id = s.id
        LEFT JOIN users eo ON ms.education_officer_id = eo.id
        LEFT JOIN users m ON ms.manager_id = m.id
        WHERE ms.id = ?
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByStudentId(studentId) {
    try {
      const [rows] = await db.query(`
        SELECT ms.*, 
               eo.name as education_officer_name,
               m.name as manager_name
        FROM meeting_schedule ms
        LEFT JOIN users eo ON ms.education_officer_id = eo.id
        LEFT JOIN users m ON ms.manager_id = m.id
        WHERE ms.student_id = ?
        ORDER BY ms.meeting_date DESC
      `, [studentId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(meetingData) {
    try {
      const { student_id, education_officer_id, manager_id, meeting_date, status } = meetingData;
      
      const sql = `
        INSERT INTO meeting_schedule (student_id, education_officer_id, manager_id, meeting_date, status)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.query(sql, [student_id, education_officer_id, manager_id, meeting_date, status]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, meetingData) {
    try {
      const { student_id, education_officer_id, manager_id, meeting_date, status } = meetingData;
      
      const sql = `
        UPDATE meeting_schedule 
        SET student_id = ?, education_officer_id = ?, manager_id = ?, meeting_date = ?, status = ?
        WHERE id = ?
      `;
      
      const [result] = await db.query(sql, [student_id, education_officer_id, manager_id, meeting_date, status, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query("DELETE FROM meeting_schedule WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MeetingSchedule;
