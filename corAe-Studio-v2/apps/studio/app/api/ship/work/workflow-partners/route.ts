// apps/studio/app/api/workflow-partners/route.ts
import { NextRequest, NextResponse } from "next/server";

type Partner = {
  id: string;
  role: string;
  contact?: string;
  isExternal?: boolean;
  departmentId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const mem = {
  partners: new Map<string, Partner>(),
};

function pid() { return "wp_" + Math.random().toString(36).slice(2, 10); }

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const list = [...mem.partners.values()].filter(p =>
    !q || p.role.toLowerCase().includes(q) || (p.contact ?? "").toLowerCase().includes(q)
  );
  return NextResponse.json({ ok: true, partners: list });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body?.action as "create" | "update" | "bulkUpsert";
    if (action === "create") {
      const now = new Date().toISOString();
      const p: Partner = {
        id: pid(),
        role: body.role,
        contact: body.contact ?? "",
        isExternal: !!body.isExternal,
        departmentId: body.departmentId ?? "",
        active: true,
        createdAt: now,
        updatedAt: now,
      };
      mem.partners.set(p.id, p);
      return NextResponse.json({ ok: true, partner: p });
    }
    if (action === "update") {
      const id = body.id as string;
      const prev = mem.partners.get(id);
      if (!prev) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
      const updated: Partner = {
        ...prev,
        role: body.role ?? prev.role,
        contact: body.contact ?? prev.contact,
        isExternal: typeof body.isExternal === "boolean" ? body.isExternal : prev.isExternal,
        departmentId: body.departmentId ?? prev.departmentId,
        active: typeof body.active === "boolean" ? body.active : prev.active,
        updatedAt: new Date().toISOString(),
      };
      mem.partners.set(id, updated);
      return NextResponse.json({ ok: true, partner: updated });
    }
    if (action === "bulkUpsert") {
      const now = new Date().toISOString();
      const input = (body.items ?? []) as Array<Partial<Partner>>;
      const out: Partner[] = [];
      for (const it of input) {
        if (it.id && mem.partners.has(it.id)) {
          const prev = mem.partners.get(it.id)!;
          const updated: Partner = {
            ...prev,
            role: it.role ?? prev.role,
            contact: it.contact ?? prev.contact,
            isExternal: typeof it.isExternal === "boolean" ? it.isExternal : prev.isExternal,
            departmentId: it.departmentId ?? prev.departmentId,
            active: typeof it.active === "boolean" ? it.active : prev.active,
            updatedAt: now,
          };
          mem.partners.set(updated.id, updated);
          out.push(updated);
        } else {
          const p: Partner = {
            id: pid(),
            role: (it.role ?? "Partner") as string,
            contact: it.contact ?? "",
            isExternal: !!it.isExternal,
            departmentId: it.departmentId ?? "",
            active: typeof it.active === "boolean" ? it.active : true,
            createdAt: now,
            updatedAt: now,
          };
          mem.partners.set(p.id, p);
          out.push(p);
        }
      }
      return NextResponse.json({ ok: true, partners: out });
    }
    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Bad request" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  mem.partners.delete(id);
  return NextResponse.json({ ok: true });
}