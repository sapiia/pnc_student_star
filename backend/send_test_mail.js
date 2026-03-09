require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTestEmail() {
  const {
    SMTP_HOST = 'smtp.gmail.com',
    SMTP_PORT = '587',
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE = 'false',
    SMTP_FROM = 'moeurnsophy92@gmail.com'
  } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    console.error('Missing SMTP credentials');
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
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: SMTP_USER, // send to self
      subject: 'PNC Student Star - Real Email Test',
      text: 'If you see this, your email configuration is working perfectly!',
      html: '<b>If you see this, your email configuration is working perfectly!</b>'
    });
    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
}

sendTestEmail();
