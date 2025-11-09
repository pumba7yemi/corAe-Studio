// Re-export the lib implementation so imports like "@/lib/caia/channels/email"
// resolve to the actual implementation during builds.
export * from "../../../../lib/caia/channels/email";
export type InboxItem = {
  id: string;
  from: string;
  subject: string;
  channel: "Email";
  time: string; // ISO or hh:mm
};

// Accept an options object so route.ts can call fetchInbox({ sinceHours: 24 })
export async function fetchInbox(opts?: { sinceHours?: number }): Promise<InboxItem[]> {
  // In the future you can use opts?.sinceHours to filter messages.
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
