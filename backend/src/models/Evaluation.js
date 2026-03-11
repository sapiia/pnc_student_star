const db = require('../config/database');

const ensureEvaluationUserForeignKey = async () => {
  const [databaseRows] = await db.query('SELECT DATABASE() AS database_name');
  const databaseName = databaseRows?.[0]?.database_name;
  if (!databaseName) return;

  const [constraintRows] = await db.query(
    `
      SELECT
        kcu.CONSTRAINT_NAME,
        kcu.REFERENCED_TABLE_NAME,
        kcu.REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE kcu
      WHERE kcu.TABLE_SCHEMA = ?
        AND kcu.TABLE_NAME = 'evaluations'
        AND kcu.COLUMN_NAME = 'user_id'
        AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
    `,
    [databaseName]
  );

  const currentConstraint = constraintRows[0];
  const shouldRecreate =
    !currentConstraint ||
    currentConstraint.REFERENCED_TABLE_NAME !== 'users' ||
    currentConstraint.REFERENCED_COLUMN_NAME !== 'id';

  if (!shouldRecreate) {
    return;
  }

  if (currentConstraint?.CONSTRAINT_NAME) {
    await db.query(`ALTER TABLE evaluations DROP FOREIGN KEY \`${currentConstraint.CONSTRAINT_NAME}\``);
  }

  await db.query(`
    ALTER TABLE evaluations
    ADD CONSTRAINT fk_evaluations_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
  `);
};

