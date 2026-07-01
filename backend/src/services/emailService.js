/**
 * GS Associates — Email Service
 * Handles nodemailer transport creation and branded HTML email sending.
 * Uses Gmail SMTP with App Passwords.
 */

const nodemailer = require('nodemailer');

// ─── Transporter ────────────────────────────────────────────────────────

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('[EMAIL] EMAIL_USER or EMAIL_PASS not set — emails will be logged only.');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  return transporter;
}

// ─── Brand Wrapper ──────────────────────────────────────────────────────

function wrapInBrandTemplate(title, bodyContent) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF7F0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #7A001E 0%, #5C0016 100%); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #D4AF37; font-size: 26px; font-weight: 700; letter-spacing: 1px; }
    .header p { margin: 6px 0 0; color: #f5e6c8; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }
    .gold-bar { height: 4px; background: linear-gradient(90deg, #D4AF37, #f5e6c8, #D4AF37); }
    .body-content { padding: 32px 28px; color: #333333; line-height: 1.7; font-size: 14px; }
    .body-content h2 { color: #7A001E; font-size: 20px; margin: 0 0 16px; }
    .body-content h3 { color: #7A001E; font-size: 16px; margin: 20px 0 10px; }
    .detail-card { background-color: #FFFDF9; border: 1px solid #D4AF37; border-radius: 10px; padding: 20px; margin: 16px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dotted #e8dcc0; font-size: 13px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #888; }
    .detail-value { font-weight: 600; color: #1A1A1A; }
    .cta-button { display: inline-block; padding: 14px 32px; background-color: #7A001E; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 16px 0; }
    .cta-button-gold { display: inline-block; padding: 14px 32px; background-color: #D4AF37; color: #1A1A1A !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 16px 0; }
    .highlight-amount { font-size: 24px; font-weight: 800; color: #7A001E; }
    .checklist { padding-left: 0; list-style: none; }
    .checklist li { padding: 8px 0; border-bottom: 1px solid #f0e8d0; font-size: 13px; }
    .checklist li::before { content: '☐ '; color: #7A001E; font-weight: bold; }
    .footer { background-color: #f9f5ee; padding: 24px; text-align: center; border-top: 1px solid #e8dcc0; }
    .footer p { margin: 4px 0; font-size: 11px; color: #999; }
    .footer .brand { color: #7A001E; font-weight: 600; font-size: 13px; }
    .status-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; color: white; }
    .badge-confirmed { background-color: #27ae60; }
    .badge-pending { background-color: #f39c12; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>✨ GS Associates</h1>
      <p>Premium South Indian Event Management</p>
    </div>
    <div class="gold-bar"></div>
    <div class="body-content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p class="brand">GS Associates</p>
      <p>Bengaluru, Karnataka • +91 98867 81380</p>
      <p>gsassociates.in • Namaskaram 🙏</p>
      <p style="margin-top: 8px; font-size: 10px; color: #bbb;">This is an automated email. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Send Email ─────────────────────────────────────────────────────────

async function sendEmail({ to, subject, html, attachments = [] }) {
  const transport = getTransporter();

  const mailOptions = {
    from: `"GS Associates" <${process.env.EMAIL_USER || 'noreply@gsassociates.in'}>`,
    to,
    subject,
    html,
    attachments
  };

  if (!transport) {
    console.log(`[EMAIL SIMULATED] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL BODY PREVIEW] ${html.substring(0, 200)}...`);
    return { simulated: true, messageId: `sim-${Date.now()}` };
  }

  try {
    const info = await transport.sendMail(mailOptions);
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject} | ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL ERROR] To: ${to} | Subject: ${subject} | Error: ${error.message}`);
    throw error;
  }
}

// ─── Export ─────────────────────────────────────────────────────────────

module.exports = {
  sendEmail,
  wrapInBrandTemplate,
  getTransporter
};
