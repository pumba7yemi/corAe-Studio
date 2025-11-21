// scripts/make-studio-stubs.mjs
import fs from "node:fs/promises";
import path from "node:path";

const base = path.join(process.cwd(), "apps", "studio", "app");
const f = (...p) => path.join(base, ...p);

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }

async function writeIfMissing(file, content) {
  try { await fs.access(file); console.log("skip", path.relative(base, file)); }
  catch {
    await ensureDir(path.dirname(file));
    await fs.writeFile(file, content, "utf8");
    console.log("write", path.relative(base, file));
  }
}

const P = (name) => `export default function ${name}() { return <h1>${name.replace(/Page$/,'')} (stub)</h1>; }`;
const Pid = (name, what) => `interface Props { params: { id: string } }
export default function ${name}({ params }: Props) { return <h1>${what} (stub) – {params.id}</h1>; }`;

// --- Automate ---
await writeIfMissing(f("automate/page.tsx"), P("AutomatePage"));
await writeIfMissing(f("automate/workflows/page.tsx"), P("WorkflowsPage"));
await writeIfMissing(f("automate/workflows/[id]/page.tsx"), Pid("WorkflowDetailPage","Workflow Detail"));

// --- Build Log ---
await writeIfMissing(f("build-log/page.tsx"), P("BuildLogPage"));
await writeIfMissing(f("build-log/[id]/page.tsx"), Pid("BuildLogDetailPage","Build Log Detail"));

// --- Ships (keep existing ships/page.tsx if you already have one) ---
await writeIfMissing(f("ships/page.tsx"), P("ShipsPage"));
await writeIfMissing(f("ships/new/page.tsx"), P("NewShipPage"));
await writeIfMissing(f("ships/[id]/page.tsx"), Pid("ShipDetailPage","Ship Detail"));
await writeIfMissing(f("ships/[id]/compare/page.tsx"), Pid("ShipComparePage","Compare Ship"));
await writeIfMissing(f("ships/[id]/update/page.tsx"), Pid("ShipUpdatePage","Update Ship"));

// --- Deploy ---
await writeIfMissing(f("deploy/[id]/page.tsx"), Pid("DeployPage","Deploy"));

console.log("\n✅ Stub pages ensured.");