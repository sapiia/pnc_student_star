const db = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const XLSX = require('xlsx');
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
  gender,
  queryExecutor = db
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
  const [result] = await queryExecutor.query(sql, insertValues);
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

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const normalizeGender = (gender = '') => gender.toString().trim().toLowerCase();

const normalizeInviteInput = (inviteInput = {}) => {
  const {
    firstName,
    lastName,
    name,
    gender,
    email,
    role,
    generation,
    className,
    studentId,
    inviterName,
    inviterEmail
  } = inviteInput;

  const normalizedFirstName = (firstName || '').toString().trim();
  const normalizedLastName = (lastName || '').toString().trim();
  const normalizedName = (name || `${normalizedFirstName} ${normalizedLastName}` || '').toString().trim();
  const normalizedGender = normalizeGender(gender);
  const normalizedEmail = (email || '').toString().trim().toLowerCase();
  const normalizedRole = normalizeRole(role);
  const generationValue = (generation || '').toString().trim();
  const classValue = (className || '').toString().trim();
  const studentIdValue = (studentId || '').toString().trim();
  const inviterNameValue = (inviterName || '').toString().trim();
  const inviterEmailValue = (inviterEmail || '').toString().trim().toLowerCase();

  if (!normalizedEmail) {
    throw createHttpError(400, 'Email is required.');
  }
  if (!normalizedFirstName) {
    throw createHttpError(400, 'First name is required.');
  }
  if (!['male', 'female', 'other'].includes(normalizedGender)) {
    throw createHttpError(400, 'Gender must be male, female, or other.');
  }
  if (!['student', 'teacher', 'admin'].includes(normalizedRole)) {
    throw createHttpError(400, 'Invalid role. Use admin, teacher, or student.');
  }

  if (normalizedRole === 'student') {
    if (generationValue && !['2026', '2027'].includes(generationValue)) {
      throw createHttpError(400, 'Generation must be 2026 or 2027 when provided.');
    }

    if (studentIdValue) {
      if (!/^(2026|2027)-\d{3}$/.test(studentIdValue)) {
        throw createHttpError(400, 'Student ID must match YYYY-XXX (example: 2026-001).');
      }
      if (generationValue && !studentIdValue.startsWith(`${generationValue}-`)) {
        throw createHttpError(400, 'Student ID year must match generation.');
      }
    }
  }

  return {
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    name: normalizedName,
    gender: normalizedGender,
    email: normalizedEmail,
    role: normalizedRole,
    generation: generationValue,
    className: classValue,
    studentId: studentIdValue,
    inviterName: inviterNameValue,
    inviterEmail: inviterEmailValue
  };
};

const buildInvitedUserSummary = (normalizedInvite) => {
  const userGroup = normalizedInvite.role === 'student'
    ? normalizedInvite.generation && normalizedInvite.className
      ? `Gen ${normalizedInvite.generation} - Class ${normalizedInvite.className}`
      : 'Pending Class Assignment'
    : normalizedInvite.role === 'teacher'
      ? 'Teaching Staff'
      : 'Administration';

  return {
    name: normalizedInvite.name,
    firstName: normalizedInvite.firstName,
    lastName: normalizedInvite.lastName,
    email: normalizedInvite.email,
    role: normalizedInvite.role,
    gender: normalizedInvite.gender,
    generation: normalizedInvite.role === 'student' ? normalizedInvite.generation || null : null,
    className: normalizedInvite.role === 'student' ? normalizedInvite.className || null : null,
    studentId: normalizedInvite.role === 'student' ? normalizedInvite.studentId || null : null,
    group: userGroup
  };
};

