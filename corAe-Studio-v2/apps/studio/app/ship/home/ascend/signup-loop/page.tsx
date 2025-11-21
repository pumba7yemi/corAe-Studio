"use client";
import React, { useMemo, useState } from "react";
import { estimateNeedIndex, needBadge } from "../../../../../core/ascend/need-index";
import { initPulseFromNeed, addRecovery } from "../../../../../core/ascend/pulse-bridge";

export default function SignupLoopPage() {
  const [form, setForm] = useState({ incomeAED: 0, fixedCostsAED: 0, variableCostsAED: 0, savingsGoalAED: 0 });
  const need = useMemo(() => estimateNeedIndex(form), [form]);
  const badge = needBadge(need.monthlyDelta);
  const [pulse, setPulse] = useState(() => initPulseFromNeed(need.monthlyDelta));

  React.useEffect(() => { setPulse(initPulseFromNeed(need.monthlyDelta)); }, [need.monthlyDelta]);

  const onEarn = (amt: number) => setPulse(p => addRecovery(p, amt));

  return (
    <main className="min-h-dvh p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">corAe Ascend — Signup Loop</h1>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="border rounded-2xl p-4">
          <h2 className="font-medium mb-2">2-min Diagnostic</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["incomeAED","Income"],
              ["fixedCostsAED","Fixed costs"],
              ["variableCostsAED","Variable costs"],
              ["savingsGoalAED","Savings goal"]
            ].map(([k,label])=>(
              <label key={k as string} className="flex items-center gap-2">
                <span className="w-28">{label}</span>
                <input type="number" className="input input-bordered w-full border rounded px-2 py-1"
                       value={(form as any)[k] ?? 0}
                       onChange={e => setForm(f => ({ ...f, [k]: Number(e.target.value||0) }))}/>
              </label>
            ))}
          </div>
        </div>

        <div className="border rounded-2xl p-4">
          <h2 className="font-medium mb-2">Your Monthly Delta</h2>
          <div className={`inline-flex items-center gap-2 rounded px-3 py-1 text-sm ${badge.tone==="down"?"bg-red-50":"bg-green-50"}`}>
            <span>{badge.label}</span>
            <span className="opacity-70">confidence {(need.confidence*100).toFixed(0)}%</span>
          </div>
          <p className="text-xs mt-2 opacity-70">We’ll help you flip this with Ascend tasks.</p>
        </div>
      </section>

      <section className="border rounded-2xl p-4">
        <h2 className="font-medium mb-2">Ascend Plan — Recover the Gap</h2>
        <div className="text-sm grid gap-2">
          <div>Target: <strong>{pulse.targetAED} AED</strong></div>
          <div>Recovered: <strong>{pulse.recoveredAED} AED</strong></div>
          <div>Progress: <strong>{pulse.percent}%</strong></div>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="rounded px-3 py-1 border" onClick={()=>onEarn(10)}>Complete micro-task +10 AED</button>
          <button className="rounded px-3 py-1 border" onClick={()=>onEarn(25)}>Affiliate action +25 AED</button>
          <button className="rounded px-3 py-1 border" onClick={()=>onEarn(50)}>Workflow shift +50 AED</button>
        </div>
        <p className="text-xs mt-2 opacity-70">These simulate corAe tasks; hook to real Marketplace later.</p>
      </section>
    </main>
  );
}
