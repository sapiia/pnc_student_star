const db = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const saltRounds = 10;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const INVITE_SECRET = process.env.INVITE_SECRET || 'change-this-invite-secret';
const INVITE_EXPIRES_HOURS = Number(process.env.INVITE_EXPIRES_HOURS || 72);
const ADMIN_INVITER_EMAIL = process.env.ADMIN_INVITER_EMAIL || 'moeurnsophy55@gmail.com';

const normalizeRole = (role = '') => role.toString().trim().toLowerCase();

const splitFullName = (fullName = '') => {
  const cleaned = fullName.toString().trim().replace(/\s+/g, ' ');
  if (!cleaned) {
    return { firstName: '', lastName: '' };
  }
  const parts = cleaned.split(' ');
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ')
  };
};

const getUsersTableColumns = async () => {
  const [rows] = await db.query("SHOW COLUMNS FROM users");
  return new Set(rows.map((row) => row.Field));
};

const insertUserFlexible = async ({
  fullName,
  email,
  hashedPassword,
  role,
  classValue,
  gender
}) => {
  const columns = await getUsersTableColumns();
  const insertColumns = [];
  const insertValues = [];
  const placeholders = [];

  if (columns.has('name')) {
    insertColumns.push('name');
    insertValues.push(fullName);
    placeholders.push('?');
  } else {
    const { firstName, lastName } = splitFullName(fullName);
    if (columns.has('first_name')) {
      insertColumns.push('first_name');
      insertValues.push(firstName);
      placeholders.push('?');
    }
    if (columns.has('last_name')) {
      insertColumns.push('last_name');
      insertValues.push(lastName);
      placeholders.push('?');
    }
  }

  if (columns.has('gender') && ['male', 'female'].includes((gender || '').toString().toLowerCase())) {
    insertColumns.push('gender');
    insertValues.push(gender.toString().toLowerCase());
    placeholders.push('?');
  }

  insertColumns.push('email', 'password', 'role');
  insertValues.push(email, hashedPassword, role);
  placeholders.push('?', '?', '?');

  if (columns.has('class')) {
    insertColumns.push('class');
    insertValues.push(classValue || null);
    placeholders.push('?');
  }

  const sql = `INSERT INTO users (${insertColumns.join(', ')}) VALUES (${placeholders.join(', ')})`;
  const [result] = await db.query(sql, insertValues);
  return result;
};

const updateUserFlexibleById = async ({
  userId,
  fullName,
  hashedPassword,
  role,
  classValue,
  gender
}) => {
  const columns = await getUsersTableColumns();
  const updates = [];
  const values = [];

  if (columns.has('name')) {
    updates.push('name = ?');
    values.push(fullName);
  } else {
    const { firstName, lastName } = splitFullName(fullName);
    if (columns.has('first_name')) {
      updates.push('first_name = ?');
      values.push(firstName);
    }
    if (columns.has('last_name')) {
      updates.push('last_name = ?');
      values.push(lastName);
    }
  }

  if (columns.has('gender') && ['male', 'female'].includes((gender || '').toString().toLowerCase())) {
    updates.push('gender = ?');
    values.push(gender.toString().toLowerCase());
  }

  updates.push('password = ?', 'role = ?');
  values.push(hashedPassword, role);

  if (columns.has('class')) {
    updates.push('class = ?');
    values.push(classValue || null);
  }

  if (updates.length === 0) {
    return;
  }

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  values.push(userId);
  await db.query(sql, values);
};

const createInviteToken = (payload) => {
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', INVITE_SECRET)
    .update(payloadBase64)
    .digest('base64url');
  return `${payloadBase64}.${signature}`;
};

const verifyInviteToken = (token = '') => {
  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payloadBase64, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', INVITE_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
};

