import { register } from "../../dock/registry";

type AgentTask = {
  id: string;
  payload?: {
    brand?: string;
    modules?: string[];
    [key: string]: any;
  } | any;
};

type AgentResult = {
  id: string;
  status: string;
  artifacts?: { path: string; content: string }[];
  notes?: string;
};

/**
 * Local White-Label Agent
 * Generates a simple scaffold without leaving corAe.
 */
async function invoke(task: AgentTask): Promise<AgentResult> {
  const { brand = "Generic", modules = ["POS","Bookings"] } = task.payload ?? {};

  const files = [
    {
      path: "README.md",
      content: `# ${brand} Starter\nModules: ${modules.join(", ")}`
    },
    {
      path: "apps/web/pages/index.tsx",
      content: `export default function Home(){return <div>${brand} ready.</div>}`
    },
    {
      path: "apps/web/pages/api/health.ts",
      content: `export default function handler(req,res){res.status(200).json({ok:true})}`
    }
  ];

  return {
    id: task.id,
    status: "ok",
    artifacts: files,
    notes: "Local scaffold generated"
  };
}

/** Register with the Dock registry at load time */
register({
  name: "white-label-local",
  capabilities: ["WHITE_LABEL_BUILD"],
  invoke
});