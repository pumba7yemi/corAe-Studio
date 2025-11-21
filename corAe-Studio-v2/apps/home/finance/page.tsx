"use client";
import React, { useEffect, useState } from "react";
import HomeSectionLayout, { Card, Btn, Input, Chip } from "../_shared/HomeSectionLayout";
import { loadDraft, saveDraft } from "../_shared/homeDraft";

const KEY = "finance";
type Item = { id: string; title: string };

export default function FinancePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [text, setText] = useState("");
  const [ascendProfile, setAscendProfile] = useState<any>(null);
  const [tpInput, setTpInput] = useState<string>("");
  const [trInput, setTrInput] = useState<string>("");

  useEffect(() => {
    const d = loadDraft<Record<string, any>>();
    setItems(Array.isArray(d[KEY]) ? d[KEY] : []);
    try {
      const raw = localStorage.getItem("ascend:profile");
      if (raw) setAscendProfile(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (ascendProfile) {
      const tp = ascendProfile?.financialBaseline?.timePurchasable ?? ascendProfile?.timePurchasable ?? "";
      const tr = ascendProfile?.timeReclaimed ?? "";
      setTpInput(tp === null ? "" : String(tp));
      setTrInput(tr === null ? "" : String(tr));
    } else {
      setTpInput("");
      setTrInput("");
    }
  }, [ascendProfile]);

  // derived numbers for display
  const purchasedNum = Number(ascendProfile?.financialBaseline?.timePurchasable ?? ascendProfile?.timePurchasable ?? 0);
  const reclaimedNum = Number(ascendProfile?.timeReclaimed ?? 0);
  const percentReclaimed = purchasedNum > 0 ? Math.round((reclaimedNum / purchasedNum) * 100) : 0;
  const currencyBalance = ascendProfile?.currencyBalance ?? ascendProfile?.financialBaseline?.currencyBalance ?? null;

  const add = () => {
    if (!text.trim()) return;
    const next = [...items, { id: crypto.randomUUID?.() ?? Math.random().toString(36), title: text.trim() }];
    setItems(next);
    saveDraft((prev) => ({ ...prev, [KEY]: next }));
    setText("");
  };
  const remove = (id: string) => {
    const next = items.filter(i => i.id !== id);
    setItems(next);
    saveDraft((p) => ({ ...p, [KEY]: next }));
  };

  return (
    <HomeSectionLayout title="Home • Finance" hint="Budgets, bills, priorities">
      <Card title="Finance List" hint="Add simple items now; extend schema later.">
        <div className="flex gap-2">
          <Input placeholder="e.g., April Budget Review" value={text} onChange={e => setText(e.target.value)} />
          <Btn variant="secondary" onClick={add}>+ Add</Btn>
        </div>
        {items.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {items.map(i => <Chip key={i.id} onRemove={() => remove(i.id)}>{i.title}</Chip>)}
          </div>
        )}
      </Card>
  {/* Finance Dashboard Stub */}
      <Card title="Finance Dashboard" hint="Time Purchased vs Time Reclaimed (mock)">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-sm text-zinc-400">Time Purchased (mins)</div>
            <div className="text-2xl font-semibold">{purchasedNum || "—"}</div>
            {currencyBalance != null && <div className="text-xs text-zinc-400 mt-1">Balance: {typeof currencyBalance === 'number' ? `$${currencyBalance.toFixed(2)}` : String(currencyBalance)}</div>}
          </div>
          <div>
            <div className="text-sm text-zinc-400">Time Reclaimed (mins)</div>
            <div className="text-2xl font-semibold">{reclaimedNum || "—"}</div>
            <div className="text-xs text-zinc-400 mt-1">{percentReclaimed}% reclaimed</div>
          </div>
        </div>

        <div className="mt-4">
          {/* simple bar visualization */}
          {(() => {
            const purchased = purchasedNum;
            const reclaimed = reclaimedNum;
            const max = Math.max(purchased, reclaimed, 1);
            return (
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-zinc-400">Purchased</div>
                  <div className="h-4 bg-zinc-800 rounded-md mt-1 relative">
                    <div style={{ width: `${Math.round((purchased / max) * 100)}%` }} className="h-4 bg-emerald-500 rounded-md" />
                    <div className="absolute right-2 top-0 text-xs text-zinc-100">{purchased}m</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Reclaimed</div>
                  <div className="h-4 bg-zinc-800 rounded-md mt-1 relative">
                    <div style={{ width: `${Math.round((reclaimed / max) * 100)}%` }} className="h-4 bg-sky-500 rounded-md" />
                    <div className="absolute right-2 top-0 text-xs text-zinc-100">{reclaimed}m</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="mt-4 text-sm text-zinc-400">Data is read from <code>localStorage[&quot;ascend:profile&quot;]</code>. This is a UI stub — connect to Ascend backend when available.</div>
      </Card>

      {/* Inline Ascend Profile editor (dev/testing) */}
      <Card title="Edit Ascend Profile (dev)" hint="Quickly set sample values for the Finance dashboard">
        {/* local inputs bound to profile values */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs text-zinc-400">Time Purchased (mins)</div>
            <Input
              type="number"
              placeholder="e.g. 120"
              value={typeof tpInput !== 'undefined' ? tpInput : ''}
              onChange={(e: any) => setTpInput(e.target.value)}
            />
          </div>
          <div>
            <div className="text-xs text-zinc-400">Time Reclaimed (mins)</div>
            <Input
              type="number"
              placeholder="e.g. 45"
              value={typeof trInput !== 'undefined' ? trInput : ''}
              onChange={(e: any) => setTrInput(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Btn onClick={() => {
            // build a profile object preserving other fields
            try {
              const profile = {
                ...(ascendProfile || {}),
                financialBaseline: {
                  ...(ascendProfile?.financialBaseline || {}),
                  timePurchasable: Number(tpInput || 0),
                },
                timeReclaimed: Number(trInput || 0),
              };
              // prefer CAIA helper if available
              try { (window as any).__CAIA?.setAscendProfile?.(profile); } catch (e) {}
              try { (window as any).__CAIA?.quickAction?.('ascend.setProfile', profile); } catch (e) {}
              localStorage.setItem('ascend:profile', JSON.stringify(profile));
              setAscendProfile(profile);
            } catch (e) {
              console.warn('failed saving ascend profile', e);
            }
          }}>Save Profile</Btn>

          <Btn variant="secondary" onClick={() => {
            try {
              localStorage.removeItem('ascend:profile');
              try { (window as any).__CAIA?.quickAction?.('ascend.clearProfile'); } catch (e) {}
              setAscendProfile(null);
              setTpInput('');
              setTrInput('');
            } catch (e) {
              console.warn('failed clearing ascend profile', e);
            }
          }}>Clear Profile</Btn>
        </div>
      </Card>
    </HomeSectionLayout>
  );
}