const ensureTables = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT(10) UNSIGNED NOT NULL,
      period VARCHAR(50) NOT NULL,
      rating_scale INT NOT NULL DEFAULT 5,
      criteria_count INT NOT NULL DEFAULT 0,
      average_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
      submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_evaluations_user_id (user_id),
      KEY idx_evaluations_submitted_at (submitted_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    ALTER TABLE evaluations
    ADD COLUMN IF NOT EXISTS rating_scale INT NOT NULL DEFAULT 5 AFTER period,
    ADD COLUMN IF NOT EXISTS criteria_count INT NOT NULL DEFAULT 0 AFTER rating_scale,
    ADD COLUMN IF NOT EXISTS average_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER criteria_count,
    ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER average_score
  `);

  await db.query(`
    UPDATE evaluations
    SET
      criteria_count = CASE
        WHEN criteria_count IS NULL OR criteria_count = 0 THEN
          (
            CASE WHEN living_stars > 0 THEN 1 ELSE 0 END +
            CASE WHEN job_study_stars > 0 THEN 1 ELSE 0 END +
            CASE WHEN human_support_stars > 0 THEN 1 ELSE 0 END +
            CASE WHEN health_stars > 0 THEN 1 ELSE 0 END +
            CASE WHEN feeling_stars > 0 THEN 1 ELSE 0 END +
            CASE WHEN choice_behavior_stars > 0 THEN 1 ELSE 0 END +
            CASE WHEN money_payment_stars > 0 THEN 1 ELSE 0 END +
            CASE WHEN life_skill_stars > 0 THEN 1 ELSE 0 END
          )
        ELSE criteria_count
      END,
      average_score = CASE
        WHEN average_score IS NULL OR average_score = 0 THEN
          (
            COALESCE(living_stars, 0) +
            COALESCE(job_study_stars, 0) +
            COALESCE(human_support_stars, 0) +
            COALESCE(health_stars, 0) +
            COALESCE(feeling_stars, 0) +
            COALESCE(choice_behavior_stars, 0) +
            COALESCE(money_payment_stars, 0) +
            COALESCE(life_skill_stars, 0)
          ) / NULLIF(
            (
              CASE WHEN living_stars > 0 THEN 1 ELSE 0 END +
              CASE WHEN job_study_stars > 0 THEN 1 ELSE 0 END +
              CASE WHEN human_support_stars > 0 THEN 1 ELSE 0 END +
              CASE WHEN health_stars > 0 THEN 1 ELSE 0 END +
              CASE WHEN feeling_stars > 0 THEN 1 ELSE 0 END +
              CASE WHEN choice_behavior_stars > 0 THEN 1 ELSE 0 END +
              CASE WHEN money_payment_stars > 0 THEN 1 ELSE 0 END +
              CASE WHEN life_skill_stars > 0 THEN 1 ELSE 0 END
            ),
            0
          )
        ELSE average_score
      END,
      submitted_at = COALESCE(submitted_at, created_at, CURRENT_TIMESTAMP)
  `);

  await ensureEvaluationUserForeignKey();

  await db.query(`
    CREATE TABLE IF NOT EXISTS evaluation_responses (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      evaluation_id INT(10) UNSIGNED NOT NULL,
      criterion_id VARCHAR(20) NULL,
      criterion_key VARCHAR(120) NOT NULL,
      criterion_name VARCHAR(120) NOT NULL,
      criterion_icon VARCHAR(120) NULL,
      star_value INT NOT NULL DEFAULT 0,
      reflection TEXT NULL,
      tip_snapshot TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_evaluation_criterion_key (evaluation_id, criterion_key),
      KEY idx_evaluation_responses_criterion_id (criterion_id),
      CONSTRAINT fk_evaluation_responses_evaluation
        FOREIGN KEY (evaluation_id) REFERENCES evaluations(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    INSERT IGNORE INTO evaluation_responses (
      evaluation_id,
      criterion_key,
      criterion_name,
      criterion_icon,
      star_value
    )
    SELECT id, 'living', 'Living', 'Home', living_stars
    FROM evaluations
    WHERE COALESCE(living_stars, 0) > 0

    UNION ALL

    SELECT id, 'jobStudy', 'Job & Study', 'Briefcase', job_study_stars
    FROM evaluations
    WHERE COALESCE(job_study_stars, 0) > 0

    UNION ALL

    SELECT id, 'humanSupport', 'Human & Support', 'Users2', human_support_stars
    FROM evaluations
    WHERE COALESCE(human_support_stars, 0) > 0

    UNION ALL

    SELECT id, 'health', 'Health', 'Heart', health_stars
    FROM evaluations
    WHERE COALESCE(health_stars, 0) > 0

    UNION ALL

    SELECT id, 'feeling', 'Your Feeling', 'Smile', feeling_stars
    FROM evaluations
    WHERE COALESCE(feeling_stars, 0) > 0

    UNION ALL

    SELECT id, 'choiceBehavior', 'Choice & Behavior', 'Brain', choice_behavior_stars
    FROM evaluations
    WHERE COALESCE(choice_behavior_stars, 0) > 0

    UNION ALL

    SELECT id, 'moneyPayment', 'Money & Payment', 'CreditCard', money_payment_stars
    FROM evaluations
    WHERE COALESCE(money_payment_stars, 0) > 0

    UNION ALL

    SELECT id, 'lifeSkill', 'Life Skill', 'Wrench', life_skill_stars
    FROM evaluations
    WHERE COALESCE(life_skill_stars, 0) > 0
  `);
};

const hydrateEvaluations = async (evaluationRows) => {
  if (!Array.isArray(evaluationRows) || evaluationRows.length === 0) {
    return [];
  }

  const evaluationIds = evaluationRows.map((row) => row.id);
  const placeholders = evaluationIds.map(() => '?').join(', ');
  const [responseRows] = await db.query(
    `
      SELECT
        id,
        evaluation_id,
        criterion_id,
        criterion_key,
        criterion_name,
        criterion_icon,
        star_value,
        reflection,
        tip_snapshot,
        created_at,
        updated_at
      FROM evaluation_responses
      WHERE evaluation_id IN (${placeholders})
      ORDER BY evaluation_id ASC, id ASC
    `,
    evaluationIds
  );

  const responsesByEvaluation = responseRows.reduce((acc, row) => {
    if (!acc[row.evaluation_id]) {
      acc[row.evaluation_id] = [];
    }

    acc[row.evaluation_id].push({
      id: row.id,
      criterion_id: row.criterion_id,
      criterion_key: row.criterion_key,
      criterion_name: row.criterion_name,
      criterion_icon: row.criterion_icon,
      star_value: Number(row.star_value || 0),
      reflection: row.reflection || '',
      tip_snapshot: row.tip_snapshot || '',
      created_at: row.created_at,
      updated_at: row.updated_at,
    });

    return acc;
  }, {});

  return evaluationRows.map((row) => ({
    ...row,
    rating_scale: Number(row.rating_scale || 0),
    criteria_count: Number(row.criteria_count || 0),
    average_score: Number(row.average_score || 0),
    responses: responsesByEvaluation[row.id] || [],
  }));
};

const toPeriodLabel = (value) => {
  const trimmed = String(value || '').trim();
  if (trimmed) return trimmed;

  const now = new Date();
  const quarter = Math.floor(now.getUTCMonth() / 3) + 1;
  return `${now.getUTCFullYear()}-Q${quarter}`;
};

class Evaluation {
  static async ensureSchema() {
    await ensureTables();
  }

  static async findAll() {
    await this.ensureSchema();
    const [rows] = await db.query('SELECT * FROM evaluations ORDER BY submitted_at DESC, created_at DESC');
    return hydrateEvaluations(rows);
  }

  static async findById(id) {
    await this.ensureSchema();
    const [rows] = await db.query('SELECT * FROM evaluations WHERE id = ? LIMIT 1', [id]);
    const evaluations = await hydrateEvaluations(rows);
    return evaluations[0] || null;
  }

  static async findByUserId(userId) {
    await this.ensureSchema();
    const [rows] = await db.query(
      'SELECT * FROM evaluations WHERE user_id = ? ORDER BY submitted_at DESC, created_at DESC',
      [userId]
    );
    return hydrateEvaluations(rows);
  }

  static async create(evaluationData) {
    await this.ensureSchema();

    const userId = Number(evaluationData?.user_id);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('A valid user_id is required.');
    }

    const responses = Array.isArray(evaluationData?.responses) ? evaluationData.responses : [];
    if (responses.length === 0) {
      throw new Error('At least one evaluation response is required.');
    }

    const normalizedResponses = responses.map((response, index) => ({
      criterion_id: response?.criterion_id ? String(response.criterion_id).trim() : null,
      criterion_key: String(response?.criterion_key || response?.key || `criterion${index + 1}`).trim(),
      criterion_name: String(response?.criterion_name || response?.label || `Criterion ${index + 1}`).trim(),
      criterion_icon: response?.criterion_icon ? String(response.criterion_icon).trim() : null,
      star_value: Math.max(0, Number(response?.star_value || response?.score || 0)),
      reflection: String(response?.reflection || '').trim(),
      tip_snapshot: String(response?.tip_snapshot || '').trim(),
    }));

    const ratingScale = Math.max(1, Number(evaluationData?.rating_scale || 5));
    const criteriaCount = normalizedResponses.length;
    const totalScore = normalizedResponses.reduce((sum, response) => sum + response.star_value, 0);
    const averageScore = criteriaCount > 0 ? Number((totalScore / criteriaCount).toFixed(2)) : 0;
    const period = toPeriodLabel(evaluationData?.period);

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `
          INSERT INTO evaluations (user_id, period, rating_scale, criteria_count, average_score)
          VALUES (?, ?, ?, ?, ?)
        `,
        [userId, period, ratingScale, criteriaCount, averageScore]
      );

      const evaluationId = result.insertId;
      for (const response of normalizedResponses) {
        await connection.query(
          `
            INSERT INTO evaluation_responses (
              evaluation_id,
              criterion_id,
              criterion_key,
              criterion_name,
              criterion_icon,
              star_value,
              reflection,
              tip_snapshot
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            evaluationId,
            response.criterion_id,
            response.criterion_key,
            response.criterion_name,
            response.criterion_icon,
            response.star_value,
            response.reflection,
            response.tip_snapshot,
          ]
        );
      }

      await connection.commit();
      return evaluationId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, evaluationData) {
    await this.ensureSchema();

    const existing = await this.findById(id);
    if (!existing) {
      return false;
    }

    const userId = Number(evaluationData?.user_id || existing.user_id);
    const responses = Array.isArray(evaluationData?.responses) && evaluationData.responses.length > 0
      ? evaluationData.responses
      : existing.responses;

    const normalizedResponses = responses.map((response, index) => ({
      criterion_id: response?.criterion_id ? String(response.criterion_id).trim() : null,
      criterion_key: String(response?.criterion_key || response?.key || `criterion${index + 1}`).trim(),
      criterion_name: String(response?.criterion_name || response?.label || `Criterion ${index + 1}`).trim(),
      criterion_icon: response?.criterion_icon ? String(response.criterion_icon).trim() : null,
      star_value: Math.max(0, Number(response?.star_value || response?.score || 0)),
      reflection: String(response?.reflection || '').trim(),
      tip_snapshot: String(response?.tip_snapshot || '').trim(),
    }));

    const ratingScale = Math.max(1, Number(evaluationData?.rating_scale || existing.rating_scale || 5));
    const criteriaCount = normalizedResponses.length;
    const totalScore = normalizedResponses.reduce((sum, response) => sum + response.star_value, 0);
    const averageScore = criteriaCount > 0 ? Number((totalScore / criteriaCount).toFixed(2)) : 0;
    const period = toPeriodLabel(evaluationData?.period || existing.period);

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `
          UPDATE evaluations
          SET user_id = ?, period = ?, rating_scale = ?, criteria_count = ?, average_score = ?
          WHERE id = ?
        `,
        [userId, period, ratingScale, criteriaCount, averageScore, id]
      );

      await connection.query('DELETE FROM evaluation_responses WHERE evaluation_id = ?', [id]);

      for (const response of normalizedResponses) {
        await connection.query(
          `
            INSERT INTO evaluation_responses (
              evaluation_id,
              criterion_id,
              criterion_key,
              criterion_name,
              criterion_icon,
              star_value,
              reflection,
              tip_snapshot
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            id,
            response.criterion_id,
            response.criterion_key,
            response.criterion_name,
            response.criterion_icon,
            response.star_value,
            response.reflection,
            response.tip_snapshot,
          ]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    await this.ensureSchema();
    const [result] = await db.query('DELETE FROM evaluations WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Get evaluation statistics for teacher's students
  static async getReportStats(teacherId, filters = {}) {
    const { class: classFilter, gender, period } = filters;
    
    try {
      await this.ensureSchema();
      
      let query = `
        SELECT 
          u.class,
          u.gender,
          e.period,
          e.average_score,
          e.criteria_count,
          e.submitted_at
        FROM evaluations e
        INNER JOIN users u ON e.user_id = u.id
        WHERE u.role = 'student'
        AND u.is_active = 1
        AND u.is_deleted = 0
      `;
      
      const params = [];
      
      if (classFilter) {
        query += ' AND u.class = ?';
        params.push(classFilter);
      }
      
      if (gender && gender !== 'All') {
        query += ' AND u.gender = ?';
        params.push(gender.toLowerCase());
      }
      
      if (period) {
        query += ' AND e.period = ?';
        params.push(period);
      }
      
      query += ' ORDER BY e.submitted_at DESC';
      
      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get criteria-wise average scores for students
  static async getCriteriaAverages(filters = {}) {
    const { class: classFilter, gender } = filters;
    
    try {
      await this.ensureSchema();
      
      let query = `
        SELECT 
          er.criterion_key,
          er.criterion_name,
          er.criterion_icon,
          AVG(er.star_value) as avg_score,
          COUNT(DISTINCT e.user_id) as student_count
        FROM evaluation_responses er
        INNER JOIN evaluations e ON er.evaluation_id = e.id
        INNER JOIN users u ON e.user_id = u.id
        WHERE u.role = 'student'
        AND u.is_active = 1
        AND u.is_deleted = 0
      `;
      
      const params = [];
      
      if (classFilter) {
        query += ' AND u.class = ?';
        params.push(classFilter);
      }
      
      if (gender && gender !== 'All') {
        query += ' AND u.gender = ?';
        params.push(gender.toLowerCase());
      }
      
      query += ' GROUP BY er.criterion_key, er.criterion_name, er.criterion_icon ORDER BY avg_score DESC';
      
      const [rows] = await db.query(query, params);
      return rows.map(row => ({
        name: row.criterion_name,
        value: Number(row.avg_score || 0).toFixed(2),
        key: row.criterion_key,
        icon: row.criterion_icon,
        studentCount: row.student_count
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get trend data (average scores over time periods)
  static async getTrendData(filters = {}) {
    const { class: classFilter, gender } = filters;
    
    try {
      await this.ensureSchema();
      
      let query = `
        SELECT 
          DATE_FORMAT(e.submitted_at, '%Y-%m') as month,
          e.period,
          AVG(e.average_score) as avg_score,
          COUNT(*) as evaluation_count,
          COUNT(DISTINCT e.user_id) as student_count
        FROM evaluations e
        INNER JOIN users u ON e.user_id = u.id
        WHERE u.role = 'student'
        AND u.is_active = 1
        AND u.is_deleted = 0
      `;
      
      const params = [];
      
      if (classFilter) {
        query += ' AND u.class = ?';
        params.push(classFilter);
      }
      
      if (gender && gender !== 'All') {
        query += ' AND u.gender = ?';
        params.push(gender.toLowerCase());
      }
      
      query += ' GROUP BY DATE_FORMAT(e.submitted_at, "%Y-%m"), e.period ORDER BY month ASC LIMIT 12';
      
      const [rows] = await db.query(query, params);
      return rows.map(row => ({
        name: row.period || row.month,
        avg: Number(row.avg_score || 0).toFixed(1),
        completion: row.evaluation_count,
        studentCount: row.student_count
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get engagement status (completion rates)
  static async getEngagementStats(filters = {}) {
    const { class: classFilter, gender } = filters;
    
    try {
      await this.ensureSchema();
      
      // Get total students
      let countQuery = `
        SELECT COUNT(*) as total
        FROM users
        WHERE role = 'student'
        AND is_active = 1
        AND is_deleted = 0
      `;
      const countParams = [];
      
      if (classFilter) {
        countQuery += ' AND class = ?';
        countParams.push(classFilter);
      }
      
      if (gender && gender !== 'All') {
        countQuery += ' AND gender = ?';
        countParams.push(gender.toLowerCase());
      }
      
      const [totalRows] = await db.query(countQuery, countParams);
      const totalStudents = totalRows[0]?.total || 0;
      
      // Get students with evaluations
      let evalQuery = `
        SELECT COUNT(DISTINCT e.user_id) as evaluated
        FROM evaluations e
        INNER JOIN users u ON e.user_id = u.id
        WHERE u.role = 'student'
        AND u.is_active = 1
        AND u.is_deleted = 0
      `;
      const evalParams = [];
      
      if (classFilter) {
        evalQuery += ' AND u.class = ?';
        evalParams.push(classFilter);
      }
      
      if (gender && gender !== 'All') {
        evalQuery += ' AND u.gender = ?';
        evalParams.push(gender.toLowerCase());
      }
      
      const [evalRows] = await db.query(evalQuery, evalParams);
      const evaluatedStudents = evalRows[0]?.evaluated || 0;
      
      const completed = totalStudents > 0 ? Math.round((evaluatedStudents / totalStudents) * 100) : 0;
      const pending = 100 - completed;
      
      return [
        { name: 'Completed', value: completed, fill: '#5d5fef' },
        { name: 'Pending', value: pending, fill: '#94a3b8' }
      ];
    } catch (error) {
      throw error;
    }
  }

  // Get overall stats summary
  static async getSummaryStats(filters = {}) {
    const { class: classFilter, gender } = filters;
    
    try {
      await this.ensureSchema();
      
      let query = `
        SELECT 
          COUNT(DISTINCT u.id) as total_students,
          AVG(e.average_score) as avg_score,
          COUNT(e.id) as total_evaluations,
          COUNT(DISTINCT e.user_id) as evaluated_students
        FROM users u
        LEFT JOIN evaluations e ON u.id = e.user_id
        WHERE u.role = 'student'
        AND u.is_active = 1
        AND u.is_deleted = 0
      `;
      
      const params = [];
      
      if (classFilter) {
        query += ' AND u.class = ?';
        params.push(classFilter);
      }
      
      if (gender && gender !== 'All') {
        query += ' AND u.gender = ?';
        params.push(gender.toLowerCase());
      }
      
      const [rows] = await db.query(query, params);
      const row = rows[0];
      
      const totalStudents = row.total_students || 0;
      const evaluatedStudents = row.evaluated_students || 0;
      const completionRate = totalStudents > 0 ? Math.round((evaluatedStudents / totalStudents) * 100) : 0;
      
      return {
        totalStudents,
        avgScore: Number(row.avg_score || 0).toFixed(2),
        completionRate,
        totalEvaluations: row.total_evaluations || 0
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Evaluation;
