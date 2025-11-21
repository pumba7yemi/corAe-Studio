export const dynamic = "force-dynamic";

import { ThreadFilters } from "@corae/ui/components/Inbox/ThreadFilters";
import { ThreadList } from "@corae/ui/components/Inbox/ThreadList";
import { TaskList } from "@corae/ui/components/Diary/TaskList";
import { CaiaDock } from "@corae/ui/components/Caia/CaiaDock";
import { getModuleRegistry } from "../../../../../packages/core-modules/registry";
import ClientInbox, { ModuleBadges } from "./ClientInbox";

async function getData() {
  const [threadsRes, tasksRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/obari/threads`, { cache: "no-store" }),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/3cubed/tasks`, { cache: "no-store" }),
  ]);
  const threads = threadsRes.ok ? (await threadsRes.json()).threads ?? [] : [];
  const tasks = tasksRes.ok ? (await tasksRes.json()).tasks ?? [] : [];
  return { threads, tasks };
}

export default async function HubPage() {
  const { threads, tasks } = await getData();
  const modules = getModuleRegistry();

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-2xl font-semibold">Unified Hub</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ClientInbox threads={threads} modules={modules} />
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Unified 3³DTD</h2>
            <TaskList tasks={tasks} />
          </div>
        </div>
        <div className="md:col-span-1">
          <CaiaDock />
          <ModuleBadges modules={modules} />
        </div>
      </div>
    </div>
  );
}
// client components moved to ClientInbox.tsx so this file remains a server component
