import nodemailer from "nodemailer";

export async function sendLeadEmail(payload: Record<string, any>) {
  // if you don’t set SMTP, we no-op to avoid crashes
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, LEAD_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !LEAD_TO) return { sent: false };

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  const text = Object.entries(payload).map(([k, v]) => `${k}: ${v ?? ""}`).join("\n");

  await transporter.sendMail({
    to: LEAD_TO,
    from: `"corAe Studio" <${SMTP_USER}>`,
    subject: `New Lead • ${payload.variant ?? "landing"}`,
    text
  });

  return { sent: true };
}

export function buildWhatsAppURL(number: string, msg: string) {
  const n = number?.replace(/[^\d]/g, "") || "971500000000";
  return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;
}