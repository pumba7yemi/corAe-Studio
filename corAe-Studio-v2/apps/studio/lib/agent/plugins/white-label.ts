import { register, type AgentTask, type AgentResult } from "../dock/registry";

async function invoke(task: AgentTask): Promise<AgentResult> {
  const { brand = "Generic", modules = ["POS","Bookings"] } = task.payload ?? {};
  const files = [
    { path: "README.md", content: `# ${brand} Starter\nModules: ${modules.join(", ")}` },
    { path: "apps/web/pages/index.tsx", content: "export default function Home(){return <div>Hello</div>}" },
    { path: "apps/web/pages/api/feedback.ts", content: "export default function handler(req,res){res.status(200).json([])}" }
  ];
  return { id: task.id, status: "ok", artifacts: files, notes: "Scaffold generated" };
}

register({ name: "white-label-agent", capabilities: ["WHITE_LABEL_BUILD"], invoke });