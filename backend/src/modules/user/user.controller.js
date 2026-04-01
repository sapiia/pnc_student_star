const db = require('../../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const saltRounds = 10;
const Notification = require('../notification/notification.model');
const User = require('./user.model');
const { emitNotificationEvent } = require('../../app/realtime');
const { uploadsDir } = require('../../config/paths');


const FRONTEND_URL = process.env.FRONTEND_URL
  || (process.env.NODE_ENV === 'production'
    ? 'https://pnc-student-star.vercel.app'
    : 'http://localhost:3000');
const PUBLIC_API_URL = (process.env.PUBLIC_API_URL || process.env.BACKEND_PUBLIC_URL || process.env.API_BASE_URL || process.env.APP_URL || '').toString().trim();
const INVITE_SECRET = process.env.INVITE_SECRET || 'change-this-invite-secret';
const INVITE_SECRET_FALLBACK = process.env.INVITE_SECRET_FALLBACK || 'change-this-invite-secret';
const inviteSecrets = Array.from(new Set(
  [INVITE_SECRET, INVITE_SECRET_FALLBACK, 'change-this-invite-secret'].filter(Boolean)
));
const INVITE_EXPIRES_HOURS = Number(process.env.INVITE_EXPIRES_HOURS || 72);
const ADMIN_INVITER_EMAIL = process.env.ADMIN_INVITER_EMAIL || 'moeurnsophy55@gmail.com';
const FORCE_HTTPS_HOSTS = ['pnc-student-star.onrender.com'];

const normalizeRole = (role = '') => role.toString().trim().toLowerCase();

const getRequestProtocol = (req) => {
  const forwardedProto = (req?.headers?.['x-forwarded-proto'] || '').toString().split(',')[0].trim();
  if (forwardedProto) return forwardedProto;
  return (req?.protocol || 'http').replace(':', '');
};

const buildPublicUrl = (req, relativePath = '') => {
  const baseFromEnv = PUBLIC_API_URL ? PUBLIC_API_URL.replace(/\/+$/, '') : '';
  const host = req?.get ? (req.get('host') || '') : '';
  const fallbackBase = host ? `${getRequestProtocol(req)}://${host}` : '';
  const baseUrl = baseFromEnv || fallbackBase;
  return `${baseUrl}${relativePath}`;
};

const ensureHttpsProfileImage = (urlString = '') => {
  const raw = (urlString || '').toString().trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw, PUBLIC_API_URL || undefined);
    if (FORCE_HTTPS_HOSTS.includes(parsed.hostname.toLowerCase()) && parsed.protocol === 'http:') {
      parsed.protocol = 'https:';
    }
    return parsed.toString();
  } catch (_err) {
    for (const host of FORCE_HTTPS_HOSTS) {
      const pattern = new RegExp(`^http://${host.replace(/\./g, '\\.')}`, 'i');
      if (pattern.test(raw)) {
        return raw.replace(/^http:/i, 'https:');
      }
    }
    return raw;
  }
};

