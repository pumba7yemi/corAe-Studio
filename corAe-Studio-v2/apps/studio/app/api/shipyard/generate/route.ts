// Studio API — Shipyard Generate (clone template → route with light injection)
//
// POST /api/shipyard/generate
// {
//   "templateId": "corae-page",
//   "target": { "appRoot": "root" | "studio", "route": "/dtd" },
//   "inject": {
//     "title": "3³ DTD",
//     "subtitle": "Digital Task Diary",
//     "icon": "🗓️",
//     "breadcrumbs": ["corAe","CAIA","3³ DTD"]
//   }
// }
//
// Writes .../<appRoot>/app/<route>/page.tsx (creates folders as needed).

import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve as r, join as j, sep } from "node:path";
import { corAeTemplates } from "@/lib/build/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  templateId: string;
  target: { appRoot: "root" | "studio"; route: string };
  inject?: {
    title?: string;
    subtitle?: string;
    icon?: string;
    breadcrumbs?: string[];
  };
};

function sanitizeRoute(p: string): string {
  let s = (p || "").trim();
  if (!s.startsWith("/")) s = "/" + s;
  // remove trailing slashes
  s = s.replace(/\/+$/, "");
  // collapse // to /
  s = s.replace(/\/{2,}/g, "/");
  // disallow .. traversal
  if (s.includes("..")) throw new Error("Invalid route path");
  return s === "" ? "/" : s;
}

function targetAppRoot(appRoot: "root" | "studio") {
  return appRoot === "studio" ? r(process.cwd(), "apps", "studio", "app") : r(process.cwd(), "app");
}

function replaceOnce(src: string, pattern: RegExp, replacement: string) {
  return src.replace(pattern, replacement);
}

function injectIntoTemplate(src: string, inject?: Body["inject"]) {
  if (!inject) return src;

  let out = src;

  if (inject.title) {
    out = replaceOnce(
      out,
      /title:\s*"(?:[^"]*)"/,
      `title: "${inject.title.replace(/"/g, '\\"')}"`
    );
  }
  if (typeof inject.subtitle === "string") {
    out = replaceOnce(
      out,
      /subtitle:\s*"(?:[^"]*)"/,
      `subtitle: "${inject.subtitle.replace(/"/g, '\\"')}"`
    );
  }
  if (inject.icon) {
    out = replaceOnce(
      out,
      /icon:\s*"(?:[^"]*)"/,
      `icon: "${inject.icon.replace(/"/g, '\\"')}"`
    );
  }
  if (Array.isArray(inject.breadcrumbs) && inject.breadcrumbs.length > 0) {
    const crumbs = inject.breadcrumbs
      .map((label, i, a) => {
        const isLast = i === a.length - 1;
        const href = "/" + a.slice(1, i + 1).join("/").toLowerCase().replace(/\s+/g, "-");
        return isLast
          ? `{ label: "${label.replace(/"/g, '\\"')}" }`
          : `{ label: "${label.replace(/"/g, '\\"')}", href: "${i === 0 ? "/" : href}" }`;
      })
      .join(", ");

    out = replaceOnce(
      out,
      /\(\)\s*=>\s*\[\s*\{[^]*?\}\s*\],?\s*\)/, // matches the default breadcrumbs useMemo
      `() => [ ${crumbs} ],`
    );
  }

  return out;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body?.templateId) {
      return NextResponse.json({ ok: false, error: "templateId is required" }, { status: 400 });
    }
    if (!body?.target?.appRoot || !["root", "studio"].includes(body.target.appRoot)) {
      return NextResponse.json({ ok: false, error: "target.appRoot must be 'root' or 'studio'" }, { status: 400 });
    }
    const route = sanitizeRoute(body?.target?.route || "");
    if (!route || route === "/") {
      return NextResponse.json({ ok: false, error: "target.route must be a non-root path like /dtd or /obari/orders" }, { status: 400 });
    }

    const tpl = corAeTemplates.find((t) => t.id === body.templateId);
    if (!tpl) {
      return NextResponse.json({ ok: false, error: `Template '${body.templateId}' not found` }, { status: 404 });
    }

    // Resolve template file
    const tplPath = r(process.cwd(), tpl.path.replace(/^\//, ""));
    const src = await readFile(tplPath, "utf-8");

    // Inject metadata
    const injected = injectIntoTemplate(src, body.inject);

    // Compute target path
    const destRoot = targetAppRoot(body.target.appRoot);
    const destDir = r(destRoot, ...route.split("/").filter(Boolean));
    const destFile = j(destDir, "page.tsx");

    // Prevent writing outside app roots
    const commonRoot = destRoot + sep;
    if (!destFile.startsWith(commonRoot)) {
      return NextResponse.json({ ok: false, error: "Resolved path escapes app root" }, { status: 400 });
    }

    await mkdir(destDir, { recursive: true });
    await writeFile(destFile, injected, { encoding: "utf-8" });

    const publicRoute =
      body.target.appRoot === "studio"
        ? "/"+["", ...route.split("/").filter(Boolean)].join("/")
        : route;

    return NextResponse.json({
      ok: true,
      file: destFile,
      route: publicRoute,
      template: { id: tpl.id, path: tpl.path },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Generation failed" },
      { status: 500 }
    );
  }
}