const buildInviteArtifacts = async (normalizedInvite, options = {}) => {
  const {
    firstName,
    lastName,
    name,
    gender,
    email,
    role,
    generation,
    className,
    studentId,
    inviterName,
    inviterEmail
  } = normalizedInvite;

  const payload = {
    firstName,
    lastName: lastName || null,
    name,
    gender,
    email,
    role,
    generation: role === 'student' && generation ? generation : null,
    className: role === 'student' && className ? className : null,
    studentId: role === 'student' && studentId ? studentId : null,
    exp: Date.now() + INVITE_EXPIRES_HOURS * 60 * 60 * 1000
  };

  const tempPassword = options.tempPassword || crypto.randomBytes(18).toString('base64url');
  const hashedTempPassword = await bcrypt.hash(tempPassword, saltRounds);
  const classForUser = role === 'student' && generation && className
    ? `Gen ${generation} - Class ${className}`
    : null;

  const token = createInviteToken(payload);
  const inviteLink = `${FRONTEND_URL}/register?invite=${encodeURIComponent(token)}`;
  const loginLink = `${FRONTEND_URL}/`;
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const inviterIdentity = inviterName
    ? inviterEmail
      ? `${inviterName} (${inviterEmail})`
      : inviterName
    : inviterEmail || ADMIN_INVITER_EMAIL;
  const roleDashboardPath = role === 'admin'
    ? '/admin/dashboard'
    : role === 'teacher'
      ? '/teacher/dashboard'
      : '/dashboard';

  const text = [
    `You are invited to join PNC Student Star as ${roleLabel}.`,
    `Invited by: ${inviterIdentity}`,
    '',
    'Temporary password (for first login):',
    tempPassword,
    '',
    'Please complete your registration using this link:',
    inviteLink,
    '',
    'After registration, use this email and temporary password to log in (you can change it later).',
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
    <p><strong>Invited by:</strong> ${inviterIdentity}</p>
    <p><strong>Temporary password (for first login):</strong> <code>${tempPassword}</code></p>
    <p>Please complete your registration using the link below:</p>
    <p><a href="${inviteLink}">${inviteLink}</a></p>
    <p>After registration, use this email and temporary password to log in (you can change it later).</p>
    <p>After completing registration, login here:</p>
    <p><a href="${loginLink}">${loginLink}</a></p>
    <p>After login, you will be redirected to: <strong>${roleDashboardPath}</strong>.</p>
    <p>This link expires in ${INVITE_EXPIRES_HOURS} hours.</p>
  `;

  return {
    classForUser,
    hashedTempPassword,
    emailMessage: {
      to: email,
      subject: 'PNC Student Star Invitation',
      text,
      html
    },
    roleDashboardPath,
    temporaryPassword: tempPassword,
    preview: {
      to: email,
      from: process.env.SMTP_FROM || ADMIN_INVITER_EMAIL,
      subject: 'PNC Student Star Invitation',
      text,
      inviteLink,
      loginLink,
      temporaryPassword: tempPassword,
      invitedBy: inviterIdentity,
      roleDashboardPath,
      smtpConfigured: false
    },
    invitedUser: buildInvitedUserSummary(normalizedInvite)
  };
};

const sendInviteForUser = async (inviteInput, options = {}) => {
  const normalizedInvite = normalizeInviteInput(inviteInput || {});
  const queryExecutor = options.queryExecutor || db;
  const [existingUsers] = await queryExecutor.query("SELECT id FROM users WHERE email = ? LIMIT 1", [normalizedInvite.email]);
  if (existingUsers.length > 0) {
    throw createHttpError(409, 'A user with this email already exists.');
  }

  if (options.validateOnly) {
    return {
      validatedRow: {
        firstName: normalizedInvite.firstName,
        lastName: normalizedInvite.lastName,
        email: normalizedInvite.email,
        gender: normalizedInvite.gender,
        role: normalizedInvite.role,
        generation: normalizedInvite.role === 'student' ? normalizedInvite.generation || null : null,
        className: normalizedInvite.role === 'student' ? normalizedInvite.className || null : null,
        studentId: normalizedInvite.role === 'student' ? normalizedInvite.studentId || null : null,
        inviterName: normalizedInvite.inviterName || undefined,
        inviterEmail: normalizedInvite.inviterEmail || undefined
      },
      invitedUser: buildInvitedUserSummary(normalizedInvite)
    };
  }

  const transportInfo = options.transportInfo || createEmailTransporter();
  const { transporter, isConfigured } = transportInfo;
  const artifacts = await buildInviteArtifacts(normalizedInvite);

  await insertUserFlexible({
    fullName: normalizedInvite.name,
    email: normalizedInvite.email,
    hashedPassword: artifacts.hashedTempPassword,
    role: normalizedInvite.role,
    classValue: artifacts.classForUser,
    gender: ['male', 'female'].includes(normalizedInvite.gender) ? normalizedInvite.gender : undefined,
    queryExecutor
  });

  if (isConfigured && transporter && !options.skipSendEmail) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || ADMIN_INVITER_EMAIL,
      replyTo: ADMIN_INVITER_EMAIL,
      to: artifacts.emailMessage.to,
      subject: artifacts.emailMessage.subject,
      text: artifacts.emailMessage.text,
      html: artifacts.emailMessage.html
    });
  }

  return {
    message: isConfigured
      ? 'Invitation email sent successfully.'
      : 'SMTP is not configured. Invitation preview generated; no email was sent.',
    preview: {
      ...artifacts.preview,
      smtpConfigured: isConfigured
    },
    smtpConfigured: isConfigured,
    invitedUser: artifacts.invitedUser
  };
};

const normalizeHeaderKey = (value = '') =>
  value.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const pickValueByAliases = (row, aliases) => {
  const normalized = new Map(
    Object.entries(row || {}).map(([key, val]) => [normalizeHeaderKey(key), val])
  );
  for (const alias of aliases) {
    const match = normalized.get(normalizeHeaderKey(alias));
    if (match !== undefined && match !== null) {
      return match.toString().trim();
    }
  }
  return '';
};

const parseBulkInviteRowsFromBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return [];
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

  return rows.map((row, index) => ({
    rowNumber: index + 2,
    payload: {
      firstName: pickValueByAliases(row, ['First Name', 'FirstName']),
      lastName: pickValueByAliases(row, ['Last Name', 'LastName']),
      email: pickValueByAliases(row, ['Email Address', 'Email']),
      gender: pickValueByAliases(row, ['Gender (Male/Female/Other)', 'Gender']),
      role: pickValueByAliases(row, ['Role (Student/Teacher/Admin)', 'Role']),
      generation: pickValueByAliases(row, ['Generation (e.g., 2026)', 'Generation']),
      className: pickValueByAliases(row, ['Class (e.g., A)', 'Class']),
      studentId: pickValueByAliases(row, ['Student ID (Format: YYYY-XXX)', 'Student ID', 'StudentId'])
    }
  }));
};

const validateBulkInviteRows = async (rows, options = {}) => {
  const queryExecutor = options.queryExecutor || db;
  const seenEmailsInFile = new Set();
  const validRows = [];
  const errors = [];

  for (const row of rows) {
    const rowEmail = (row.payload.email || '').toString().trim().toLowerCase();
    if (!rowEmail) {
      errors.push({ row: row.rowNumber, email: '', error: 'Email is required.' });
      continue;
    }
    if (seenEmailsInFile.has(rowEmail)) {
      errors.push({ row: row.rowNumber, email: rowEmail, error: 'Duplicate email in uploaded file.' });
      continue;
    }
    seenEmailsInFile.add(rowEmail);

    try {
      const result = await sendInviteForUser(row.payload, { validateOnly: true, queryExecutor });
      validRows.push({
        row: row.rowNumber,
        payload: result.validatedRow,
        invitedUser: result.invitedUser
      });
    } catch (err) {
      errors.push({
        row: row.rowNumber,
        email: rowEmail,
        error: err.message || 'Failed to validate this row.'
      });
    }
  }

  return { validRows, errors };
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
  try {
    const result = await sendInviteForUser(req.body || {});
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || 'Failed to send invite email.' });
  }
};

const commitBulkInviteRows = async (rows) => {
  if (!rows.length) {
    return {
      message: 'No rows to process.',
      summary: { totalRows: 0, invitedCount: 0, failedCount: 0, smtpConfigured: false },
      invited: [],
      errors: []
    };
  }

  const connection = await db.getConnection();
  const transportInfo = createEmailTransporter();
  const invited = [];
  const errors = [];

  try {
    await connection.beginTransaction();

    const seenEmailsInPayload = new Set();
    const normalizedRows = [];

    for (let idx = 0; idx < rows.length; idx += 1) {
      const sourceRow = rows[idx] || {};
      const rowNumber = Number(sourceRow.row || idx + 2);
      const payload = sourceRow.payload || sourceRow;
      const normalizedEmail = (payload.email || '').toString().trim().toLowerCase();

      if (!normalizedEmail) {
        errors.push({ row: rowNumber, email: '', error: 'Email is required.' });
        continue;
      }
      if (seenEmailsInPayload.has(normalizedEmail)) {
        errors.push({ row: rowNumber, email: normalizedEmail, error: 'Duplicate email in request payload.' });
        continue;
      }
      seenEmailsInPayload.add(normalizedEmail);

      try {
        const validated = await sendInviteForUser(payload, { validateOnly: true, queryExecutor: connection });
        normalizedRows.push({ row: rowNumber, payload: validated.validatedRow });
      } catch (err) {
        errors.push({ row: rowNumber, email: normalizedEmail, error: err.message || 'Row validation failed.' });
      }
    }

    if (errors.length > 0) {
      await connection.rollback();
      return {
        message: `Validation failed: ${errors.length} row(s) have errors. No users were inserted.`,
        summary: {
          totalRows: rows.length,
          invitedCount: 0,
          failedCount: errors.length,
          smtpConfigured: transportInfo.isConfigured
        },
        invited: [],
        errors
      };
    }

    for (const row of normalizedRows) {
      try {
        const result = await sendInviteForUser(row.payload, {
          queryExecutor: connection,
          transportInfo,
          skipSendEmail: true
        });
        invited.push({
          row: row.row,
          ...result.invitedUser,
          emailEnvelope: result.preview
        });
      } catch (err) {
        errors.push({
          row: row.row,
          email: row.payload.email,
          error: err.message || 'Failed to prepare invite.'
        });
      }
    }

    if (errors.length > 0) {
      await connection.rollback();
      return {
        message: `Invite preparation failed: ${errors.length} row(s) failed. No users were inserted.`,
        summary: {
          totalRows: rows.length,
          invitedCount: 0,
          failedCount: errors.length,
          smtpConfigured: transportInfo.isConfigured
        },
        invited: [],
        errors
      };
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  const emailErrors = [];
  if (transportInfo.isConfigured && transportInfo.transporter) {
    for (const row of invited) {
      try {
        await transportInfo.transporter.sendMail({
          from: process.env.SMTP_FROM || ADMIN_INVITER_EMAIL,
          replyTo: ADMIN_INVITER_EMAIL,
          to: row.emailEnvelope.to,
          subject: row.emailEnvelope.subject,
          text: row.emailEnvelope.text,
          html: row.emailEnvelope.html
        });
      } catch (err) {
        emailErrors.push({
          row: row.row,
          email: row.email,
          error: err.message || 'Failed to send email.'
        });
      }
    }
  }

  const invitedUsers = invited.map((row) => {
    const clean = { ...row };
    delete clean.emailEnvelope;
    return clean;
  });

  return {
    message: emailErrors.length > 0
      ? `Users inserted (${invitedUsers.length}) but ${emailErrors.length} email(s) failed to send.`
      : `Processed ${rows.length} rows: ${invitedUsers.length} invited, 0 failed.`,
    summary: {
      totalRows: rows.length,
      invitedCount: invitedUsers.length,
      failedCount: 0,
      smtpConfigured: transportInfo.isConfigured,
      emailFailedCount: emailErrors.length
    },
    invited: invitedUsers,
    errors: emailErrors
  };
};

// Validate uploaded Excel file for bulk invite (no insert)
const validateUsersBulkInvite = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: 'Please upload an Excel file (.xlsx or .xls).' });
  }

  let rows = [];
  try {
    rows = parseBulkInviteRowsFromBuffer(req.file.buffer);
  } catch (_err) {
    return res.status(400).json({ error: 'Invalid Excel file or unreadable sheet.' });
  }

  if (!rows.length) {
    return res.status(400).json({ error: 'No data rows found in the uploaded file.' });
  }
  if (rows.length > 500) {
    return res.status(400).json({ error: 'Maximum 500 rows per import.' });
  }

  const { validRows, errors } = await validateBulkInviteRows(rows);
  return res.status(200).json({
    message: errors.length > 0
      ? `Validation failed: ${errors.length} row(s) have errors.`
      : `Validation successful for ${validRows.length} rows.`,
    summary: {
      totalRows: rows.length,
      validCount: validRows.length,
      failedCount: errors.length
    },
    validRows,
    errors
  });
};

// Commit validated bulk rows: insert users + send invite emails
const commitUsersBulkInvite = async (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  if (!rows.length) {
    return res.status(400).json({ error: 'Rows are required for bulk commit.' });
  }
  if (rows.length > 500) {
    return res.status(400).json({ error: 'Maximum 500 rows per import.' });
  }

  try {
    const result = await commitBulkInviteRows(rows);
    const statusCode = result.summary.failedCount > 0 ? 400 : 200;
    return res.status(statusCode).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Failed to commit bulk invites.' });
  }
};

// Backward-compatible endpoint: validate + commit from uploaded Excel file
const inviteUsersBulk = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: 'Please upload an Excel file (.xlsx or .xls).' });
  }

  let rows = [];
  try {
    rows = parseBulkInviteRowsFromBuffer(req.file.buffer);
  } catch (_err) {
    return res.status(400).json({ error: 'Invalid Excel file or unreadable sheet.' });
  }

  if (!rows.length) {
    return res.status(400).json({ error: 'No data rows found in the uploaded file.' });
  }
  if (rows.length > 500) {
    return res.status(400).json({ error: 'Maximum 500 rows per import.' });
  }

  try {
    const result = await commitBulkInviteRows(rows);
    const statusCode = result.summary.failedCount > 0 ? 400 : 200;
    return res.status(statusCode).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Failed to process bulk invite.' });
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
    const resolvedName = fallbackName || user.email;

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
  inviteUsersBulk,
  validateUsersBulkInvite,
  commitUsersBulkInvite,
  validateInvite,
  completeInviteRegistration
};
