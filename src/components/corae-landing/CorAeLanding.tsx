"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Variant = "home" | "work" | "business" | "vendor";

export default function CorAeLanding({ variant="business", ab="A" }: { variant?: Variant; ab?: "A"|"B" }) {
  const copy = useMemo(() => getCopy(variant), [variant]);
  const [lead, setLead] = useState({ name:"", email:"", phone:"", company:"", notes:"" });
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState<string | null>(null);

  async function submitLead(e: React.FormEvent) {
    e.preventDefault(); setSending(true);
    try {
      const r = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ ...lead, variant, utm: readUTM(), experiment: `Landing-${variant}-${ab}` })
      });
      const j = await r.json();
      setOk(j?.ok ? "Thanks — we’ll be in touch shortly." : (j?.error || "Something went wrong"));
    } catch {
      setOk("Network error — please try WhatsApp.");
    } finally { setSending(false); }
  }

  const waHref = buildWhatsApp(`Hi corAe, I’m interested in ${copy.ctaPrimary}. My name is ${lead.name || "[Your Name]"}.`);

  return (
    <div className="min-h-screen bg-[hsl(var(--hue),30%,98%)]" data-ab-variant={ab} data-experiment={`Landing-${variant}`}>
      <JsonLd variant={variant} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Badge>{copy.badge}</Badge>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold leading-tight">{copy.h1}</h1>
            <p className="mt-4 text-lg text-gray-600">{copy.sub}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#lead-form"><Button size="lg" className="rounded-2xl">{copy.ctaPrimary}</Button></a>
              <a href={waHref} target="_blank">
                <Button size="lg" variant="outline" className="rounded-2xl">WhatsApp us</Button>
              </a>
            </div>
            <div className="mt-6 text-sm text-gray-500">No spam. Ever. We only message when it helps you win.</div>
          </div>

          <Card className="rounded-3xl">
            <CardHeader className="pb-2"><CardTitle className="text-base">{titleByVariant(variant)}</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">{heroLine(variant)}</div>
              <div className="mt-4 h-48 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 grid place-items-center">
                <div className="text-xs text-gray-500">(Preview — replace with Studio screenshots)</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* PROBLEM → SOLUTION */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl font-semibold">{copy.problem.h}</h2>
            <ul className="mt-4 space-y-3 text-gray-700">
              {copy.problem.points.map((p,i)=> <li key={i}>• {p}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{copy.solution.h}</h2>
            <ul className="mt-4 space-y-3 text-gray-700">
              {copy.solution.points.map((p,i)=> <li key={i}>✓ {p}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* LEAD FORM */}
      <section id="lead-form" className="py-16 bg-white border-t">
        <div className="mx-auto max-w-3xl px-6">
          <Card className="rounded-2xl">
            <CardHeader><CardTitle className="text-xl">{copy.formTitle}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={submitLead} className="grid gap-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <Input placeholder="Full name" value={lead.name} onChange={e=>setLead(l=>({ ...l, name:e.target.value }))} required />
                  <Input placeholder="Business email" type="email" value={lead.email} onChange={e=>setLead(l=>({ ...l, email:e.target.value }))} required />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <Input placeholder="WhatsApp (intl format)" value={lead.phone} onChange={e=>setLead(l=>({ ...l, phone:e.target.value }))} />
                  <Input placeholder="Company / Brand" value={lead.company} onChange={e=>setLead(l=>({ ...l, company:e.target.value }))} />
                </div>
                <Textarea placeholder="Tell us your goal in 1–2 lines" value={lead.notes} onChange={e=>setLead(l=>({ ...l, notes:e.target.value }))} />
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button type="submit" disabled={sending} className="rounded-2xl">{sending ? "Sending…" : copy.ctaPrimary}</Button>
                  <a href={waHref} target="_blank"><Button variant="outline" className="rounded-2xl">WhatsApp now</Button></a>
                </div>
                {ok && <p className="text-sm text-gray-600 mt-2">{ok}</p>}
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="py-10 border-t text-center text-sm text-gray-500">© {new Date().getFullYear()} corAe — The Operating System of Life.</footer>
    </div>
  );
}

/* helpers */

function getCopy(variant: Variant){
  switch(variant){
    case "home": return {
      badge:"Home • Heart of the OS",
      h1:"Make your home calm again — with one trusted guide.",
      sub:"Wake on time. Eat better. Bills handled. Children and parents supported.",
      ctaPrimary:"Start my Home Flow",
      problem:{ h:"The problem we end", points:["Missed alarms & appointments","Budget drift & unpaid bills","Health, school, chores scattered across apps"]},
      solution:{ h:"What corAe does", points:["One rhythm for the whole house","Shared lists, budgets, reminders","Wellness & faith nudges built-in"]},
      formTitle:"Tell us about your household"
    };
    case "work": return {
      badge:"Work • Focus without fear",
      h1:"Start your day with three focuses — and finish calm.",
      sub:"Three focuses, one dashboard, no blame.",
      ctaPrimary:"Deploy Work in my team",
      problem:{ h:"Why days feel heavy", points:["Too many tools, not enough clarity","Meetings that don’t move work","Tasks stuck in people’s heads"]},
      solution:{ h:"What changes on Day 1", points:["Today’s 3 Focuses for everyone","Accountability without anxiety","Workflows that remember for you"]},
      formTitle:"Team size & goals"
    };
    case "vendor": return {
      badge:"Vendors • CIMS On-Ramp",
      h1:"Kill WhatsApp chaos. Deliver. Confirm. Get paid.",
      sub:"Orders, deliveries, confirmations — in one place.",
      ctaPrimary:"Activate my CIMS portal",
      problem:{ h:"The old way is broken", points:["Orders lost in chat","Late price updates","Manual invoices & disputes"]},
      solution:{ h:"The corAe way", points:["POs arrive instantly","One-tap delivery confirmation","Auto price & invoice sync"]},
      formTitle:"Vendor onboarding"
    };
    default: return {
      badge:"Business • OS of Growth",
      h1:"Install an Operating System for Growth — not another agency.",
      sub:"Virality, sales, and operations in one trunk. Start anywhere: CIMS, Work, or Home.",
      ctaPrimary:"Book a Freedom Flow™ session",
      problem:{ h:"Why growth stalls", points:["Posting without a system","Leads that don’t return","Staff carrying the burden of memory"]},
      solution:{ h:"Why corAe compounds", points:["100-hook virality engine","Decision-maker maps + PitchCraft","Growth Agent tied to earnings"]},
      formTitle:"Tell us about your business"
    };
  }
}

function titleByVariant(v: Variant){
  return { home:"The Heart: corAe Home", work:"The Bridge: corAe Work", business:"The Machine: corAe Business", vendor:"The On-Ramp: CIMS Vendors" }[v];
}

function heroLine(v: Variant){
  return {
    home: "Household rhythm, bills, meals, health — all in flow.",
    work: "Three Focuses. One calm dashboard. No more chaos.",
    business: "Viral engine, decision-maker maps, earnings-tied growth.",
    vendor: "CIMS orders → delivery → confirmation. Zero WhatsApp chaos."
  }[v];
}

function readUTM(){
  if (typeof window === "undefined") return {};
  const u = new URL(window.location.href);
  const entries: Record<string,string> = {};
  ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].forEach(k=>{
    const v = u.searchParams.get(k); if (v) entries[k]=v;
  });
  return entries;
}

function buildWhatsApp(msg: string){
  const num = (process?.env?.WA_NUMBER ?? (typeof document !== "undefined"
    ? (document.querySelector('meta[name="wa-number"]') as HTMLMetaElement | null)?.content
    : "")) || "971500000000";
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

function JsonLd({ variant }: { variant: Variant }) {
  const org = { "@context":"https://schema.org", "@type":"Organization", name:"corAe", url:"https://corae.app", logo:"/logo.png" };
  const webPage = { "@context":"https://schema.org", "@type":"WebPage", name:titleByVariant(variant), description:getCopy(variant).sub };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <meta name="description" content={getCopy(variant).sub}/>
      <meta name="wa-number" content={process.env.WA_NUMBER || "971500000000"}/>
      <title>{getCopy(variant).h1} · corAe</title>
    </>
  );
}