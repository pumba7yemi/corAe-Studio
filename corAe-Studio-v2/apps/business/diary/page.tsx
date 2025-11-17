export const dynamic = "force-dynamic";
import { TaskList } from "@corae/ui/components/Diary/TaskList";

export default async function BusinessDiaryPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/3cubed/tasks`, { cache: "no-store" });
  const tasks = res.ok ? (await res.json()).tasks ?? [] : [];
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">3³DTD — Business</h1>
      <TaskList tasks={tasks} domain="Business" />
    </div>
  );
}