const createEmailTransporter = () => {
  const {
    SMTP_HOST = 'smtp.gmail.com',
    SMTP_PORT = '587',
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE = 'false'
  } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    return {
      transporter: null,
      isConfigured: false
    };
  }

  return {
    transporter: nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    }),
    isConfigured: true
  };
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Create new user
const createUser = async (req, res) => {
  const { name, gender, email, password, role, class_name } = req.body;

  try {
    const normalizedRole = normalizeRole(role);

    if (!['student', 'teacher', 'admin'].includes(normalizedRole)) {
      return res.status(400).json({ error: "Invalid role. Use student, teacher, or admin." });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "A user with this email already exists." });
    }

    const result = await insertUserFlexible({
      fullName: (name || '').toString().trim() || email,
      email,
      hashedPassword,
      role: normalizedRole,
      classValue: class_name || null,
      gender
    });

    res.status(201).json({ 
      message: "User created successfully", 
      userId: result.insertId 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  const { name, email, role, class_name } = req.body;
  
  try {
    const normalizedRole = normalizeRole(role);
    if (!['student', 'teacher', 'admin'].includes(normalizedRole)) {
      return res.status(400).json({ error: "Invalid role. Use student, teacher, or admin." });
    }

    const sql = "UPDATE users SET name = ?, email = ?, role = ?, class = ? WHERE id = ?";
    await db.query(sql, [name, email, normalizedRole, class_name || null, req.params.id]);
    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Send invite to user email
const inviteUser = async (req, res) => {
  const { firstName, lastName, name, gender, email, role, generation, className, studentId } = req.body;
  const normalizedFirstName = (firstName || '').toString().trim();
  const normalizedLastName = (lastName || '').toString().trim();
  const normalizedName = (name || `${normalizedFirstName} ${normalizedLastName}` || '').toString().trim();
  const normalizedGender = (gender || '').toString().trim().toLowerCase();
  const normalizedEmail = (email || '').toString().trim().toLowerCase();
  const normalizedRole = normalizeRole(role);
  const generationValue = (generation || '').toString().trim();
  const classValue = (className || '').toString().trim();
  const studentIdValue = (studentId || '').toString().trim();

  if (!normalizedEmail) {
    return res.status(400).json({ error: "Email is required." });
  }
  if (!normalizedFirstName) {
    return res.status(400).json({ error: "First name is required." });
  }
  if (!['male', 'female'].includes(normalizedGender)) {
    return res.status(400).json({ error: "Gender must be male or female." });
  }

  if (!['student', 'teacher', 'admin'].includes(normalizedRole)) {
    return res.status(400).json({ error: "Invalid role. Use admin, teacher, or student." });
  }

  if (normalizedRole === 'student') {
    if (generationValue && !['2026', '2027'].includes(generationValue)) {
      return res.status(400).json({ error: "Generation must be 2026 or 2027 when provided." });
    }

    if (studentIdValue) {
      if (!/^(2026|2027)-\d{3}$/.test(studentIdValue)) {
        return res.status(400).json({ error: "Student ID must match YYYY-XXX (example: 2026-001)." });
      }
      if (generationValue && !studentIdValue.startsWith(`${generationValue}-`)) {
        return res.status(400).json({ error: "Student ID year must match generation." });
      }
    }
  }

  try {
    const { transporter, isConfigured } = createEmailTransporter();

    const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ? LIMIT 1", [normalizedEmail]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "A user with this email already exists." });
    }

    const payload = {
      firstName: normalizedFirstName,
      lastName: normalizedLastName || null,
      name: normalizedName,
      gender: normalizedGender,
      email: normalizedEmail,
      role: normalizedRole,
      generation: normalizedRole === 'student' && generationValue ? generationValue : null,
      className: normalizedRole === 'student' && classValue ? classValue : null,
      studentId: normalizedRole === 'student' && studentIdValue ? studentIdValue : null,
      exp: Date.now() + INVITE_EXPIRES_HOURS * 60 * 60 * 1000
    };

    const tempPassword = crypto.randomBytes(18).toString('base64url');
    const hashedTempPassword = await bcrypt.hash(tempPassword, saltRounds);
    const classForUser = normalizedRole === 'student' && generationValue && classValue
      ? `Gen ${generationValue} - Class ${classValue}`
      : null;

    await insertUserFlexible({
      fullName: normalizedName,
      email: normalizedEmail,
      hashedPassword: hashedTempPassword,
      role: normalizedRole,
      classValue: classForUser,
      gender: normalizedGender
    });

    const token = createInviteToken(payload);
    const inviteLink = `${FRONTEND_URL}/register?invite=${encodeURIComponent(token)}`;
    const loginLink = `${FRONTEND_URL}/`;
    const roleLabel = normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
    const roleDashboardPath = normalizedRole === 'admin'
      ? '/admin/dashboard'
      : normalizedRole === 'teacher'
        ? '/teacher/dashboard'
        : '/dashboard';

    const text = [
      `You are invited to join PNC Student Star as ${roleLabel}.`,
      '',
      'Please complete your registration using this link:',
      inviteLink,
      '',
      'After completing registration, login here:',
      loginLink,
      '',
      `After login, you will be redirected to: ${roleDashboardPath}`,
      '',
      `This link expires in ${INVITE_EXPIRES_HOURS} hours.`
    ].join('\n');

    const html = `
      <p>You are invited to join <strong>PNC Student Star</strong> as <strong>${roleLabel}</strong>.</p>
      <p>Please complete your registration using the link below:</p>
      <p><a href="${inviteLink}">${inviteLink}</a></p>
      <p>After completing registration, login here:</p>
      <p><a href="${loginLink}">${loginLink}</a></p>
      <p>After login, you will be redirected to: <strong>${roleDashboardPath}</strong>.</p>
      <p>This link expires in ${INVITE_EXPIRES_HOURS} hours.</p>
    `;

    if (isConfigured && transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || ADMIN_INVITER_EMAIL,
        replyTo: ADMIN_INVITER_EMAIL,
        to: normalizedEmail,
        subject: 'PNC Student Star Invitation',
        text,
        html
      });
    }

    return res.status(200).json({
      message: isConfigured
        ? "Invitation email sent successfully."
        : "SMTP is not configured. Invitation preview generated; no email was sent.",
      preview: {
        to: normalizedEmail,
        from: process.env.SMTP_FROM || ADMIN_INVITER_EMAIL,
        subject: "PNC Student Star Invitation",
        text,
        inviteLink,
        loginLink,
        roleDashboardPath,
        smtpConfigured: isConfigured
      },
      smtpConfigured: isConfigured
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to send invite email." });
  }
};

// Validate invite token before registration
const validateInvite = async (req, res) => {
  const token = (req.query.token || '').toString();
  const payload = verifyInviteToken(token);

  if (!payload) {
    return res.status(400).json({ error: "Invalid or expired invite link." });
  }

  return res.json({
    firstName: payload.firstName,
    lastName: payload.lastName,
    name: payload.name,
    gender: payload.gender,
    email: payload.email,
    role: payload.role,
    generation: payload.generation,
    className: payload.className,
    studentId: payload.studentId,
    expiresAt: payload.exp
  });
};

// Complete account registration from invite token
const completeInviteRegistration = async (req, res) => {
  const { token, name, password } = req.body;
  const payload = verifyInviteToken((token || '').toString());

  if (!payload) {
    return res.status(400).json({ error: "Invalid or expired invite link." });
  }

  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const email = payload.email;
  const role = payload.role;

  try {
    const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const classValue = role === 'student' && payload.generation && payload.className
      ? `Gen ${payload.generation} - Class ${payload.className}`
      : null;
    const invitedFullName = `${payload.firstName || ''} ${payload.lastName || ''}`.trim();
    const resolvedName = (name || '').toString().trim() || invitedFullName || payload.name || email.split('@')[0];
    let userId;

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      await updateUserFlexibleById({
        userId,
        fullName: resolvedName,
        hashedPassword,
        role,
        classValue,
        gender: payload.gender
      });
    } else {
      const result = await insertUserFlexible({
        fullName: resolvedName,
        email,
        hashedPassword,
        role,
        classValue,
        gender: payload.gender
      });
      userId = result.insertId;
    }

    const redirectPath = role === 'admin'
      ? '/admin/dashboard'
      : role === 'teacher'
        ? '/teacher/dashboard'
        : '/dashboard';

    return res.status(201).json({
      message: "Registration completed successfully.",
      userId,
      redirectPath
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to complete registration." });
  }
};

// Login user and provide role-based redirect path
const loginUser = async (req, res) => {
  const email = (req.body.email || '').toString().trim().toLowerCase();
  const password = (req.body.password || '').toString();

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = rows[0];
    const normalizedRole = normalizeRole(user.role);
    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(user.password || '');

    const passwordMatches = isBcryptHash
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const redirectPath = normalizedRole === 'admin'
      ? '/admin/dashboard'
      : normalizedRole === 'teacher'
        ? '/teacher/dashboard'
        : '/dashboard';

    const fallbackName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    const resolvedName = user.name || fallbackName || user.email;

    return res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        name: resolvedName,
        email: user.email,
        role: normalizedRole,
        class: user.class,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      redirectPath
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to login." });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  inviteUser,
  validateInvite,
  completeInviteRegistration
};
