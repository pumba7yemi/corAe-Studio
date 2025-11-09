// src/lib/caia/channels/email.ts

export type InboxItem = {
  id: string;
  from: string;
  subject: string;
  channel: "Email";
  time: string; // ISO or hh:mm
};

/** Minimal stub so the build succeeds. Replace with real inbox fetch later. */
export async function fetchInbox(_opts?: { sinceHours?: number }): Promise<InboxItem[]> {
  return [
    {
      id: "demo-1",
      from: "System",
      subject: "Demo inbox message",
      channel: "Email",
      time: new Date().toISOString(),
    },
  ];
}

export type EmailPayload = {
  to: string;
  subject: string;
  body: string;
  id?: string;
};

/** Minimal email sender stub; swap with nodemailer/SES/etc. later. */
export async function sendEmail(payload: EmailPayload) {
  // For now, just log and pretend success.
  console.log("[EMAIL] →", payload.to, "|", payload.subject);
  return { ok: true, id: payload.id ?? String(Date.now()) };
}