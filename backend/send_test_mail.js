require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');

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
      from: SMTP_FROM || `"PNC Student Star" <${SMTP_USER}>`,
      to: SMTP_USER, // send to self
      subject: 'PNC Student Star - Real Email Test',
      text: 'If you see this, your email configuration is working perfectly!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
          <img src="cid:star_gmail_logo" style="width: 80px; height: 80px; border-radius: 50%;" alt="Logo" />
          <h2 style="color: #0f172a;">Real Email Test Successful!</h2>
          <p>If you see this and the logo above, your email configuration is working perfectly!</p>
        </div>
      `,
      attachments: [
        {
          filename: 'star_gmail_logo.jpg',
          path: path.join(__dirname, 'uploads/logo/star_gmail_logo.jpg'),
          cid: 'star_gmail_logo'
        }
      ]
    });
    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
}

sendTestEmail();
