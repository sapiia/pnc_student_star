const db = require('../config/database');

let usersTableColumnsPromise = null;

const getUsersTableColumns = async () => {
  if (!usersTableColumnsPromise) {
    usersTableColumnsPromise = db
      .query("SHOW COLUMNS FROM users")
      .then(([rows]) => new Set(rows.map((row) => String(row.Field || '').trim())));
  }

  return usersTableColumnsPromise;
};

const buildDisplayNameSql = (alias, columns) => {
  if (columns.has('name')) {
    return `${alias}.name`;
  }

  const hasFirstName = columns.has('first_name');
  const hasLastName = columns.has('last_name');

  if (hasFirstName && hasLastName) {
    return `TRIM(CONCAT(COALESCE(${alias}.first_name, ''), ' ', COALESCE(${alias}.last_name, '')))`;
  }

  if (hasFirstName) {
    return `${alias}.first_name`;
  }

  if (hasLastName) {
    return `${alias}.last_name`;
  }

  return `${alias}.email`;
};

class Notification {
  static parsePayload(rawMessage = '') {
    const text = String(rawMessage || '').trim();

    // Default shape
    const result = {
      type: 'message',
      from_id: null,
      from_name: null,
      from_role: null,
      from_avatar: null,
      to_id: null,
      content: text,
    };

    // [DirectMessage] from=1; to=2; sender_name=Alice; text=Hello
    const directMatch = text.match(/^\[DirectMessage\]\s*from=(\d+);\s*to=(\d+);\s*sender_name=([^;]+);\s*text=(.*)$/i);
    if (directMatch) {
      result.type = 'message';
      result.from_id = Number(directMatch[1]);
      result.to_id = Number(directMatch[2]);
      result.from_name = directMatch[3].trim() || null;
      result.content = directMatch[4].trim();
      return result;
    }

    // [TeacherFeedback] { json }
    if (text.startsWith('[TeacherFeedback]')) {
      const json = text.replace(/^\[TeacherFeedback\]\s*/, '');
      try {
        const parsed = JSON.parse(json);
        result.type = 'message';
        result.from_id = Number(parsed.teacherId) || null;
        result.from_name = parsed.teacherName || null;
        result.from_role = 'Teacher';
        result.from_avatar = parsed.teacherProfile || null;
        result.content = parsed.text || 'Your teacher sent you feedback.';
        return result;
      } catch {
        return result;
      }
    }

    // [StudentReply] ...
    if (text.startsWith('[StudentReply]')) {
      result.type = 'message';
      return result;
    }

    // [Alert] ... (optional future)
    if (text.toLowerCase().startsWith('[alert]')) {
      result.type = 'alert';
      result.content = text.replace(/^\[alert\]\s*/i, '') || text;
      return result;
    }

    return result;
  }

  static decorate(rows = []) {
    return rows.map((row) => {
      const parsed = this.parsePayload(row.message);
      return {
        ...row,
        type: parsed.type,
        from_id: parsed.from_id,
        from_name: parsed.from_name || row.user_name || 'Unknown',
        from_role: parsed.from_role || 'Student',
        from_avatar: parsed.from_avatar || row.user_profile_image || null,
        to_id: parsed.to_id || null,
        content: parsed.content,
      };
    });
  }

  static async buildBaseSelectSql() {
    const columns = await getUsersTableColumns();
    const displayNameSql = buildDisplayNameSql('u', columns);
    const profileImageSelect = columns.has('profile_image')
      ? ', u.profile_image AS user_profile_image'
      : '';

    return `
      SELECT
        n.*,
        COALESCE(NULLIF(${displayNameSql}, ''), u.email) AS user_name
        ${profileImageSelect}
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
    `;
  }

  static async findAll() {
    try {
      const sql = `
        ${await this.buildBaseSelectSql()}
        ORDER BY n.created_at DESC
      `;
      const [rows] = await db.query(sql);
      return this.decorate(rows);
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const sql = `
        ${await this.buildBaseSelectSql()}
        WHERE n.id = ?
      `;
      const [rows] = await db.query(sql, [id]);
      const decorated = this.decorate(rows);
      return decorated[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const sql = `
        ${await this.buildBaseSelectSql()}
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
      `;
      const [rows] = await db.query(sql, [userId]);
      return this.decorate(rows);
    } catch (error) {
      throw error;
    }
  }

  static async findStudentReplyThread(studentId, teacherId) {
    try {
      const [rows] = await db.query(`
        SELECT id, user_id, message, is_read, created_at, updated_at
        FROM notifications
        WHERE user_id = ?
          AND message LIKE '[StudentReply]%'
        ORDER BY created_at ASC
      `, [teacherId]);

      const parsedRows = rows
        .map((row) => {
          const text = String(row.message || '').trim();
          const match = text.match(/^\[StudentReply\]\s+feedback_id=(\d+);\s*student_id=(\d+);\s*student_name=(.*?);\s*message=(.*)$/);
          if (!match) return null;

          const parsedStudentId = Number(match[2]);
          if (parsedStudentId !== Number(studentId)) return null;

          return {
            id: Number(row.id),
            user_id: Number(row.user_id),
            feedback_id: Number(match[1]),
            student_id: parsedStudentId,
            student_name: String(match[3] || 'Student').trim() || 'Student',
            reply_message: String(match[4] || '').trim(),
            is_read: Number(row.is_read) === 1 ? 1 : 0,
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
        })
        .filter(Boolean);

      return parsedRows;
    } catch (error) {
      throw error;
    }
  }

  static async findUnreadByUserId(userId) {
    try {
      const sql = `
        ${await this.buildBaseSelectSql()}
        WHERE n.user_id = ? AND n.is_read = 0
        ORDER BY n.created_at DESC
      `;
      const [rows] = await db.query(sql, [userId]);
      return this.decorate(rows);
    } catch (error) {
      throw error;
    }
  }

  static async create(notificationData) {
    try {
      const { user_id, message, is_read } = notificationData;
      const sql = "INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, ?)";
      const [result] = await db.query(sql, [user_id, message, is_read || 0]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, notificationData) {
    try {
      const { message, is_read } = notificationData;
      const sql = "UPDATE notifications SET message = ?, is_read = ? WHERE id = ?";
      const [result] = await db.query(sql, [message, is_read, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async markAsRead(id) {
    try {
      const [result] = await db.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    try {
      const [result] = await db.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [userId]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query("DELETE FROM notifications WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Notification;
