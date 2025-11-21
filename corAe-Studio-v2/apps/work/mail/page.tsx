export const dynamic = "force-dynamic";
import { ThreadList } from "@corae/ui/components/Inbox/ThreadList";

export default async function WorkMailPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/obari/threads`, { cache: "no-store" });
  const threads = res.ok ? (await res.json()).threads ?? [] : [];
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Work Mail</h1>
      <ThreadList threads={threads} domain="Work" />
    </div>
  );
}
