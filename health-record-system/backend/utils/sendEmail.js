const nodemailer = require("nodemailer");

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  return transporter;
};

// Sends an email. If SMTP is not configured (no SMTP_HOST in .env), it logs
// the email to the console instead of failing — useful for local development
// without setting up a real mail provider.
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_HOST) {
    console.log(`\n[Email skipped — SMTP not configured] To: ${to} | Subject: ${subject}\n${html}\n`);
    return { skipped: true };
  }

  const info = await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || "no-reply@vitalis.demo",
    to,
    subject,
    html,
  });

  return info;
};

module.exports = sendEmail;
