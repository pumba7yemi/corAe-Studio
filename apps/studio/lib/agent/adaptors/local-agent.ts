import { register } from "../dock/registry";

type AgentTask = {
  id: string;
  payload?: {
    brand?: string;
    modules?: string[];
    [key: string]: unknown;
  };
};

type AgentResult = {
  id: string;
  status: "ok" | "error";
  artifacts?: Array<{ path: string; content: string }>;
  notes?: string;
};

async function invoke(task: AgentTask): Promise<AgentResult> {
  const { brand = "Generic", modules = [] } = task.payload ?? {};
  const files = [
    { path: "README.md", content: `# ${brand} project\nModules: ${modules.join(", ")}` },
    { path: "pages/index.tsx", content: "export default () => <div>Hello corAe!</div>" }
  ];
  return { id: task.id, status: "ok", artifacts: files, notes: "Local agent scaffold" };
}

register({
  name: "local-agent",
  capabilities: ["WHITE_LABEL_BUILD"],
  invoke
});