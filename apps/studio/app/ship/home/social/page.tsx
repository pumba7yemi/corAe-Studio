export const dynamic = "force-dynamic";
import SocialPlanner from "../../../../components/social/SocialPlanner";

async function getItems() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/social?domain=home&view=calendar`, { cache: "no-store" });
  if (!res.ok) return [];
  const j = await res.json();
  return j.items ?? [];
}

export default async function Page() {
  const items = await getItems();
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Home — Social</h1>
      {/* @ts-ignore */}
      <SocialPlanner domain="home" items={items} />
    </div>
  );
}
