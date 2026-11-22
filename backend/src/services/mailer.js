const nodemailer = require('nodemailer');
require('dotenv').config();

let cachedEtherealAccount = null;

async function getMailTransporter() {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();

  if (smtpUser && smtpPass && smtpPass !== 'your_gmail_app_password') {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    return { transporter, usingRealSmtp: true, fromEmail: smtpUser };
  }

  if (!cachedEtherealAccount) {
    cachedEtherealAccount = await nodemailer.createTestAccount();
  }
  const transporter = nodemailer.createTransport({
    host: cachedEtherealAccount.smtp.host,
    port: cachedEtherealAccount.smtp.port,
    secure: cachedEtherealAccount.smtp.secure,
    auth: {
      user: cachedEtherealAccount.user,
      pass: cachedEtherealAccount.pass,
    },
  });
  return { transporter, usingRealSmtp: false, fromEmail: 'no-reply@uok.ac.rw' };
}

/**
 * Sends a University of Kigali (UoK) 6-Digit Password Reset Verification Email.
 */
async function sendResetVerificationEmail({ toEmail, firstname, lastname, otpCode }) {
  const { transporter, usingRealSmtp, fromEmail } = await getMailTransporter();

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
    from: `"University of Kigali BVMS" <${fromEmail}>`,
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

/**
 * Sends a University of Kigali (UoK) Examination Booklet Submission Receipt Email to the student.
 */
async function sendBookletSubmissionEmail({
  toEmail,
  firstname,
  lastname,
  regNumber,
  bookletCode,
  moduleCode,
  moduleName,
  roomName,
  examDate,
  seatNumber,
  invigilatorName,
  submittedAt,
}) {
  const { transporter, usingRealSmtp, fromEmail } = await getMailTransporter();
  const timestampStr = submittedAt
    ? new Date(submittedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background: #6d1323; padding: 24px; text-align: center; color: #ffffff; border-bottom: 4px solid #e39600;">
        <div style="font-family: Georgia, serif; font-size: 22px; font-weight: bold; letter-spacing: 1px;">
          UNIVERSITY OF KIGALI (UoK)
        </div>
        <div style="font-size: 12px; color: #e39600; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; font-weight: bold;">
          Examination Booklet Submission Confirmation
        </div>
      </div>

      <div style="padding: 28px 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <p style="margin-top: 0;">Dear <strong>${firstname} ${lastname}</strong>,</p>
        <p>
          This is an official confirmation that your examination answer booklet has been
          <strong style="color: #047857;">successfully submitted and verified</strong> by the room invigilator.
        </p>

        <div style="margin: 20px 0; padding: 16px 18px; background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #047857; border-radius: 8px; font-size: 13px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; color: #64748b; width: 42%;"><strong>Registration Number:</strong></td>
              <td style="padding: 5px 0; font-family: 'Courier New', monospace; font-weight: bold; color: #0c2340;">${regNumber}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;"><strong>Booklet Serial:</strong></td>
              <td style="padding: 5px 0; font-family: 'Courier New', monospace; font-weight: bold;">${bookletCode || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;"><strong>Module:</strong></td>
              <td style="padding: 5px 0; font-weight: bold;">[${moduleCode}] ${moduleName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;"><strong>Exam Room &amp; Seat:</strong></td>
              <td style="padding: 5px 0;">${roomName}${seatNumber ? ` (Seat #${seatNumber})` : ''}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;"><strong>Examination Date:</strong></td>
              <td style="padding: 5px 0;">${examDate}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;"><strong>Verified By:</strong></td>
              <td style="padding: 5px 0;">${invigilatorName || 'Room Invigilator'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;"><strong>Submitted At:</strong></td>
              <td style="padding: 5px 0;">${timestampStr}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;"><strong>Status:</strong></td>
              <td style="padding: 5px 0; font-weight: bold; color: #047857;">SUBMITTED &amp; VERIFIED</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 12px; color: #64748b;">
          Please keep this email as your digital receipt of examination booklet submission.
          If you notice any discrepancy, contact the University of Kigali Examinations Office immediately.
        </p>
      </div>

      <div style="background: #f8fafc; padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} University of Kigali &bull; Examinations Office &bull; KG 541 St, Kacyiru, Kigali, Rwanda
      </div>
    </div>
  `;

  const plainText = [
    `Dear ${firstname} ${lastname},`,
    '',
    'Your University of Kigali examination answer booklet has been successfully submitted and verified.',
    '',
    `Registration Number: ${regNumber}`,
    `Booklet Serial: ${bookletCode || 'N/A'}`,
    `Module: [${moduleCode}] ${moduleName}`,
    `Exam Room: ${roomName}${seatNumber ? ` (Seat #${seatNumber})` : ''}`,
    `Examination Date: ${examDate}`,
    `Verified By: ${invigilatorName || 'Room Invigilator'}`,
    `Submitted At: ${timestampStr}`,
    'Status: SUBMITTED & VERIFIED',
    '',
    'Please keep this email as your official digital receipt.',
  ].join('\n');

  const info = await transporter.sendMail({
    from: `"University of Kigali Examinations Office" <${fromEmail}>`,
    to: toEmail,
    subject: `[UoK BVMS] Booklet Submission Confirmed — ${moduleCode} (${regNumber})`,
    text: plainText,
    html: htmlBody,
  });

  const previewUrl = usingRealSmtp ? null : nodemailer.getTestMessageUrl(info);

  console.log(`📧 Booklet Submission Email sent to ${toEmail} (MessageId: ${info.messageId})`);
  if (previewUrl) {
    console.log(`🔗 View Delivered Receipt Email in Browser: ${previewUrl}`);
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
  sendBookletSubmissionEmail,
};
