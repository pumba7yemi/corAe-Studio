// apps/studio/app/ship/business/oms/page.tsx
import fs from "node:fs";
import path from "node:path";
const P = (...a: string[]) => path.join(process.cwd(), ...a);
const n = (p: string) => (fs.existsSync(p) ? fs.readdirSync(p).length : 0);

export default function OMS() {
  const counts = {
    orders:    n(P("data","oms","obari","orders")),
    booking:   n(P("data","oms","obari","booking")),
    active:    n(P("data","oms","obari","active")),
    reporting: n(P("data","oms","obari","reporting")),
    invoicing: n(P("data","oms","obari","invoicing")),
    ops:       n(P("data","oms","operations")),
    fin:       n(P("data","oms","finance")),
    hr:        n(P("data","oms","hr")),
  };

  const Card = ({ href, title, subtitle, kpis }:{
    href: string; title: string; subtitle: string; kpis?: {label:string; value:number|string}[];
  }) => (
    <a href={href} className="block rounded-xl border bg-white hover:bg-gray-50 transition p-4 shadow-sm">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
      {kpis && (
        <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
          {kpis.map(k => (
            <div key={k.label} className="rounded-md border p-2 text-center">
              <div className="text-gray-500">{k.label}</div>
              <div className="font-semibold">{k.value}</div>
            </div>
          ))}
        </div>
      )}
    </a>
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">OMS</h1>
        <p className="text-gray-600">Operations & Finance governance of the OBARI lifecycle.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          href="/ship/business/oms/obari"
          title="OBARI"
          subtitle="Orders → Booking → Active → Reporting → Invoicing"
          kpis={[
            {label:"Orders", value: counts.orders},
            {label:"Active", value: counts.active},
            {label:"Invoicing", value: counts.invoicing},
          ]}
        />
        <Card
          href="/ship/business/oms/operations"
          title="Operations"
          subtitle="SOPs, daily run, SLAs"
          kpis={[
            {label:"Open ops items", value: counts.ops},
            {label:"Reports", value: counts.reporting},
            {label:"Bookings", value: counts.booking},
          ]}
        />
        <Card
          href="/ship/business/oms/finance"
          title="Finance"
          subtitle="AP/AR, pricelocks, billing control"
          kpis={[
            {label:"Reporting", value: counts.reporting},
            {label:"Invoicing", value: counts.invoicing},
            {label:"Fin items", value: counts.fin},
          ]}
        />
        <Card
          href="/ship/business/oms/hr"
          title="HR"
          subtitle="People, vendors, access"
          kpis={[
            {label:"HR items", value: counts.hr},
            {label:"Active", value: counts.active},
            {label:"Orders", value: counts.orders},
          ]}
        />
      </section>
    </div>
  );
}