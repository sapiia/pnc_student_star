const db = require('../config/database');

class Evaluation {
  static async findAll() {
    try {
      const [rows] = await db.query("SELECT * FROM evaluations ORDER BY created_at DESC");
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query("SELECT * FROM evaluations WHERE id = ?", [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const [rows] = await db.query("SELECT * FROM evaluations WHERE user_id = ? ORDER BY created_at DESC", [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(evaluationData) {
    try {
      const {
        user_id,
        period,
        living_stars,
        job_study_stars,
        human_support_stars,
        health_stars,
        feeling_stars,
        choice_behavior_stars,
        money_payment_stars,
        life_skill_stars
      } = evaluationData;

      const sql = `
        INSERT INTO evaluations 
        (user_id, period, living_stars, job_study_stars, human_support_stars, 
         health_stars, feeling_stars, choice_behavior_stars, money_payment_stars, life_skill_stars) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.query(sql, [
        user_id, period, living_stars, job_study_stars, human_support_stars,
        health_stars, feeling_stars, choice_behavior_stars, money_payment_stars, life_skill_stars
      ]);
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, evaluationData) {
    try {
      const {
        period,
        living_stars,
        job_study_stars,
        human_support_stars,
        health_stars,
        feeling_stars,
        choice_behavior_stars,
        money_payment_stars,
        life_skill_stars
      } = evaluationData;

      const sql = `
        UPDATE evaluations 
        SET period = ?, living_stars = ?, job_study_stars = ?, human_support_stars = ?,
            health_stars = ?, feeling_stars = ?, choice_behavior_stars = ?, 
            money_payment_stars = ?, life_skill_stars = ?
        WHERE id = ?
      `;
      
      const [result] = await db.query(sql, [
        period, living_stars, job_study_stars, human_support_stars,
        health_stars, feeling_stars, choice_behavior_stars, money_payment_stars, 
        life_skill_stars, id
      ]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query("DELETE FROM evaluations WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Evaluation;
