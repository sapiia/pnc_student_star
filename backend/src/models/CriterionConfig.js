const db = require('../config/database');

const DEFAULT_RATING_SCALE = 5;
const DEFAULT_CRITERIA = [
  {
    id: 'CRIT-001',
    icon: 'Home',
    name: 'Living',
    description: 'Focus on your living environment, cleanliness of housing, and overall organization of daily chores.',
    status: 'Active',
    starDescriptions: [
      'Needs significant support in living, with frequent gaps that require close coaching.',
      'Shows early progress in living, but performance is still inconsistent and needs regular follow-up.',
      'Meets the expected baseline in living with steady but still improvable habits.',
      'Performs well in living and demonstrates reliable, above-average behavior in most situations.',
      'Consistently excels in living and models outstanding behavior with minimal guidance.',
    ],
  },
  {
    id: 'CRIT-002',
    icon: 'Briefcase',
    name: 'Job and Study',
    description: 'Reflect on your academic performance, attendance, internship dedication, and continuous learning efforts.',
    status: 'Active',
    starDescriptions: [
      'Needs significant support in job and study habits, with major gaps in consistency and commitment.',
      'Shows early progress in job and study habits, but still needs regular guidance to stay on track.',
      'Meets the baseline expectations in job and study with acceptable consistency.',
      'Performs well in job and study and demonstrates reliable learning discipline.',
      'Consistently excels in job and study with strong ownership, discipline, and continuous improvement.',
    ],
  },
  {
    id: 'CRIT-003',
    icon: 'Users2',
    name: 'Human and Support',
    description: 'Interpersonal relationships, teamwork skills, and the strength of your social support network.',
    status: 'Active',
    starDescriptions: [
      'Needs significant support in relationships and teamwork, with frequent conflict or withdrawal.',
      'Shows some positive interactions but still struggles to build stable support and collaboration.',
      'Maintains acceptable relationships and participates in teamwork at a basic level.',
      'Works well with others and contributes positively to a supportive environment.',
      'Builds strong relationships, supports peers consistently, and elevates team dynamics.',
    ],
  },
  {
    id: 'CRIT-004',
    icon: 'Heart',
    name: 'Health',
    description: 'Assessment of physical health, sleep patterns, nutrition, and exercise.',
    status: 'Active',
    starDescriptions: [
      'Health habits need urgent improvement, with clear risk factors in sleep, nutrition, or physical care.',
      'Some healthy behaviors exist, but routines are still weak and inconsistent.',
      'Maintains a basic acceptable level of health habits, though improvement is still needed.',
      'Demonstrates solid health routines and generally takes good care of physical well-being.',
      'Shows excellent health habits and maintains a strong, disciplined wellness routine.',
    ],
  },
  {
    id: 'CRIT-005',
    icon: 'Smile',
    name: 'Your Feeling',
    description: 'Self-reflection on happiness, stress management, and emotional stability.',
    status: 'Active',
    starDescriptions: [
      'Emotional well-being is under strain and requires significant support and attention.',
      'Shows some ability to manage feelings, but stress and emotional balance remain unstable.',
      'Maintains a generally acceptable emotional state with room for healthier coping habits.',
      'Demonstrates good emotional awareness and handles stress in constructive ways.',
      'Shows strong emotional balance, resilience, and healthy self-awareness consistently.',
    ],
  },
  {
    id: 'CRIT-006',
    icon: 'Brain',
    name: 'Choice and Behavior',
    description: 'Evaluating the maturity of your decisions and the responsibility taken for personal actions.',
    status: 'Active',
    starDescriptions: [
      'Choices and behavior often create problems and need close supervision and reflection.',
      'Some responsible choices are visible, but behavior is still inconsistent.',
      'Demonstrates acceptable judgment and takes basic responsibility for actions.',
      'Usually makes thoughtful decisions and behaves responsibly in most situations.',
      'Consistently makes mature choices and models responsible behavior for others.',
    ],
  },
  {
    id: 'CRIT-007',
    icon: 'CreditCard',
    name: 'Money and Payment',
    description: 'Financial management, budgeting skills, and meeting financial obligations.',
    status: 'Active',
    starDescriptions: [
      'Financial habits need major improvement, with frequent difficulty managing obligations.',
      'Shows some awareness of budgeting, but financial decisions remain unstable.',
      'Handles basic financial responsibilities at an acceptable level.',
      'Demonstrates good budgeting habits and manages financial obligations well.',
      'Shows excellent financial discipline, planning, and consistent responsibility.',
    ],
  },
  {
    id: 'CRIT-008',
    icon: 'Wrench',
    name: 'Life Skill',
    description: 'Practical skills including time management, problem-solving, and self-sufficiency.',
    status: 'Active',
    starDescriptions: [
      'Needs significant development in practical life skills and daily self-management.',
      'Shows some practical ability, but still depends heavily on guidance.',
      'Demonstrates an acceptable level of life skills for daily functioning.',
      'Handles practical tasks well and shows growing independence.',
      'Demonstrates strong life skills, initiative, and self-sufficiency consistently.',
    ],
  },
  {
    id: 'CRIT-009',
    icon: 'MessageCircle',
    name: 'Communication',
    description: 'Clarity of expression, active listening, respectful dialogue, and constructive participation.',
    status: 'Active',
    starDescriptions: [
      'Communication needs significant improvement, with frequent misunderstandings or lack of clarity.',
      'Shows some communication effort, but clarity and listening remain inconsistent.',
      'Communicates at a basic acceptable level and listens with moderate consistency.',
      'Communicates clearly, listens actively, and participates constructively most of the time.',
      'Communicates with confidence, clarity, empathy, and strong constructive impact.',
    ],
  },
];

