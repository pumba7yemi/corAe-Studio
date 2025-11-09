import { CaiaMessage } from "../types";

/** Replace this implementation with nodemailer (SMTP) or a provider SDK. */
export async function sendEmail(msg: CaiaMessage) {
  console.log("EMAIL (stub) →", {
    to: msg.to, subject: msg.subject, text: msg.text, persona: msg.persona
  });
}

/** Replace this with imapflow / provider SDK to actually read messages. */
export async function fetchInbox(opts: { sinceHours?: number } = {}) {
  console.log("EMAIL INBOX (stub) — reading", opts);
  return [
    { from: "vendor@example.com", subject: "Saturday availability", snippet: "We can deliver at 10am…" },
  ];
}
