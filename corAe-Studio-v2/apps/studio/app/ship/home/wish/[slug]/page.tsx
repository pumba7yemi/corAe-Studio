import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type ShareDoc = { slug: string; title?: string | null; items: { itemId: string }[] };

type WantItem = {
  id: string;
  title: string;
  estimate?: number | null;
  category: string;
  priority: string;
  targetDate?: string | null;
  link?: string | null;
  notes?: string | null;
};

async function baseUrl(): Promise<string> {
  // Prefer env for prod; fall back to header-derived origin for dev
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env && /^https?:\/\//i.test(env)) return env.replace(/\/+$/, "");
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

async function fetchShare(slug: string): Promise<ShareDoc | null> {
  const base = await baseUrl();
  const r = await fetch(`${base}/api/home/wish/share?slug=${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!r.ok) return null;
  const j = await r.json();
  if (!j?.ok || !j.share) return null;
  return { slug, title: j.share.title ?? null, items: j.share.items ?? [] };
}

async function fetchItems(): Promise<WantItem[]> {
  const base = await baseUrl();
  const r = await fetch(`${base}/api/home/iwant`, { cache: "no-store" });
  if (!r.ok) return [];
  return (await r.json()) as WantItem[];
}

export default async function Page(props: { params?: Promise<{ slug: string }>; searchParams?: Promise<any> }) {
  const params = await props.params;
  const slug = params?.slug as string;
  const share = await fetchShare(slug);
  if (!share) return notFound();

  const all = await fetchItems();
  const ids = new Set(share.items.map((i) => i.itemId));
  const items = all.filter((i) => ids.has(i.id));

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{share.title ?? "Wishlist"}</h1>
        <p className="mt-1 text-zinc-400 text-sm">
          Buy directly from this list â€” affiliate & cashback tracking via corAe.
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link href="/home/iwant" className="text-sm underline">
          Create your own list
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <div key={i.id} className="rounded-xl border p-3 flex flex-col">
            <div className="font-medium">{i.title}</div>
            {i.link && (
              <a href={i.link} className="text-xs underline text-zinc-400" target="_blank">
                Product page
              </a>
            )}
            <div className="text-sm text-zinc-300 mt-1">
              AED {i.estimate ?? 0}
            </div>
            <a
              href={`/api/home/redirect?m=generic&itemId=${encodeURIComponent(
                i.id
              )}&u=${encodeURIComponent(i.link ?? "https://example.com")}&share=${encodeURIComponent(
                share.slug
              )}`}
              target="_blank"
              className="mt-auto rounded-lg bg-emerald-600 text-white text-sm py-1.5 text-center hover:bg-emerald-500"
            >
              Buy now (tracked)
            </a>
          </div>
        ))}
        {!items.length && (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-zinc-400">
            This list is empty.
          </div>
        )}
      </div>
    </div>
  );
}

