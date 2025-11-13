"use client";
import React, { useMemo, useState } from "react";
import { PLEDGES } from "@/packages/core-culture/src";

type Pledge = {
  id: string;
  label: string;
  mandatory?: boolean;
};

type AuditEntry = {
  id: string;
  domain: string;
  timestamp: string;
  checkedPledges: string[];
  pass: boolean;
  reflection?: string;
};

type ContractDomain = string;

type Props = { domain: ContractDomain; title: string; subtitle?: string };

export default function SocialContractAudit({ domain, title, subtitle }: Props) {
  const pledges = useMemo((): Pledge[] => {
    try {
      return ((PLEDGES as unknown) as Record<string, Pledge[]>)[domain] ?? [];
    } catch {
      return [];
    }
  }, [domain]);
  const [checked, setChecked] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");
  const mandatoryIds = useMemo(() => pledges.filter((p: Pledge) => p.mandatory).map((p: Pledge) => p.id), [pledges]);
  const pass = mandatoryIds.every((id: string) => checked.includes(id));

  function id() {
    try {
      return (globalThis as any).crypto?.randomUUID?.() ?? `id:${Date.now()}:${Math.random()}`;
    } catch {
      return `id:${Date.now()}:${Math.random()}`;
    }
  }

  async function submit() {
    const payload: AuditEntry = {
      id: id(),
      domain,
      timestamp: new Date().toISOString(),
      checkedPledges: checked,
      pass,
      reflection: reflection?.trim() || undefined,
    };

    try {
      await fetch("/api/social-contract/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      alert(pass ? "Logged: PASS — good discipline." : "Logged: NEEDS ATTENTION — see reflection.");
      setChecked([]);
      setReflection("");
    } catch (e) {
      alert("Failed to log audit");
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {subtitle ? <p className="opacity-80">{subtitle}</p> : null}
      </header>

      <div className="rounded-2xl p-4 shadow bg-white/60">
        <p className="font-medium">Have you honoured the {domain} Social Contract today?</p>
        <ul className="list-disc pl-6 mt-2 text-sm">
          {pledges.map((p: Pledge) => (
            <li key={p.id} className="flex items-start gap-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked.includes(p.id)}
                  onChange={(e) =>
                    setChecked(v => e.target.checked ? [...v, p.id] : v.filter(x => x !== p.id))
                  }
                />
                <span>{p.label}{p.mandatory ? " *" : ""}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="text-xs mt-2 opacity-70">* Mandatory to pass audit.</p>
      </div>

      <div className="rounded-2xl p-4 shadow bg-white/60">
        <label className="text-sm font-medium">Reflection (optional)</label>
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          rows={3}
          className="w-full mt-2 p-2 rounded-lg border"
          placeholder="What will you improve tomorrow?"
        />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={submit} className="px-4 py-2 rounded-2xl shadow bg-black text-white">
          Log Audit {pass ? "— PASS" : "— Needs Attention"}
        </button>
        <span className={`text-sm ${pass ? "text-green-700" : "text-amber-700"}`}>
          {pass ? "All mandatory pledges ticked" : "Tick all mandatory pledges to pass"}
        </span>
      </div>
    </div>
  );
}