const resolveProfileImageFilePath = (profileImageUrl = '') => {
  const rawValue = (profileImageUrl || '').toString().trim();
  if (!rawValue) return null;

  let pathname = rawValue;
  if (/^https?:\/\//i.test(rawValue)) {
    try {
      pathname = new URL(rawValue).pathname;
    } catch (error) {
      pathname = rawValue;
    }
  }

  if (!pathname.startsWith('/uploads/profiles/')) {
    return null;
  }

  const relativePath = pathname.replace(/^\/uploads\//, '');
  return path.join(uploadsDir, relativePath);
};

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

const getDisplayNameFromUserRow = (row = {}) => {
  const fullName = (row.name || '').toString().trim();
  if (fullName) return fullName;
  return [row.first_name, row.last_name].filter(Boolean).join(' ').trim();
};

const getUsersTableColumns = async () => {
  const [rows] = await db.query("SHOW COLUMNS FROM users");
  return new Set(rows.map((row) => row.Field));
};

const getRegistrationColumn = (columns = new Set()) => {
  if (columns.has('is_registered')) return 'is_registered';
  if (columns.has('is_register')) return 'is_register';
  return null;
};

const normalizeUserStatusForResponse = (userRow = {}, columns = new Set()) => {
  const hasIsDisable = columns.has('is_disable');
  const hasIsActive = columns.has('is_active');
  const hasIsDeleted = columns.has('is_deleted');
  const registrationColumn = getRegistrationColumn(columns);
  const hasIsRegistered = Boolean(registrationColumn);
  const registrationValue = hasIsRegistered ? userRow[registrationColumn] : undefined;

  const isDisabled = hasIsDisable
    ? Number(userRow.is_disable || 0) === 1
    : hasIsActive
      ? Number(userRow.is_active ?? 1) === 0
      : false;

  const isDeleted = hasIsDeleted ? Number(userRow.is_deleted || 0) === 1 : false;

  const isRegistered = hasIsRegistered
    ? Number(registrationValue || 0) === 1
    : (() => {
        const createdAt = userRow.created_at ? new Date(userRow.created_at).getTime() : NaN;
        const updatedAt = userRow.updated_at ? new Date(userRow.updated_at).getTime() : NaN;
        if (Number.isNaN(createdAt) || Number.isNaN(updatedAt)) return true;
        // Fallback heuristic: unchanged row after invite likely means registration not completed yet.
        return updatedAt - createdAt > 1000;
      })();

  const accountStatus = isDeleted
    ? 'deleted'
    : !isRegistered
      ? 'pending'
      : isDisabled
        ? 'inactive'
        : 'active';

  const normalizedProfileImage = ensureHttpsProfileImage(userRow.profile_image);

  return {
    ...userRow,
    profile_image: normalizedProfileImage,
    is_disable: isDisabled ? 1 : 0,
    is_deleted: isDeleted ? 1 : 0,
    is_registered: isRegistered ? 1 : 0,
    is_register: isRegistered ? 1 : 0,
    account_status: accountStatus,
    registration_status: isRegistered ? 'registered' : 'pending'
  };
};

const insertUserFlexible = async ({
  fullName,
  email,
  hashedPassword,
  role,
  classValue,
  studentIdValue,
  gender,
  major,
  generation,
  isRegistered,
  queryExecutor = db
}) => {
  const columns = await getUsersTableColumns();
  const registrationColumn = getRegistrationColumn(columns);
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

  if (columns.has('student_id')) {
    insertColumns.push('student_id');
    insertValues.push(studentIdValue || null);
    placeholders.push('?');
  }

  if (registrationColumn && typeof isRegistered !== 'undefined') {
    insertColumns.push(registrationColumn);
    insertValues.push(isRegistered ? 1 : 0);
    placeholders.push('?');
  }

  if (columns.has('major') && major) {
    insertColumns.push('major');
    insertValues.push(major);
    placeholders.push('?');
  }

  if (columns.has('generation') && generation) {
    insertColumns.push('generation');
    insertValues.push(generation);
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
  studentIdValue,
  gender,
  major,
  generation,
  isRegistered
}) => {
  const columns = await getUsersTableColumns();
  const registrationColumn = getRegistrationColumn(columns);
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

  if (columns.has('student_id')) {
    updates.push('student_id = ?');
    values.push(studentIdValue || null);
  }

  if (registrationColumn && typeof isRegistered !== 'undefined') {
    updates.push(`${registrationColumn} = ?`);
    values.push(isRegistered ? 1 : 0);
  }

  if (columns.has('major') && major !== undefined) {
    updates.push('major = ?');
    values.push(major);
  }

  if (columns.has('generation') && generation !== undefined) {
    updates.push('generation = ?');
    values.push(generation);
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

  const matchesAnySecret = inviteSecrets.some((secret) => {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');

    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSignature);

    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });

  if (!matchesAnySecret) {
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
    SMTP_SECURE = 'false',
    SMTP_TIMEOUT_MS = '10000'
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
      connectionTimeout: Number(SMTP_TIMEOUT_MS) || 10000,
      greetingTimeout: Number(SMTP_TIMEOUT_MS) || 10000,
      socketTimeout: Number(SMTP_TIMEOUT_MS) || 12000,
      // Force IPv4 to avoid ENETUNREACH on hosts that block IPv6 (common on cloud PaaS)
      family: 4,
      tls: { family: 4 },
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

const toFallbackNameFromEmail = (email = '') => {
  const local = (email || '').toString().trim().split('@')[0] || 'User';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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
    major,
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
  const majorValue = (major || '').toString().trim().toUpperCase();
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
    if (!studentIdValue) {
      throw createHttpError(400, 'Student ID is required when role is student.');
    }
    if (!/^\d{4}$/.test(generationValue)) {
      throw createHttpError(400, 'Generation must be a 4-digit year when role is student.');
    }
    if (!majorValue) {
      throw createHttpError(400, 'Major is required when role is student.');
    }

    if (studentIdValue) {
      if (!/^\d{4}-\d{3}$/.test(studentIdValue)) {
        throw createHttpError(400, 'Student ID must match YYYY-XXX (example: 2026-001).');
      }
      if (generationValue && !studentIdValue.startsWith(`${generationValue}-`)) {
        throw createHttpError(400, 'Student ID year must match generation.');
      }
    }
  }

  const normalizedClassValue = normalizedRole === 'student'
    ? (classValue || majorValue)
    : classValue;

  return {
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    name: normalizedName,
    gender: normalizedGender,
    email: normalizedEmail,
    role: normalizedRole,
    generation: generationValue,
    major: majorValue,
    className: normalizedClassValue,
    studentId: studentIdValue,
    inviterName: inviterNameValue,
    inviterEmail: inviterEmailValue
  };
};

const buildInvitedUserSummary = (normalizedInvite) => {
  const userGroup = normalizedInvite.role === 'student'
    ? normalizedInvite.generation
      ? `Gen ${normalizedInvite.generation}${normalizedInvite.major ? ` - ${normalizedInvite.major}` : ''}${normalizedInvite.className ? ` - Class ${normalizedInvite.className}` : ''}`
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
    major: normalizedInvite.role === 'student' ? normalizedInvite.major || null : null,
    className: normalizedInvite.role === 'student' ? normalizedInvite.className || null : null,
    studentId: normalizedInvite.role === 'student' ? normalizedInvite.studentId || null : null,
    group: userGroup
  };
};

const buildInviteArtifacts = async (normalizedInvite, options = {}) => {
  console.log('Building invite artifacts for:', normalizedInvite.email);

  const {
    firstName,
    lastName,
    name,
    gender,
    email,
    role,
    generation,
    major,
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
    major: role === 'student' && major ? major : null,
    className: role === 'student' ? (className || major || null) : null,
    studentId: role === 'student' && studentId ? studentId : null,
    exp: Date.now() + INVITE_EXPIRES_HOURS * 60 * 60 * 1000
  };

  const tempPassword = options.tempPassword || crypto.randomBytes(18).toString('base64url');
  const hashedTempPassword = await bcrypt.hash(tempPassword, saltRounds);
  const normalizedClassName = role === 'student' ? (className || major || '') : className;
  const classForUser = role === 'student' && generation
    ? `Gen ${generation}${major ? ` - ${major}` : ''}${normalizedClassName ? ` - Class ${normalizedClassName}` : ''}`
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
    'Welcome to PNC Student Star!',
    '',
    `Hello, you have been invited to join the PNC Student Star platform as a ${roleLabel}.`,
    'We are excited to have you as part of our community!',
    '',
    `Invited by: ${inviterIdentity}`,
    '',
    'To get started, please complete your registration by clicking the link below:',
    inviteLink,
    '',
    '--- Account Details ---',
    `Temporary Password (for your first login): ${tempPassword}`,
    '',
    'After registration, you can log in using your email and the temporary password provided above. You will be able to change your password after your first login.',
    '',
    'Login here after registration:',
    loginLink,
    '',
    `Redirected to: ${roleDashboardPath}`,
    '-----------------------',
    '',
    `This invitation link will expire in ${INVITE_EXPIRES_HOURS} hours.`,
    '',
    'Best regards,',
    'PNC Student Star Team'
  ].join('\n');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 25px;">
        <img src="cid:star_gmail_logo" style="width: 84px; height: 84px; border-radius: 50%; border: 4px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" alt="PNC Student Star Profile" />
      </div>
      <h2 style="color: #0f172a; margin-top: 0; text-align: center;">Welcome to PNC Student Star!</h2>
      <p>Hello,</p>
      <p>We are excited to invite you to join the <strong>PNC Student Star</strong> platform as <strong>${roleLabel}</strong>.</p>
      <p>Our community is growing, and we can't wait for you to explore all the features we have prepared for you.</p>
      
      <div style="margin: 25px 0; text-align: center;">
        <a href="${inviteLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Complete Your Registration</a>
      </div>

      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <p style="margin-top: 0; font-weight: bold;">Quick Access Details:</p>
        <p><strong>Invited by:</strong> ${inviterIdentity}</p>
        <p><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 2px 4px; border-radius: 4px;">${tempPassword}</code></p>
      </div>

      <p style="margin-top: 20px;">After registering, you can log in at <a href="${loginLink}">${loginLink}</a> using your email and the temporary password above. You will be able to set a new password during or after your first login.</p>
      
      <p style="color: #64748b; font-size: 0.875rem;">Note: This invitation link will expire in ${INVITE_EXPIRES_HOURS} hours.</p>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #64748b; font-size: 0.875rem;">Best regards,<br /><strong>PNC Student Star Team</strong></p>
    </div>
  `;

  const logoAttachment = {
    filename: '',
    path: path.join(uploadsDir, 'logo', ''),
    cid: 'star_gmail_logo'
  };

  return {
    classForUser,
    hashedTempPassword,
    emailMessage: {
      to: email,
      subject: 'PNC Student Star Invitation',
      text,
      html,
      attachments: [logoAttachment]
    },
    roleDashboardPath,
    temporaryPassword: tempPassword,
    preview: {
      to: email,
      from: process.env.SMTP_FROM || ADMIN_INVITER_EMAIL,
      subject: 'PNC Student Star Invitation',
      text,
      html,
      inviteLink,
      loginLink,
      temporaryPassword: tempPassword,
      invitedBy: inviterIdentity,
      roleDashboardPath,
      attachments: [logoAttachment],
      smtpConfigured: false
    },
    invitedUser: buildInvitedUserSummary(normalizedInvite)
  };
};

const sendInviteForUser = async (inviteInput, options = {}) => {
  console.log('Sending invite for user:', inviteInput.email, 'Options:', options);

  const normalizedInvite = normalizeInviteInput(inviteInput || {});
  // Use a dedicated transaction when none is provided so we can roll back the insert if email sending fails.
  const managedConnection = !options.queryExecutor ? await db.getConnection() : null;
  const queryExecutor = options.queryExecutor || managedConnection;

  const [existingUsers] = await queryExecutor.query("SELECT * FROM users WHERE email = ? LIMIT 1", [normalizedInvite.email]);
  if (existingUsers.length > 0) {
    const existingName = getDisplayNameFromUserRow(existingUsers[0] || {})
      || normalizedInvite.name
      || toFallbackNameFromEmail(normalizedInvite.email);
    const duplicateError = createHttpError(409, 'A user with this email already exists.');
    duplicateError.existingUserName = existingName;
    duplicateError.email = normalizedInvite.email;

    throw duplicateError;
  }

  if (options.validateOnly) {
    return {
      validatedRow: {
        firstName: normalizedInvite.firstName,
        lastName: normalizedInvite.lastName,
        name: normalizedInvite.name,
        email: normalizedInvite.email,
        gender: normalizedInvite.gender,
        role: normalizedInvite.role,
        generation: normalizedInvite.generation || null,
        major: normalizedInvite.major || null,
        className: normalizedInvite.className || null,
        studentId: normalizedInvite.studentId || null,
        inviterName: normalizedInvite.inviterName || undefined,
        inviterEmail: normalizedInvite.inviterEmail || undefined
      },
      invitedUser: buildInvitedUserSummary(normalizedInvite)
    };
  }

  const transportInfo = options.transportInfo || createEmailTransporter();
  const { transporter, isConfigured } = transportInfo;
  if (!isConfigured && !options.skipSendEmail) {
    throw createHttpError(503, 'Email delivery is not configured on the server. Please set SMTP_USER and SMTP_PASS (and related SMTP_*) environment variables.');
  }
  const artifacts = await buildInviteArtifacts(normalizedInvite);

  let insertedUserId = null;
  const shouldManageTransaction = Boolean(managedConnection);
  try {
    if (shouldManageTransaction) {
      await managedConnection.beginTransaction();
    }

    const insertResult = await insertUserFlexible({
      fullName: normalizedInvite.name,
      email: normalizedInvite.email,
      hashedPassword: artifacts.hashedTempPassword,
      role: normalizedInvite.role,
      classValue: artifacts.classForUser,
      studentIdValue: normalizedInvite.role === 'student' ? normalizedInvite.studentId || null : null,
      gender: ['male', 'female'].includes(normalizedInvite.gender) ? normalizedInvite.gender : undefined,
      major: normalizedInvite.role === 'student' ? normalizedInvite.major || null : null,
      generation: normalizedInvite.role === 'student' ? normalizedInvite.generation || null : null,
      isRegistered: false,
      queryExecutor
    });
    insertedUserId = insertResult?.insertId || null;

    if (isConfigured && transporter && !options.skipSendEmail) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"PNC Student Star" <${ADMIN_INVITER_EMAIL}>`,
        replyTo: ADMIN_INVITER_EMAIL,
        to: artifacts.emailMessage.to,
        subject: artifacts.emailMessage.subject,
        text: artifacts.emailMessage.text,
        html: artifacts.emailMessage.html,
        attachments: artifacts.emailMessage.attachments
      });
    }

    if (shouldManageTransaction) {
      await managedConnection.commit();
    }
  } catch (err) {
    if (shouldManageTransaction) {
      await managedConnection.rollback().catch((rollbackErr) => {
        console.warn('Rollback failed after invite error:', rollbackErr?.message || rollbackErr);
      });
    } else if (insertedUserId) {
      // Best-effort cleanup when using caller-provided executor without transaction.
      queryExecutor.query("DELETE FROM users WHERE id = ?", [insertedUserId]).catch((deleteErr) => {
        console.warn('Failed to roll back user after email error (no transaction):', deleteErr?.message || deleteErr);
      });
    }
    const emailError = createHttpError(502, err?.message || 'Failed to send invite email.');
    emailError.cause = err;
    throw emailError;
  } finally {
    if (managedConnection) {
      managedConnection.release();
    }
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
      major: pickValueByAliases(row, ['Major (SNA/WEB DEV)', 'Major']),
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
  const existingUsers = [];

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
      if (Number(err?.status) === 409) {
        const fallbackName = `${(row.payload.firstName || '').toString().trim()} ${(row.payload.lastName || '').toString().trim()}`.trim()
          || toFallbackNameFromEmail(rowEmail);
        existingUsers.push({
          row: row.rowNumber,
          email: rowEmail,
          name: (err.existingUserName || fallbackName || rowEmail).toString().trim()
        });
        continue;
      }
      errors.push({
        row: row.rowNumber,
        email: rowEmail,
        error: err.message || 'Failed to validate this row.'
      });
    }
  }

  return { validRows, errors, existingUsers };
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { sortBy, sortOrder } = req.query;
    const columns = await getUsersTableColumns();
    
    // Build ORDER BY clause based on sortBy parameter
    let orderByClause = 'ORDER BY u.created_at DESC';
    
    if (sortBy === 'generation') {
      const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
      // Try to extract generation from class field or use generation column directly
      if (columns.has('generation')) {
        orderByClause = `ORDER BY CAST(NULLIF(u.generation, '') AS INTEGER) ${order}, u.created_at DESC`;
      } else {
        // Fallback: try to extract from class field (e.g., "Gen 2026 - WEB A")
        orderByClause = `ORDER BY CAST(NULLIF(split_part(split_part(u.class, 'Gen ', 2), ' ', 1), '') AS INTEGER) ${order}, u.created_at DESC`;
      }
    } else if (sortBy === 'name') {
      const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
      if (columns.has('first_name') && columns.has('last_name')) {
        orderByClause = `ORDER BY u.first_name ${order}, u.last_name ${order}, u.created_at DESC`;
      } else {
        orderByClause = `ORDER BY u.name ${order}, u.created_at DESC`;
      }
    } else if (sortBy === 'created_at') {
      const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
      orderByClause = `ORDER BY u.created_at ${order}`;
    }

    try {
      const [rows] = await db.query(`
        SELECT
          u.*,
          COALESCE(NULLIF(u.student_id, ''), s.student_no) AS resolved_student_id
        FROM users u
        LEFT JOIN students s ON s.user_id = u.id
        ${orderByClause}
      `);
      return res.json(rows.map((row) => normalizeUserStatusForResponse(row, columns)));
    } catch (_err) {
      // Backward-compatible fallback when migrations/tables are not yet applied.
      const [rows] = await db.query(`SELECT * FROM users ${orderByClause.replace('u.', '')}`);
      return res.json(rows.map((row) => normalizeUserStatusForResponse(row, columns)));
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const columns = await getUsersTableColumns();
    try {
      const [rows] = await db.query(`
        SELECT
          u.*,
          COALESCE(NULLIF(u.student_id, ''), s.student_no) AS resolved_student_id
        FROM users u
        LEFT JOIN students s ON s.user_id = u.id
        WHERE u.id = ?
      `, [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(normalizeUserStatusForResponse(rows[0], columns));
    } catch (_err) {
      const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(normalizeUserStatusForResponse(rows[0], columns));
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Create new user
const createUser = async (req, res) => {
  const { name, gender, email, password, role, class_name, student_id } = req.body;

  try {
    const normalizedRole = normalizeRole(role);
    const normalizedStudentId = (student_id || '').toString().trim();

    if (!['student', 'teacher', 'admin'].includes(normalizedRole)) {
      return res.status(400).json({ error: "Invalid role. Use student, teacher, or admin." });
    }
    if (normalizedRole === 'student' && !normalizedStudentId) {
      return res.status(400).json({ error: "student_id is required when role is student." });
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
      studentIdValue: normalizedStudentId || null,
      gender,
      isRegistered: true
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
  const { name, email, role, class_name, className, student_id, gender, generation, major } = req.body;
  const userId = req.params.id;

  try {
    const normalizedRole = normalizeRole(role);
    const normalizedStudentId = (student_id || '').toString().trim();
    const generationValue = (generation || '').toString().trim();
    const majorValue = (major || '').toString().trim().toUpperCase();
    const classNameValue = (class_name || className || '').toString().trim();
    const normalizedClassName = normalizedRole === 'student'
      ? (classNameValue || majorValue)
      : classNameValue;
    const classForUser = normalizedRole === 'student' && generationValue
      ? `Gen ${generationValue}${majorValue ? ` - ${majorValue}` : ''}${normalizedClassName ? ` - Class ${normalizedClassName}` : ''}`
      : classNameValue || null;

    const normalizedGeneration = generationValue;
    if (!['student', 'teacher', 'admin'].includes(normalizedRole)) {
      return res.status(400).json({ error: "Invalid role. Use student, teacher, or admin." });
    }
    if (normalizedRole === 'student' && !normalizedStudentId) {
      return res.status(400).json({ error: "student_id is required when role is student." });
    }
    if (generationValue && !/^\d{4}$/.test(generationValue)) {
      return res.status(400).json({ error: "Generation must be a 4-digit year." });
    }

    // Get old user data to describe changes
    const [oldUserRows] = await db.query("SELECT first_name, last_name, email, role, class as class_name, student_id, gender, generation FROM users WHERE id = ?", [userId]);
    const oldUser = oldUserRows[0];

    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ');

    const columns = await getUsersTableColumns();
    const updates = ['first_name = ?', 'last_name = ?', 'email = ?', 'role = ?', 'class = ?', 'student_id = ?', 'gender = ?'];
    const values = [firstName, lastName, email, normalizedRole, classForUser, normalizedStudentId || null, gender || null];

    if (columns.has('generation')) {
      updates.push('generation = ?');
      values.push(generationValue || null);
    }
    if (columns.has('major')) {
      updates.push('major = ?');
      values.push(majorValue || null);
    }

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    values.push(userId);
    await db.query(sql, values);

    // Construct notification message
    if (oldUser) {
      let changes = [];
      const newClass = classForUser || null;
      const newStudentId = normalizedStudentId || null;
      const newGender = gender || null;
      const newGeneration = normalizedGeneration || null;
      
      if (oldUser.class_name !== newClass) changes.push(`Class: ${newClass || 'None'}`);
      if (oldUser.student_id !== newStudentId) changes.push(`Student ID: ${newStudentId || 'None'}`);
      if (oldUser.gender !== newGender) changes.push(`Gender: ${newGender || 'None'}`);
      if (oldUser.generation !== newGeneration) changes.push(`Generation: ${newGeneration || 'None'}`);
      
      if (changes.length > 0) {
        // Notify the updated user (e.g. the student)
        const updateMsg = `Admin updated your profile: ${changes.join(', ')}.`;
        const nId = await Notification.create({ user_id: userId, message: updateMsg, is_read: 0 });
        const [nRows] = await db.query("SELECT id, user_id, message, is_read, created_at FROM notifications WHERE id = ?", [nId]);
        
        if (nRows[0]) {
          emitNotificationEvent({ action: 'created', notification: nRows[0] });
        }

        // Output to all teachers if the updated user is a student
        if (normalizedRole === 'student') {
           const [teacherRows] = await db.query("SELECT id FROM users WHERE role = 'teacher'");
           const oldName = `${oldUser.first_name || ''} ${oldUser.last_name || ''}`.trim() || oldUser.email;
           const newName = name || oldName;
           const teacherMsg = `Admin updated profile for student ${newName} (${normalizedStudentId}): ${changes.join(', ')}.`;
           for (const tRow of teacherRows) {
               const tnId = await Notification.create({ user_id: tRow.id, message: teacherMsg, is_read: 0 });
               const [tnRows] = await db.query("SELECT id, user_id, message, is_read, created_at FROM notifications WHERE id = ?", [tnId]);
               if (tnRows[0]) emitNotificationEvent({ action: 'created', notification: tnRows[0] });
           }
        }
      }
    }

    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Failed to update user:", err);
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
  console.log('Starting commitBulkInviteRows with', rows.length, 'rows');

  if (!rows.length) {
    return {
      message: 'No rows to process.',
      summary: { totalRows: 0, invitedCount: 0, failedCount: 0, skippedExistingCount: 0, smtpConfigured: false },
      invited: [],
      existingUsers: [],
      errors: []
    };
  }

  const connection = await db.getConnection();
  const transportInfo = createEmailTransporter();
  if (!transportInfo.isConfigured) {
    connection.release();
    throw createHttpError(503, 'Email delivery is not configured on the server. Please set SMTP_USER and SMTP_PASS (and related SMTP_*) environment variables before sending invites.');
  }
  const invited = [];
  const errors = [];
  const skippedExistingUsers = [];

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
        if (Number(err?.status) === 409) {
          const fallbackName = `${(payload.firstName || '').toString().trim()} ${(payload.lastName || '').toString().trim()}`.trim()
            || toFallbackNameFromEmail(normalizedEmail);
          skippedExistingUsers.push({
            row: rowNumber,
            email: normalizedEmail,
            name: (err.existingUserName || fallbackName || normalizedEmail).toString().trim()
          });
          continue;
        }
        errors.push({ row: rowNumber, email: normalizedEmail, error: err.message || 'Row validation failed.' });
      }
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
        if (Number(err?.status) === 409) {
          skippedExistingUsers.push({
            row: row.row,
            email: row.payload.email,
            name: (err.existingUserName || toFallbackNameFromEmail(row.payload.email || '') || row.payload.email).toString().trim()
          });
          continue;
        }
        errors.push({
          row: row.row,
          email: row.payload.email,
          error: err.message || 'Failed to prepare invite.'
        });
      }
    }

    if (invited.length === 0 && errors.length > 0) {
      await connection.rollback();
      return {
        message: `Bulk invite failed: No valid users to invite. ${errors.length} row(s) had errors.`,
        summary: {
          totalRows: rows.length,
          invitedCount: 0,
          failedCount: errors.length,
          skippedExistingCount: skippedExistingUsers.length,
          smtpConfigured: transportInfo.isConfigured
        },
        invited: [],
        existingUsers: skippedExistingUsers,
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
          from: process.env.SMTP_FROM || `"PNC Student Star" <${ADMIN_INVITER_EMAIL}>`,
          replyTo: ADMIN_INVITER_EMAIL,
          to: row.emailEnvelope.to,
          subject: row.emailEnvelope.subject,
          text: row.emailEnvelope.text,
          html: row.emailEnvelope.html,
          attachments: row.emailEnvelope.attachments
        });
      } catch (err) {
        console.error('Failed to send invite email to:', row.email, err);
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

  // Count email delivery failures as part of the failed total so callers can treat them as errors.
  const totalFailedCount = errors.length + emailErrors.length;
  const emailFailedCount = emailErrors.length;
  const existingUsers = Array.from(
    skippedExistingUsers.reduce((map, row) => {
      const key = (row.email || '').toString().trim().toLowerCase();
      if (!key || map.has(key)) return map;
      map.set(key, {
        row: row.row,
        email: key,
        name: (row.name || toFallbackNameFromEmail(key) || key).toString().trim()
      });
      return map;
    }, new Map())
  ).map((entry) => entry[1]);

  return {
    message: emailErrors.length > 0
      ? `Users inserted (${invitedUsers.length}), skipped ${existingUsers.length + errors.length} user(s), but ${emailErrors.length} email(s) failed to send.`
      : `Processed ${rows.length} rows: ${invitedUsers.length} invited, ${existingUsers.length + errors.length} skipped or failed.`,
    summary: {
      totalRows: rows.length,
      invitedCount: invitedUsers.length,
      failedCount: totalFailedCount,
      skippedExistingCount: existingUsers.length,
      smtpConfigured: transportInfo.isConfigured,
      emailFailedCount
    },
    invited: invitedUsers,
    existingUsers,
    errors: [...errors, ...emailErrors]
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

  const { validRows, errors, existingUsers } = await validateBulkInviteRows(rows);
  const skippedExistingCount = Array.isArray(existingUsers) ? existingUsers.length : 0;
  return res.status(200).json({
    message: errors.length > 0
      ? `Validation failed: ${errors.length} row(s) have errors.`
      : skippedExistingCount > 0
        ? `Validation successful for ${validRows.length} rows. Skipped ${skippedExistingCount} existing user(s).`
        : `Validation successful for ${validRows.length} rows.`,
    summary: {
      totalRows: rows.length,
      validCount: validRows.length,
      failedCount: errors.length,
      skippedExistingCount
    },
    validRows,
    existingUsers: existingUsers || [],
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
    // If any email fails to send, surface an error so the UI does not show a false success.
    const statusCode = (result.summary.failedCount > 0 || (result.summary.emailFailedCount || 0) > 0)
      ? 400
      : 200;
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
    const statusCode = (result.summary.failedCount > 0 || (result.summary.emailFailedCount || 0) > 0)
      ? 400
      : 200;
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
    const studentClassName = role === 'student'
      ? ((payload.className || payload.major || '').toString().trim())
      : '';
    const classValue = role === 'student' && payload.generation
      ? `Gen ${payload.generation} - Class ${studentClassName || 'Unassigned'}`
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
        studentIdValue: role === 'student' ? payload.studentId || null : null,
        gender: payload.gender,
        isRegistered: true
      });
    } else {
      const result = await insertUserFlexible({
        fullName: resolvedName,
        email,
        hashedPassword,
        role,
        classValue,
        studentIdValue: role === 'student' ? payload.studentId || null : null,
        gender: payload.gender,
        isRegistered: true
      });
      userId = result.insertId;
    }

    const redirectPath = role === 'admin'
      ? '/admin/dashboard'
      : role === 'teacher'
        ? '/teacher/dashboard'
        : '/dashboard';

    const [userRows] = await db.query("SELECT * FROM users WHERE id = ? LIMIT 1", [userId]);
    const user = userRows[0] || null;
    const columns = await getUsersTableColumns();
    const normalizedRole = normalizeRole(role);
    const fallbackName = user ? [user.first_name, user.last_name].filter(Boolean).join(' ').trim() : '';
    const responseName = user ? (fallbackName || user.email) : payload.name || payload.email;

    return res.status(201).json({
      message: "Registration completed successfully.",
      userId,
      user: user ? {
        id: user.id,
        name: responseName,
        email: user.email,
        profile_image: columns.has('profile_image') ? ensureHttpsProfileImage(user.profile_image) : null,
        role: normalizedRole,
        class: user.class,
        student_id: user.student_id || null,
        created_at: user.created_at,
        updated_at: user.updated_at
      } : null,
      redirectPath
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to complete registration." });
  }
};

// Get profile for a specific user
const getUserProfile = async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Invalid user id." });
  }

  try {
    const columns = await getUsersTableColumns();
    const hasStudentId = columns.has('student_id');
    const hasClass = columns.has('class');
    const [rows] = await db.query(`
      SELECT
        u.*,
        COALESCE(NULLIF(u.student_id, ''), st.student_no) AS resolved_student_id,
        s.value AS department
      FROM users u
      LEFT JOIN students st ON st.user_id = u.id
      LEFT JOIN settings s ON s.key = CONCAT('profile_department_', u.id)
      WHERE u.id = ?
      LIMIT 1
    `, [userId]);

    if (!rows.length) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = rows[0];
    return res.json({
      id: user.id,
      name: getDisplayNameFromUserRow(user) || user.email,
      first_name: (user.first_name || '').toString().trim() || null,
      last_name: (user.last_name || '').toString().trim() || null,
      email: user.email,
      profile_image: columns.has('profile_image') ? ensureHttpsProfileImage(user.profile_image) : null,
      role: normalizeRole(user.role),
      department: (user.department || '').toString().trim(),
      student_id: hasStudentId ? ((user.student_id || user.resolved_student_id || '') || null) : null,
      class: hasClass ? (user.class || null) : null,
      is_active: Number(user.is_active ?? 1),
      is_deleted: Number(user.is_deleted ?? 0),
      created_at: user.created_at,
      updated_at: user.updated_at
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to load profile." });
  }
};

// Update profile for a specific user
const updateUserProfile = async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Invalid user id." });
  }

  const email = (req.body.email || '').toString().trim().toLowerCase();
  const firstNameInput = (req.body.first_name || '').toString().trim();
  const lastNameInput = (req.body.last_name || '').toString().trim();
  const fullNameInput = (req.body.name || '').toString().trim();
  const fullName = fullNameInput || `${firstNameInput} ${lastNameInput}`.trim();
  const hasProfileImageInput = typeof req.body.profile_image !== 'undefined';
  const profileImageInput = hasProfileImageInput
    ? (req.body.profile_image || '').toString().trim()
    : null;
  const normalizedProfileImageInput = hasProfileImageInput ? ensureHttpsProfileImage(profileImageInput) : null;
  const department = (req.body.department || '').toString().trim();

  if (!fullName) {
    return res.status(400).json({ error: "First name is required." });
  }
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    const columns = await getUsersTableColumns();
    const hasIsDeleted = columns.has('is_deleted');
    const existingUserSql = hasIsDeleted
      ? "SELECT id, role, is_deleted FROM users WHERE id = ? LIMIT 1"
      : "SELECT id, role FROM users WHERE id = ? LIMIT 1";
    const [existingUserRows] = await db.query(existingUserSql, [userId]);
    if (!existingUserRows.length) {
      return res.status(404).json({ error: "User not found." });
    }
    if (hasIsDeleted && Number(existingUserRows[0].is_deleted) === 1) {
      return res.status(409).json({ error: "Cannot update a deleted user." });
    }

    const [emailRows] = await db.query("SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1", [email, userId]);
    if (emailRows.length > 0) {
      return res.status(409).json({ error: "Email is already in use by another account." });
    }

    const updates = [];
    const values = [];

    if (columns.has('name')) {
      updates.push('name = ?');
      values.push(fullName);
    } else {
      const fallback = splitFullName(fullName);
      const firstName = firstNameInput || fallback.firstName;
      const lastName = typeof req.body.last_name !== 'undefined' ? lastNameInput : fallback.lastName;
      if (columns.has('first_name')) {
        updates.push('first_name = ?');
        values.push(firstName || fullName);
      }
      if (columns.has('last_name')) {
        updates.push('last_name = ?');
        values.push(lastName || null);
      }
    }

    updates.push('email = ?', 'updated_at = CURRENT_TIMESTAMP()');
    values.push(email);

    if (columns.has('profile_image') && hasProfileImageInput) {
      updates.push('profile_image = ?');
      values.push(normalizedProfileImageInput || null);
    }

    values.push(userId);

    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const departmentKey = `profile_department_${userId}`;
    if (department) {
      await db.query(
        'INSERT INTO settings ("key", "value") VALUES (?, ?) ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", updated_at = CURRENT_TIMESTAMP',
        [departmentKey, department]
      );
    } else {
      await db.query('DELETE FROM settings WHERE "key" = ?', [departmentKey]);
    }

    const [rows] = await db.query(`
      SELECT
        u.*,
        COALESCE(NULLIF(u.student_id, ''), st.student_no) AS resolved_student_id,
        s.value AS department
      FROM users u
      LEFT JOIN students st ON st.user_id = u.id
      LEFT JOIN settings s ON s.key = CONCAT('profile_department_', u.id)
      WHERE u.id = ?
      LIMIT 1
    `, [userId]);
    const user = rows[0];

    return res.json({
      message: "Profile updated successfully.",
      user: {
        id: user.id,
        name: getDisplayNameFromUserRow(user) || user.email,
        first_name: (user.first_name || '').toString().trim() || null,
        last_name: (user.last_name || '').toString().trim() || null,
        email: user.email,
        profile_image: columns.has('profile_image') ? ensureHttpsProfileImage(user.profile_image) : null,
        role: normalizeRole(user.role),
        department: (user.department || '').toString().trim(),
        student_id: columns.has('student_id') ? ((user.student_id || user.resolved_student_id || '') || null) : null,
        class: columns.has('class') ? (user.class || null) : null,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to update profile." });
  }
};

// Update profile image for a specific user
const updateUserProfileImage = async (req, res) => {
  const userId = Number(req.params.id);
  
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Invalid user id." });
  }
  if (!req.file) {
    return res.status(400).json({ error: "Image file is required." });
  }

  try {
    const columns = await getUsersTableColumns();
    if (!columns.has('profile_image')) {
      return res.status(400).json({ error: "Column profile_image does not exist in users table." });
    }

    const hasIsDeleted = columns.has('is_deleted');
    const userCheckSql = hasIsDeleted
      ? "SELECT id, is_deleted, profile_image FROM users WHERE id = ? LIMIT 1"
      : "SELECT id, profile_image FROM users WHERE id = ? LIMIT 1";
    const [existingRows] = await db.query(userCheckSql, [userId]);
    if (!existingRows.length) {
      return res.status(404).json({ error: "User not found." });
    }
    if (hasIsDeleted && Number(existingRows[0].is_deleted || 0) === 1) {
      return res.status(409).json({ error: "Cannot update profile image for a deleted user." });
    }

    const previousProfileImage = (existingRows[0].profile_image || '').toString().trim() || null;
    const previousProfileImagePath = resolveProfileImageFilePath(previousProfileImage);

    const relativePath = `/uploads/profiles/${req.file.filename}`;
    const publicUrl = ensureHttpsProfileImage(buildPublicUrl(req, relativePath));

    await db.query(
      "UPDATE users SET profile_image = ?, updated_at = CURRENT_TIMESTAMP() WHERE id = ?",
      [publicUrl, userId]
    );

    const [rows] = await db.query("SELECT * FROM users WHERE id = ? LIMIT 1", [userId]);
    const user = rows[0];

    // Remove old profile image after successful update (ignore missing files).
    if (previousProfileImagePath && previousProfileImagePath !== req.file.path) {
      fs.promises.unlink(previousProfileImagePath).catch((error) => {
        if (error?.code !== 'ENOENT') {
          console.warn('Failed to remove old profile image:', error.message || error);
        }
      });
    }

    return res.json({
      message: "Profile image updated successfully.",
      user: {
        id: user.id,
        name: getDisplayNameFromUserRow(user) || user.email,
        email: user.email,
        role: normalizeRole(user.role),
        profile_image: ensureHttpsProfileImage(user.profile_image),
        student_id: columns.has('student_id') ? (user.student_id || null) : null,
        updated_at: user.updated_at
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to update profile image." });
  }
};

// Change password for a specific user
const changeUserPassword = async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Invalid user id." });
  }

  const currentPassword = (req.body.current_password || '').toString();
  const newPassword = (req.body.new_password || '').toString();

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current password and new password are required." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters." });
  }

  try {
    const columns = await getUsersTableColumns();
    const hasIsDeleted = columns.has('is_deleted');
    const userPasswordSql = hasIsDeleted
      ? "SELECT id, password, is_deleted FROM users WHERE id = ? LIMIT 1"
      : "SELECT id, password FROM users WHERE id = ? LIMIT 1";
    const [rows] = await db.query(userPasswordSql, [userId]);
    if (!rows.length) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = rows[0];
    if (hasIsDeleted && Number(user.is_deleted) === 1) {
      return res.status(409).json({ error: "Cannot update password for a deleted user." });
    }

    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(user.password || '');
    const currentMatches = isBcryptHash
      ? await bcrypt.compare(currentPassword, user.password)
      : user.password === currentPassword;

    if (!currentMatches) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: "New password must be different from current password." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await db.query(
      "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP() WHERE id = ?",
      [hashedPassword, userId]
    );

    return res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to change password." });
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
    const columns = await getUsersTableColumns();
    const hasIsDeleted = columns.has('is_deleted');
    const hasIsDisable = columns.has('is_disable');
    const hasIsActive = columns.has('is_active');
    const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = rows[0];
    const normalizedRole = normalizeRole(user.role);
    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(user.password || '');

    if (hasIsDeleted && Number(user.is_deleted) === 1) {
      return res.status(403).json({ error: "This account has been deleted." });
    }
    const isDisabled = hasIsDisable
      ? Number(user.is_disable || 0) === 1
      : hasIsActive
        ? Number(user.is_active ?? 1) === 0
        : false;
    if (isDisabled) {
      return res.status(403).json({ error: "This account is disabled." });
    }

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
        profile_image: columns.has('profile_image') ? ensureHttpsProfileImage(user.profile_image) : null,
        role: normalizedRole,
        class: user.class,
        student_id: user.student_id || null,
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

// Enable/disable user account
const setUserActive = async (req, res) => {
  const { is_active } = req.body || {};
  if (typeof is_active === 'undefined') {
    return res.status(400).json({ error: "is_active is required." });
  }

  try {
    const columns = await getUsersTableColumns();
    const hasIsDeleted = columns.has('is_deleted');
    const hasIsDisable = columns.has('is_disable');
    const hasIsActive = columns.has('is_active');
    const setClauses = [];
    const values = [];

    if (hasIsActive) {
      setClauses.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }
    if (hasIsDisable) {
      setClauses.push('is_disable = ?');
      values.push(is_active ? 0 : 1);
    }

    if (!is_active) {
      const [userRow] = await db.query("SELECT role FROM users WHERE id = ?", [req.params.id]);
      if (userRow.length > 0 && userRow[0].role === 'admin') {
        const [activeAdmins] = await db.query("SELECT id FROM users WHERE role = 'admin' AND is_active = 1 AND (is_deleted IS NULL OR is_deleted = 0)");
        if (activeAdmins.length <= 1) {
          return res.status(403).json({ error: "Cannot disable the only active administrative account." });
        }
      }
    }

    setClauses.push('updated_at = CURRENT_TIMESTAMP()');
    let sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;
    values.push(req.params.id);

    if (hasIsDeleted) {
      sql += ' AND (is_deleted IS NULL OR is_deleted = 0)';
    }

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: hasIsDeleted ? "User not found or already deleted." : "User not found." });
    }

    return res.json({ message: is_active ? "User enabled successfully." : "User disabled successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to update user status." });
  }
};

// Enable/disable all students in a generation
const setGenerationActive = async (req, res) => {
  const { is_active } = req.body || {};
  const generation = String(req.params.generation || '').trim();

  if (!generation || !/^\d{4}$/.test(generation)) {
    return res.status(400).json({ error: "Valid generation is required (YYYY)." });
  }
  if (typeof is_active === 'undefined') {
    return res.status(400).json({ error: "is_active is required." });
  }

  try {
    const columns = await getUsersTableColumns();
    const hasIsDeleted = columns.has('is_deleted');
    const hasIsDisable = columns.has('is_disable');
    const hasIsActive = columns.has('is_active');
    const hasGeneration = columns.has('generation');

    const setClauses = [];
    const values = [];

    if (hasIsActive) {
      setClauses.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }
    if (hasIsDisable) {
      setClauses.push('is_disable = ?');
      values.push(is_active ? 0 : 1);
    }

    setClauses.push('updated_at = CURRENT_TIMESTAMP()');

    let where = "role = 'student'";
    if (hasGeneration) {
      where += " AND (generation = ? OR class LIKE ?)";
      values.push(generation, `%${generation}%`);
    } else {
      where += " AND class LIKE ?";
      values.push(`%${generation}%`);
    }

    if (hasIsDeleted) {
      where += " AND (is_deleted IS NULL OR is_deleted = 0)";
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: "No status columns available to update." });
    }

    const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE ${where}`;
    const [result] = await db.query(sql, values);

    return res.json({
      message: is_active ? `Generation ${generation} enabled successfully.` : `Generation ${generation} disabled successfully.`,
      affectedRows: result.affectedRows
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to update generation status." });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Invalid user id." });
  }

  try {
    const columns = await getUsersTableColumns();
    const profileImageRowSql = columns.has('profile_image')
      ? "SELECT profile_image FROM users WHERE id = ? LIMIT 1"
      : "SELECT NULL AS profile_image FROM users WHERE id = ? LIMIT 1";
    const [profileRows] = await db.query(profileImageRowSql, [userId]);
    const previousProfileImage = (profileRows[0]?.profile_image || '').toString().trim() || null;
    const previousProfileImagePath = resolveProfileImageFilePath(previousProfileImage);

    const hasIsDeleted = columns.has('is_deleted');
    const hasIsActive = columns.has('is_active');
    const hasIsDisable = columns.has('is_disable');
    const hasDeletedAt = columns.has('deleted_at');

    const setClauses = [];
    const values = [];
    if (hasIsDeleted) {
      setClauses.push('is_deleted = 1');
    }
    if (hasIsActive) {
      setClauses.push('is_active = 0');
    }
    if (hasIsDisable) {
      setClauses.push('is_disable = 1');
    }
    if (hasDeletedAt) {
      setClauses.push('deleted_at = CURRENT_TIMESTAMP()');
    }
    setClauses.push('updated_at = CURRENT_TIMESTAMP()');

    let sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;
    values.push(userId);
    if (hasIsDeleted) {
      sql += ' AND (is_deleted IS NULL OR is_deleted = 0)';
    }

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      const [existing] = await db.query(
        hasIsDeleted ? "SELECT id, is_deleted FROM users WHERE id = ? LIMIT 1" : "SELECT id FROM users WHERE id = ? LIMIT 1",
        [userId]
      );
      if (existing.length === 0) {
        return res.status(404).json({ error: "User not found." });
      }
      if (hasIsDeleted) {
        return res.status(409).json({ error: "User is already deleted." });
      }
      return res.status(409).json({ error: "User is already disabled." });
    }

    if (previousProfileImagePath) {
      fs.promises.unlink(previousProfileImagePath).catch((error) => {
        if (error?.code !== 'ENOENT') {
          console.warn('Failed to remove profile image on delete:', error.message || error);
        }
      });
    }

    return res.json({ message: "User deleted (archived) successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to delete user." });
  }
};

// Permanent individual delete
const hardDeleteUser = async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Invalid user id." });
  }

  try {
    const columns = await getUsersTableColumns();
    const profileImageRowSql = columns.has('profile_image')
      ? "SELECT profile_image, role FROM users WHERE id = ? LIMIT 1"
      : "SELECT NULL AS profile_image, role FROM users WHERE id = ? LIMIT 1";
    const [profileRows] = await db.query(profileImageRowSql, [userId]);
    const previousProfileImage = (profileRows[0]?.profile_image || '').toString().trim() || null;
    const previousProfileImagePath = resolveProfileImageFilePath(previousProfileImage);

    // Prevent hard-deleting the only admin? (Optional safety)
    if (profileRows.length > 0 && profileRows[0].role === 'admin') {
      const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin'");
      if (admins.length <= 1) {
        return res.status(403).json({ error: "Cannot delete the only administrative account." });
      }
    }

    // Clean up dependent records to satisfy foreign key constraints
    // 1) Gather evaluation ids for this user
    const [evaluationRows] = await db.query(
      "SELECT id FROM evaluations WHERE user_id = ?",
      [userId]
    );
    const evaluationIds = evaluationRows.map((row) => row.id);

    if (evaluationIds.length > 0) {
      const placeholders = evaluationIds.map(() => '?').join(', ');
      // Delete feedbacks linked to those evaluations
      await db.query(`DELETE FROM feedbacks WHERE evaluation_id IN (${placeholders})`, evaluationIds);
      // Delete evaluation responses
      await db.query(`DELETE FROM evaluation_responses WHERE evaluation_id IN (${placeholders})`, evaluationIds);
      // Delete evaluations
      await db.query(`DELETE FROM evaluations WHERE id IN (${placeholders})`, evaluationIds);
    }

    // Remove feedbacks where this user is teacher or student
    await db.query("DELETE FROM feedbacks WHERE teacher_id = ? OR student_id = ?", [userId, userId]);

    // Remove any meeting schedules referencing this user (as student or staff)
    try {
      await db.query(
        "DELETE FROM meeting_schedule WHERE student_id = ? OR education_officer_id = ? OR manager_id = ?",
        [userId, userId, userId]
      );
    } catch (err) {
      console.warn('Skipping meeting_schedule cleanup on hard delete:', err.message || err);
    }

    // Remove student profile rows linked to this user (if students table exists)
    try {
      await db.query("DELETE FROM students WHERE user_id = ?", [userId]);
    } catch (err) {
      console.warn('Skipping students cleanup on hard delete:', err.message || err);
    }

    // Remove notifications for this user (best-effort; table may not exist in older schemas)
    try {
      await db.query("DELETE FROM notifications WHERE user_id = ?", [userId]);
    } catch (err) {
      console.warn('Skipping notifications cleanup on hard delete:', err.message || err);
    }

    const [result] = await db.query("DELETE FROM users WHERE id = ?", [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    if (previousProfileImagePath) {
      fs.promises.unlink(previousProfileImagePath).catch((error) => {
        if (error?.code !== 'ENOENT') {
          console.warn('Failed to remove profile image on hard delete:', error.message || error);
        }
      });
    }

    return res.json({ message: "User permanently deleted from database." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to permanently delete user." });
  }
};

// Delete all users (soft delete/archive)
const deleteAllUsers = async (req, res) => {
  try {
    const columns = await getUsersTableColumns();
    const hasIsDeleted = columns.has('is_deleted');
    const hasIsActive = columns.has('is_active');
    const hasIsDisable = columns.has('is_disable');
    const hasDeletedAt = columns.has('deleted_at');

    const setClauses = [];
    if (hasIsDeleted) {
      setClauses.push('is_deleted = 1');
    }
    if (hasIsActive) {
      setClauses.push('is_active = 0');
    }
    if (hasIsDisable) {
      setClauses.push('is_disable = 1');
    }
    if (hasDeletedAt) {
      setClauses.push('deleted_at = CURRENT_TIMESTAMP()');
    }
    setClauses.push('updated_at = CURRENT_TIMESTAMP()');

    let sql = `UPDATE users SET ${setClauses.join(', ')}`;
    if (hasIsDeleted) {
      sql += ' WHERE is_deleted IS NULL OR is_deleted = 0';
    } else if (hasIsDisable) {
      sql += ' WHERE is_disable IS NULL OR is_disable = 0';
    }

    const [result] = await db.query(sql);

    return res.json({
      message: result.affectedRows === 0
        ? "No active users to delete."
        : `${result.affectedRows} users deleted (archived) successfully.`,
      affectedRows: result.affectedRows
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to delete users." });
  }
};

// Disable all users
const disableAllUsers = async (req, res) => {
  try {
    const [result] = await db.query("UPDATE users SET is_active = 0, is_disable = 1, updated_at = CURRENT_TIMESTAMP() WHERE (is_deleted IS NULL OR is_deleted = 0)");
    return res.json({ message: `${result.affectedRows} users disabled successfully.`, affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to disable users." });
  }
};

// Get teacher's assigned classes
const getTeacherClasses = async (req, res) => {
  try {
    const teacherId = req.params.teacherId || req.user?.id;
    const classes = await User.getTeacherClasses(teacherId);
    return res.json(classes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to get teacher classes." });
  }
};

// Get students by class for teacher reports
const getStudentsByClass = async (req, res) => {
  try {
    const { class: className } = req.params;
    const students = await User.getStudentsByClass(className);
    return res.json(students);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to get students." });
  }
};

// Get all students for teacher
const getTeacherStudents = async (req, res) => {
  try {
    const teacherId = req.params.teacherId || req.user?.id;
    const students = await User.getTeacherStudents(teacherId);
    return res.json(students);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to get teacher students." });
  }
};

// Hard delete non-admin users
const hardDeleteAllUsers = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM users WHERE role <> 'admin'");
    return res.json({ message: `${result.affectedRows} non-admin users permanently deleted.`, affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to hard-delete users." });
  }
};

// Normalize class strings (mirrors frontend cleanClassInput)
const normalizeClassForComparison = (value = '', generationHint = '') => {
  const raw = (value ?? '').toString();
  let result = raw.trim();
  const gen = generationHint.toString().trim();
  if (gen) {
    const genToken = new RegExp(`\\b(gen\\s*)?${gen}\\b`, 'gi');
    result = result.replace(genToken, '');
  }
  result = result
    .replace(/\s*-\s*/g, ' - ')
    .replace(/(^\s*-\s*|\s*-\s*$)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return result.toUpperCase();
};

const extractGenerationFromClass = (classValue = '') => {
  const normalized = (classValue ?? '').toString();
  const match = normalized.match(/20\d{2}/);
  return match ? match[0] : '';
};

const buildCanonicalClassName = (generation = '', normalizedClass = '') => {
  const tokens = normalizedClass
    .split('-')
    .map((t) => t.trim())
    .filter(Boolean);

  const major = tokens[0] ? tokens[0].replace(/^CLASS\s*/i, '') : '';
  const section = tokens.length > 1
    ? tokens[tokens.length - 1].replace(/^CLASS\s*/i, '')
    : '';

  if (!generation) {
    return normalizedClass || null;
  }

  const parts = [`Gen ${generation}`];
  if (major) parts.push(major);
  if (section) parts.push(`Class ${section}`);
  return parts.join(' - ');
};

// Update class name for all students in a class
const updateClassNameForStudents = async (req, res) => {
  try {
    const { oldClassName, newClassName } = req.body || {};

    if (!oldClassName || !newClassName) {
      return res.status(400).json({ error: "Both oldClassName and newClassName are required." });
    }

    const generationFromNew = extractGenerationFromClass(newClassName);
    const normalizedOld = normalizeClassForComparison(oldClassName, generationFromNew);
    const normalizedNew = normalizeClassForComparison(newClassName, generationFromNew);

    if (!normalizedNew) {
      return res.status(400).json({ error: "New class name cannot be empty." });
    }
    if (normalizedOld === normalizedNew) {
      return res.status(400).json({ error: "New class name must be different from the old class name." });
    }

    const columns = await getUsersTableColumns();
    const hasIsDeleted = columns.has('is_deleted');

    // Fetch candidate students and match by normalized value to avoid format mismatch between UI and DB
    const whereClauses = ["role = 'student'"];
    const whereParams = [];
    if (hasIsDeleted) {
      whereClauses.push("(is_deleted IS NULL OR is_deleted = 0)");
    }
    const [rows] = await db.query(
      `SELECT id, class FROM users WHERE ${whereClauses.join(' AND ')}`,
      whereParams
    );

    const matchedIds = [];
    let generationResolved = generationFromNew;

    rows.forEach((row) => {
      const rowGeneration = extractGenerationFromClass(row.class);
      const normalizedRowClass = normalizeClassForComparison(row.class, generationFromNew || rowGeneration);
      if (normalizedRowClass === normalizedOld) {
        matchedIds.push(row.id);
        if (!generationResolved && rowGeneration) {
          generationResolved = rowGeneration;
        }
      }
    });

    if (matchedIds.length === 0) {
      return res.status(404).json({ error: "No students found matching the current class name." });
    }

    const canonicalNewClass = buildCanonicalClassName(generationResolved, normalizedNew);
    if (!canonicalNewClass) {
      return res.status(400).json({ error: "Unable to build a valid class name from the provided value." });
    }

    const placeholders = matchedIds.map(() => '?').join(', ');
    const [result] = await db.query(
      `UPDATE users SET class = ?, updated_at = CURRENT_TIMESTAMP() WHERE id IN (${placeholders})`,
      [canonicalNewClass, ...matchedIds]
    );

    return res.json({
      message: "Class name updated successfully.",
      affectedRows: result.affectedRows,
      oldClassName,
      newClassName: canonicalNewClass
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to update class name." });
  }
};

// Update a single student's class
const updateStudentClass = async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const { newClassName, generation } = req.body || {};

    if (!Number.isInteger(studentId) || studentId <= 0) {
      return res.status(400).json({ error: "Invalid student id." });
    }
    if (!newClassName) {
      return res.status(400).json({ error: "newClassName is required." });
    }

    const [rows] = await db.query("SELECT id, role, class FROM users WHERE id = ? LIMIT 1", [studentId]);
    if (!rows.length) {
      return res.status(404).json({ error: "User not found." });
    }
    if (normalizeRole(rows[0].role) !== 'student') {
      return res.status(400).json({ error: "Only students can be reassigned to a class." });
    }

    const generationHint = generation || extractGenerationFromClass(newClassName) || extractGenerationFromClass(rows[0].class);
    const normalizedNew = normalizeClassForComparison(newClassName, generationHint);
    if (!normalizedNew) {
      return res.status(400).json({ error: "newClassName cannot be empty after normalization." });
    }

    const canonicalNewClass = buildCanonicalClassName(generationHint, normalizedNew) || normalizedNew;

    const [result] = await db.query(
      "UPDATE users SET class = ?, updated_at = CURRENT_TIMESTAMP() WHERE id = ?",
      [canonicalNewClass, studentId]
    );

    return res.json({
      message: "Student class updated successfully.",
      affectedRows: result.affectedRows,
      studentId,
      newClassName: canonicalNewClass
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to update student class." });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserProfile,
  createUser,
  updateUser,
  updateUserProfile,
  updateUserProfileImage,
  changeUserPassword,
  deleteUser,
  hardDeleteUser,
  deleteAllUsers,
  hardDeleteAllUsers,
  disableAllUsers,
  setUserActive,
  setGenerationActive,
  loginUser,
  inviteUser,
  inviteUsersBulk,
  validateUsersBulkInvite,
  commitUsersBulkInvite,
  validateInvite,
  completeInviteRegistration,
  getTeacherClasses,
  getStudentsByClass,
  getTeacherStudents,
  updateClassNameForStudents,
  updateStudentClass
};