const ensureTables = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS evaluation_criteria (
      id VARCHAR(20) NOT NULL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      icon VARCHAR(120) NOT NULL,
      description TEXT NOT NULL,
      status ENUM('Active', 'Draft') NOT NULL DEFAULT 'Active',
      display_order INT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS evaluation_criterion_star_descriptions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      criterion_id VARCHAR(20) NOT NULL,
      star_value INT NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_criterion_star (criterion_id, star_value),
      CONSTRAINT fk_criterion_star_descriptions_criterion
        FOREIGN KEY (criterion_id) REFERENCES evaluation_criteria(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

const ensureDefaultSettings = async () => {
  await db.query(
    `
      INSERT INTO settings (\`key\`, \`value\`)
      VALUES ('max_stars_per_category', ?)
      ON DUPLICATE KEY UPDATE \`value\` = \`value\`
    `,
    [String(DEFAULT_RATING_SCALE)]
  );
};

const seedDefaultsIfNeeded = async () => {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM evaluation_criteria');
  if (Number(rows?.[0]?.total || 0) > 0) return;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const insertCriterionSql = `
      INSERT INTO evaluation_criteria (id, name, icon, description, status, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const insertStarSql = `
      INSERT INTO evaluation_criterion_star_descriptions (criterion_id, star_value, description)
      VALUES (?, ?, ?)
    `;

    for (const [index, criterion] of DEFAULT_CRITERIA.entries()) {
      await connection.query(insertCriterionSql, [
        criterion.id,
        criterion.name,
        criterion.icon,
        criterion.description,
        criterion.status,
        index + 1,
      ]);

      for (const [starIndex, description] of criterion.starDescriptions.entries()) {
        await connection.query(insertStarSql, [criterion.id, starIndex + 1, description]);
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

class CriterionConfig {
  static async ensureSchema() {
    await ensureTables();
    await ensureDefaultSettings();
    await seedDefaultsIfNeeded();
  }

  static async getConfig() {
    await this.ensureSchema();

    const [criteriaRows] = await db.query(`
      SELECT id, name, icon, description, status, display_order
      FROM evaluation_criteria
      ORDER BY display_order ASC, created_at ASC
    `);
    const [starRows] = await db.query(`
      SELECT criterion_id, star_value, description
      FROM evaluation_criterion_star_descriptions
      ORDER BY criterion_id ASC, star_value ASC
    `);
    const [settingRows] = await db.query(
      "SELECT `value` FROM settings WHERE `key` = 'max_stars_per_category' LIMIT 1"
    );

    const starsByCriterion = starRows.reduce((acc, row) => {
      if (!acc[row.criterion_id]) acc[row.criterion_id] = [];
      acc[row.criterion_id][Number(row.star_value) - 1] = row.description;
      return acc;
    }, {});

    const ratingScale = Number(settingRows?.[0]?.value || DEFAULT_RATING_SCALE);

    return {
      ratingScale,
      criteria: criteriaRows.map((criterion) => ({
        id: criterion.id,
        name: criterion.name,
        icon: criterion.icon,
        description: criterion.description,
        status: criterion.status,
        starDescriptions: Array.from({ length: ratingScale }, (_, index) => {
          const existing = starsByCriterion[criterion.id]?.[index];
          return typeof existing === 'string' ? existing : '';
        }),
      })),
    };
  }

  static async saveConfig({ ratingScale, criteria }) {
    await this.ensureSchema();

    const normalizedRatingScale = Math.max(1, Number(ratingScale || DEFAULT_RATING_SCALE));
    const normalizedCriteria = Array.isArray(criteria) ? criteria : [];

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `
          INSERT INTO settings (\`key\`, \`value\`)
          VALUES ('max_stars_per_category', ?)
          ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)
        `,
        [String(normalizedRatingScale)]
      );

      await connection.query('DELETE FROM evaluation_criterion_star_descriptions');
      await connection.query('DELETE FROM evaluation_criteria');

      const insertCriterionSql = `
        INSERT INTO evaluation_criteria (id, name, icon, description, status, display_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const insertStarSql = `
        INSERT INTO evaluation_criterion_star_descriptions (criterion_id, star_value, description)
        VALUES (?, ?, ?)
      `;

      for (const [index, criterion] of normalizedCriteria.entries()) {
        const criterionId = String(criterion.id || `CRIT-${String(index + 1).padStart(3, '0')}`);
        await connection.query(insertCriterionSql, [
          criterionId,
          String(criterion.name || '').trim(),
          String(criterion.icon || 'Sparkles').trim(),
          String(criterion.description || '').trim(),
          criterion.status === 'Draft' ? 'Draft' : 'Active',
          index + 1,
        ]);

        const descriptions = Array.isArray(criterion.starDescriptions) ? criterion.starDescriptions : [];
        for (let starValue = 1; starValue <= normalizedRatingScale; starValue += 1) {
          await connection.query(insertStarSql, [
            criterionId,
            starValue,
            String(descriptions[starValue - 1] || '').trim(),
          ]);
        }
      }

      await connection.commit();
      return this.getConfig();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = CriterionConfig;
