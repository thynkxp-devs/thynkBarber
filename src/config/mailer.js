const nodemailer = require("nodemailer");

function createTransporter() {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 587);
  const secure = String(process.env.MAIL_SECURE || "false") === "true";

  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!host || !user || !pass) {
    console.warn("[MAIL] Variáveis de e-mail não configuradas. Envio será ignorado.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

const transporter = createTransporter();

async function sendMail({ to, subject, html, text }) {
  if (!transporter) return { skipped: true };

  const from = process.env.MAIL_FROM || process.env.MAIL_USER;

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });

  return { skipped: false, messageId: info.messageId };
}

module.exports = { sendMail };
