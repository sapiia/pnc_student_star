const db = require('../../config/database');

const ensureSettingsTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      "key" VARCHAR(255) NOT NULL,
      "value" TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_key ON settings("key")');
};

class Setting {
  static async findAll() {
    try {
      await ensureSettingsTable();
      const [rows] = await db.query('SELECT * FROM settings ORDER BY "key"');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      await ensureSettingsTable();
      const [rows] = await db.query("SELECT * FROM settings WHERE id = ?", [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByKey(key) {
    try {
      await ensureSettingsTable();
      const [rows] = await db.query('SELECT * FROM settings WHERE "key" = ?', [key]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(settingData) {
    try {
      await ensureSettingsTable();
      const { key, value } = settingData;
      
      const sql = 'INSERT INTO settings ("key", "value") VALUES (?, ?)';
      const [result] = await db.query(sql, [key, value]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, settingData) {
    try {
      await ensureSettingsTable();
      const { key, value } = settingData;
      
      const sql = 'UPDATE settings SET "key" = ?, "value" = ? WHERE id = ?';
      const [result] = await db.query(sql, [key, value, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateByKey(key, value) {
    try {
      await ensureSettingsTable();
      const [result] = await db.query(
        `
          INSERT INTO settings ("key", "value")
          VALUES (?, ?)
          ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value"
        `,
        [key, value]
      );
      return result.affectedRows > 0 || result.insertId > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      await ensureSettingsTable();
      const [result] = await db.query("DELETE FROM settings WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async deleteByKey(key) {
    try {
      await ensureSettingsTable();
      const [result] = await db.query('DELETE FROM settings WHERE "key" = ?', [key]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

Setting.ensureSettingsTable = ensureSettingsTable;
module.exports = Setting;
