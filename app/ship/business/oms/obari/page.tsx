// apps/studio/app/ship/business/oms/obari/page.tsx
import fs from "node:fs";
import path from "node:path";
const P=(...a:string[])=>path.join(process.cwd(),...a);

type Row = { id:string; title:string; value?:string|number };

function list(dir: string): Row[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f=>f.endsWith(".json")).map(f=>{
    const raw = fs.readFileSync(path.join(dir,f),"utf8");
    const j = JSON.parse(raw);
    return { id: j.id || f.replace(".json",""), title: j.title || j.subject || f };
  });
}

export default function OBARI() {
  const rows = {
    orders:    list(P("data","oms","obari","orders")),
    booking:   list(P("data","oms","obari","booking")),
    active:    list(P("data","oms","obari","active")),
    reporting: list(P("data","oms","obari","reporting")),
    invoicing: list(P("data","oms","obari","invoicing")),
  };

  const Col = ({title, items}:{title:string; items:Row[]}) => (
    <div className="rounded-xl border bg-white p-4">
      <div className="font-semibold">{title} <span className="text-xs text-gray-500">({items.length})</span></div>
      <ul className="mt-2 space-y-2">
        {items.map(x=>(
          <li key={x.id} className="text-sm border rounded-md px-2 py-1 bg-gray-50">{x.title}</li>
        ))}
        {items.length===0 && <li className="text-sm text-gray-500">— empty —</li>}
      </ul>
    </div>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">OBARI lifecycle</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <Col title="Orders"    items={rows.orders} />
        <Col title="Booking"   items={rows.booking} />
        <Col title="Active"    items={rows.active} />
        <Col title="Reporting" items={rows.reporting} />
        <Col title="Invoicing" items={rows.invoicing} />
      </div>

      <div className="text-sm text-gray-600">
        Tip: click <a className="underline" href="/comms">corAe Comms™</a> to see the feed that produces/updates these.
      </div>
    </div>
  );
}