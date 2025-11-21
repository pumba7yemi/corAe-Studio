export const dynamic = "force-dynamic";
import FileLogicPanel from "../../../../components/filelogic/FileLogicPanel";

async function getItems() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/filelogic?domain=business&view=recent`, { cache: "no-store" });
  if (!res.ok) return [];
  const j = await res.json();
  return j.items ?? [];
}

export default async function Page() {
  const items = await getItems();
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Business — FileLogic</h1>
      {/* @ts-ignore Server -> Client prop passing */}
      <FileLogicPanel domain="business" items={items} />
    </div>
  );
}
