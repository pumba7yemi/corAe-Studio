declare module "@services/cims/drivers/email_local.mjs" {
  export function sendEmail(args: {
    id?: string;
    to: string;
    subject: string;
    body: string;
  }): Promise<{ ok: boolean; id: string; to: string; subject: string; messageId: string }>;
}

declare module "@services/cims/drivers/whatsapp_local.mjs" {
  export function sendWhats(args: {
    id?: string;
    to: string;
    body: string;
  }): Promise<{ ok: boolean; id: string; to: string }>;
}