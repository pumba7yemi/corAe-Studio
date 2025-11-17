// Minimal local types to avoid external dependency during build
type AgentTask = { id: string; payload?: { brand?: string; modules?: string[] } | any };
type AgentResult = { id: string; status: "ok" | "error" | string; artifacts?: Array<{ path: string; content: string }>; notes?: string };

export async function invoke(task: AgentTask): Promise<AgentResult> {
  // Read inputs (never call live systems here)
  const { brand = "Generic", modules = ["POS","Bookings"] } = task.payload ?? {};

  // Produce artifacts (stubs) — CAIA will wrap & test
  const files = [
    { path: "README.md", content: `# ${brand} Starter\nModules: ${modules.join(", ")}` },
    { path: "apps/web/pages/index.tsx", content: "export default function Home(){return <div>Hello</div>}" }
  ];

  return { id: task.id, status: "ok", artifacts: files, notes: "Scaffold generated" };
}

// Dock registration
// Local stub for 'register' to avoid external dependency during local build
function register(opts: { name: string; capabilities: string[]; invoke: (task: AgentTask) => Promise<AgentResult> }) {
  // No-op registration for local builds; the real registry will be used at runtime.
  return;
}
register({ name: "white-label-agent", capabilities: ["WHITE_LABEL_BUILD"], invoke });