export const dynamic = "force-dynamic";
export default async function Page() {
  const res = await fetch("/api/business/demo/obari", { cache: "no-store" });
  const { data } = await res.json();
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Business â€¢ OBARI (Demo)</h1>
      <pre className="mt-3 text-xs bg-gray-50 p-3 rounded-xl">{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}

