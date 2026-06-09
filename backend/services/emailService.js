const nodemailer = require('nodemailer');

let transporter = null;
let testAccount = null;

/**
 * Initialize the email transporter.
 * - If EMAIL_USER + EMAIL_PASS are set in .env → uses real SMTP (Gmail etc.)
 * - Otherwise → auto-creates a free Ethereal test account (simulation mode)
 */
async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Real SMTP mode
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('📧 Email service: Real SMTP mode');
  } else {
    // Ethereal simulation mode — auto-generates a free test account
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Email service: Simulation mode (Ethereal)');
    console.log(`   Test inbox: https://ethereal.email/messages`);
    console.log(`   User: ${testAccount.user}`);
  }

  return transporter;
}

/**
 * Send an email.
 * @param {Object} options
 * @param {string} options.to       - Recipient email
 * @param {string} options.subject  - Email subject
 * @param {string} options.html     - HTML body
 * @param {string} options.fromName - Sender display name
 * @returns {{ success: boolean, status: string, previewUrl?: string, error?: string }}
 */
async function sendEmail({ to, subject, html, fromName = 'EduERP Notifications' }) {
  try {
    const transport = await getTransporter();

    const fromEmail = process.env.EMAIL_USER || (testAccount ? testAccount.user : 'noreply@eduerp.com');

    const info = await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 Email preview: ${previewUrl}`);
    }

    return {
      success: true,
      status: 'delivered',
      previewUrl: previewUrl || null,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return {
      success: false,
      status: 'failed',
      error: error.message,
    };
  }
}

/**
 * Build a styled HTML email from plain text message.
 */
function buildEmailHtml({ recipientName, message, institutionName = 'EduERP Institution' }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #2563eb, #1e40af); padding: 40px 40px 30px; color: white; }
        .header h1 { margin: 0 0 4px; font-size: 22px; font-weight: 800; }
        .header p { margin: 0; opacity: 0.75; font-size: 13px; }
        .body { padding: 40px; color: #334155; }
        .greeting { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .message { font-size: 15px; line-height: 1.7; color: #475569; background: #f8fafc; padding: 24px; border-radius: 16px; border-left: 4px solid #2563eb; }
        .footer { padding: 24px 40px; background: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; }
        .footer p { margin: 0; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${institutionName}</h1>
          <p>Official Communication</p>
        </div>
        <div class="body">
          <p class="greeting">Dear ${recipientName},</p>
          <div class="message">${message.replace(/\n/g, '<br/>')}</div>
        </div>
        <div class="footer">
          <p>This is an automated message from ${institutionName}. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = { sendEmail, buildEmailHtml };
