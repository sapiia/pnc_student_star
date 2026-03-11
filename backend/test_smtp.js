require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSmtp() {
  const {
    SMTP_HOST = 'smtp.gmail.com',
    SMTP_PORT = '587',
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE = 'false'
  } = process.env;

  console.log('Testing SMTP with:', {
    host: SMTP_HOST,
    port: SMTP_PORT,
    user: SMTP_USER,
    pass: SMTP_PASS ? '********' : 'MISSING',
    secure: SMTP_SECURE
  });

  if (!SMTP_USER || !SMTP_PASS) {
    console.error('Missing SMTP credentials in .env');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  try {
    await transporter.verify();
    console.log('Successfully verified SMTP connection.');
  } catch (error) {
    console.error('SMTP Verification Failed:', error);
  }
}

testSmtp();
