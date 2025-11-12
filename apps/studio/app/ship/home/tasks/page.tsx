export const dynamic = "force-dynamic";
export default async function Page() {
  const res = await fetch("/api/ship/home/demo/tasks", { cache: "no-store" });
  const { data } = await res.json();
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Home • Tasks (Demo)</h1>
      <ul className="mt-3 list-disc pl-6 text-sm">
        {data.map((t: any) => <li key={t.id ?? t.title}>{t.title}</li>)}
      </ul>
    </main>
  );
}
