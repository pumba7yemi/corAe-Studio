"use client";
import React from "react";
import HomeSectionLayout, { Card, Btn } from "../../_shared/HomeSectionLayout";

export default function FinanceFuelPage() {
  const profile = typeof window !== "undefined" ? (() => {
    try { return JSON.parse(localStorage.getItem("ascend:profile") || "null"); } catch { return null; }
  })() : null;

  const purchased = Number(profile?.financialBaseline?.timePurchasable ?? profile?.timePurchasable ?? 0);
  const reclaimed = Number(profile?.timeReclaimed ?? 0);

  return (
    <HomeSectionLayout title="Finance • Fuel" hint="Ideas to treat finance as time-fuel">
      <Card title="Finance-as-Fuel" hint="Treat money as a tool to buy time and capacity">
        <p className="text-sm text-zinc-300">This dev stub shows the current Ascend profile and provides quick actions that simulate purchases or redemptions of time.</p>

        <div className="mt-4 space-y-3">
          <div className="text-xs text-zinc-400">Time Purchased</div>
          <div className="text-xl font-semibold">{purchased} mins</div>
          <div className="text-xs text-zinc-400">Time Reclaimed</div>
          <div className="text-xl font-semibold">{reclaimed} mins</div>
        </div>

        <div className="mt-4 flex gap-2">
          <Btn onClick={() => {
            // simulate redeeming 30 minutes
            try {
              const curr = JSON.parse(localStorage.getItem('ascend:profile') || 'null') || {};
              curr.timeReclaimed = (Number(curr.timeReclaimed || 0) + 30);
              localStorage.setItem('ascend:profile', JSON.stringify(curr));
              try { (window as any).__CAIA?.quickAction?.('ascend.redeemTime', { minutes: 30 }); } catch (e) {}
              location.reload();
            } catch (e) { console.warn(e); }
          }}>Redeem 30m</Btn>

          <Btn variant="secondary" onClick={() => {
            // simulate purchasing 60 minutes (cost side-effect)
            try {
              const curr = JSON.parse(localStorage.getItem('ascend:profile') || 'null') || {};
              curr.financialBaseline = curr.financialBaseline || {};
              curr.financialBaseline.timePurchasable = (Number(curr.financialBaseline.timePurchasable || 0) + 60);
              localStorage.setItem('ascend:profile', JSON.stringify(curr));
              try { (window as any).__CAIA?.quickAction?.('ascend.purchaseTime', { minutes: 60 }); } catch (e) {}
              location.reload();
            } catch (e) { console.warn(e); }
          }}>Purchase 60m</Btn>
        </div>
      </Card>
    </HomeSectionLayout>
  );
}
