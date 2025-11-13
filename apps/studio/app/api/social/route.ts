// apps/studio/app/api/social/route.ts
import { NextRequest } from "next/server";
import { readShipMemory, writeShipMemory } from "@/caia/memory";

export const runtime = "nodejs";
export const revalidate = 0;

type Domain = "home" | "work" | "business";
type View = "calendar" | "drafts" | "published" | "approvals";

type SocialStatus = "draft" | "approved" | "scheduled" | "published";

type SocialItem = {
  id: string;
  title: string;
  channel: string;          // e.g., "facebook" | "instagram" | "tiktok" | "x" | "youtube"
  status: SocialStatus;
  scheduledAt?: string;     // ISO
  approvedBy?: string;
  createdAt: string;        // ISO
  updatedAt: string;        // ISO
};

type SocialState = { items: SocialItem[] };

function okDomain(x: string | null): x is Domain {
  return x === "home" || x === "work" || x === "business";
}
function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
function nowISO() {
  return new Date().toISOString();
}

async function load(domain: Domain): Promise<SocialState> {
  const scope = `social:${domain}`;
  const key = "items";
  const data = (await readShipMemory(scope, key)) as SocialState | undefined;
  if (!data || !Array.isArray(data.items)) return { items: [] };
  return data;
}
async function save(domain: Domain, state: SocialState) {
  const scope = `social:${domain}`;
  const key = "items";
  await writeShipMemory(scope, key, state);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domainParam = searchParams.get("domain");
  const view = (searchParams.get("view") as View) || "calendar";

  if (!okDomain(domainParam)) {
    return Response.json({ error: "invalid domain" }, { status: 400 });
  }
  const domain = domainParam;

  const state = await load(domain);
  let items = state.items;

  if (view === "drafts") {
    items = items.filter((i) => i.status === "draft");
  } else if (view === "published") {
    items = items.filter((i) => i.status === "published");
  } else if (view === "approvals") {
    items = items.filter((i) => i.status === "draft" || i.status === "approved");
  } // "calendar" → return all

  return Response.json({ items }, { headers: { "Cache-Control": "no-store" } });
}

type DraftPayload = { title: string; channel: string };
type ApprovePayload = { id: string; approvedBy: string; approved: boolean };
type SchedulePayload = { id: string; scheduledAt: string; humanApproved: boolean };
type PublishPayload = { id: string; humanApproved: boolean };

type PostBody =
  | { action: "draft"; domain: Domain; payload: DraftPayload }
  | { action: "approve"; domain: Domain; payload: ApprovePayload }
  | { action: "schedule"; domain: Domain; payload: SchedulePayload }
  | { action: "publish"; domain: Domain; payload: PublishPayload };

export async function POST(req: NextRequest) {
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body?.domain || !okDomain(body.domain)) {
    return Response.json({ error: "invalid domain" }, { status: 400 });
  }

  const state = await load(body.domain);
  const items = state.items.slice();

  switch (body.action) {
    case "draft": {
      const p = body.payload as DraftPayload;
      if (!p?.title || !p?.channel) {
        return Response.json({ error: "title and channel required" }, { status: 400 });
      }
      const now = nowISO();
      const item: SocialItem = {
        id: uuid(),
        title: p.title,
        channel: p.channel,
        status: "draft",
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(item);
      break;
    }

    case "approve": {
      const p = body.payload as ApprovePayload;
      const idx = items.findIndex((i) => i.id === p.id);
      if (idx === -1) return Response.json({ error: "not found" }, { status: 404 });
      if (p.approved === false) {
        // revert to draft if was approved
        items[idx] = { ...items[idx], status: "draft", approvedBy: undefined, updatedAt: nowISO() };
      } else {
        items[idx] = { ...items[idx], status: "approved", approvedBy: p.approvedBy || "human", updatedAt: nowISO() };
      }
      break;
    }

    case "schedule": {
      const p = body.payload as SchedulePayload;
      const idx = items.findIndex((i) => i.id === p.id);
      if (idx === -1) return Response.json({ error: "not found" }, { status: 404 });
      const item = items[idx];
      if (!p.humanApproved && item.status !== "approved") {
        return Response.json({ error: "human approval required before scheduling" }, { status: 400 });
      }
      if (!p.scheduledAt) {
        return Response.json({ error: "scheduledAt required (ISO)" }, { status: 400 });
      }
      items[idx] = {
        ...item,
        status: "scheduled",
        scheduledAt: p.scheduledAt,
        updatedAt: nowISO(),
      };
      break;
    }

    case "publish": {
      const p = body.payload as PublishPayload;
      const idx = items.findIndex((i) => i.id === p.id);
      if (idx === -1) return Response.json({ error: "not found" }, { status: 404 });
      const item = items[idx];
      if (!p.humanApproved && !(item.status === "approved" || item.status === "scheduled")) {
        return Response.json({ error: "human approval required before publishing" }, { status: 400 });
      }
      items[idx] = { ...item, status: "published", updatedAt: nowISO() };
      break;
    }

    default:
      return Response.json({ error: "invalid action" }, { status: 400 });
  }

  const next: SocialState = { items };
  await save(body.domain, next);
  return Response.json({ ok: true, items: next.items }, { headers: { "Cache-Control": "no-store" } });
}
// duplicate block removed (second import and duplicate handlers were deleted to avoid duplicate identifiers)
