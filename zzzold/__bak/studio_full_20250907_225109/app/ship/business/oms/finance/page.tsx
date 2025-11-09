// apps/studio/app/ship/business/oms/finance/page.tsx
import fs from "node:fs"; import path from "node:path";
const P=(...a:string[])=>path.join(process.cwd(),...a);
export default function Finance() {
  const dir = P("data","oms","finance");
  const items = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Finance</h1>
      <p className="text-gray-600">Pricelocks, AP/AR, billing control.</p>
      <ul className="space-y-2">
        {items.map(x=> <li key={x} className="border rounded-md p-2 bg-white">{x}</li>)}
        {items.length===0 && <li className="text-gray-500">— no finance items —</li>}
      </ul>
    </div>
  );
}