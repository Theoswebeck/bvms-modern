const nodemailer = require('nodemailer');
require('dotenv').config();

let cachedEtherealAccount = null;

/**
 * Sends a University of Kigali (UoK) 6-Digit Password Reset Verification Email.
 * - If SMTP_USER and SMTP_PASS are configured in .env (e.g. Gmail App Password or UoK SMTP),
 *   it sends the real email directly to the user's inbox.
 * - Otherwise, it automatically provisions a live Ethereal SMTP test inbox and returns a
 *   1-click preview URL so you can view the real delivered HTML email in your browser immediately.
 */
async function sendResetVerificationEmail({ toEmail, firstname, lastname, otpCode }) {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();

  let transporter = null;
  let usingRealSmtp = false;

  if (smtpUser && smtpPass && smtpPass !== 'your_gmail_app_password') {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    usingRealSmtp = true;
  } else {
    if (!cachedEtherealAccount) {
      cachedEtherealAccount = await nodemailer.createTestAccount();
    }
    transporter = nodemailer.createTransport({
      host: cachedEtherealAccount.smtp.host,
      port: cachedEtherealAccount.smtp.port,
      secure: cachedEtherealAccount.smtp.secure,
      auth: {
        user: cachedEtherealAccount.user,
        pass: cachedEtherealAccount.pass,
      },
    });
  }

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background: #6d1323; padding: 24px; text-align: center; color: #ffffff; border-bottom: 4px solid #e39600;">
        <div style="font-family: Georgia, serif; font-size: 22px; font-weight: bold; letter-spacing: 1px;">
          UNIVERSITY OF KIGALI (UoK)
        </div>
        <div style="font-size: 12px; color: #e39600; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; font-weight: bold;">
          Booklet Verification Management System (BVMS)
        </div>
      </div>

      <div style="padding: 28px 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <p style="margin-top: 0;">Dear <strong>${firstname} ${lastname}</strong>,</p>
        <p>
          We received a request to reset the password for your University of Kigali BVMS account
          associated with <strong>${toEmail}</strong>.
        </p>
        <p>Please use the 6-digit verification code below to complete your password reset:</p>

        <div style="margin: 24px 0; padding: 18px; background: #fdf8f8; border: 2px dashed #6d1323; border-radius: 10px; text-align: center;">
          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 1px;">
            Your 6-Digit Verification Code
          </div>
          <div style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #6d1323; margin-top: 6px;">
            ${otpCode}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">
            Valid for 15 minutes
          </div>
        </div>

        <p style="font-size: 12px; color: #64748b;">
          If you did not request a password reset, please ignore this email or contact the University of Kigali Directorate of ICT.
        </p>
      </div>

      <div style="background: #f8fafc; padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} University of Kigali &bull; KG 541 St, Kacyiru, Kigali, Rwanda
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"University of Kigali BVMS" <${usingRealSmtp ? smtpUser : 'no-reply@uok.ac.rw'}>`,
    to: toEmail,
    subject: `[University of Kigali BVMS] Password Reset Verification Code: ${otpCode}`,
    text: `Dear ${firstname} ${lastname},\n\nYour University of Kigali BVMS 6-digit password reset verification code is: ${otpCode}\n\nThis code is valid for 15 minutes.`,
    html: htmlBody,
  });

  const previewUrl = usingRealSmtp ? null : nodemailer.getTestMessageUrl(info);

  console.log(`📧 Verification Email sent to ${toEmail} (MessageId: ${info.messageId})`);
  if (previewUrl) {
    console.log(`🔗 View Delivered Email in Browser: ${previewUrl}`);
  }

  return {
    sent: true,
    usingRealSmtp,
    toEmail,
    messageId: info.messageId,
    previewUrl,
  };
}

module.exports = {
  sendResetVerificationEmail,
};
