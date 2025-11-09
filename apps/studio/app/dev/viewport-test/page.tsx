"use client";
import React, { useEffect, useRef, useState } from "react";
import HomeSectionLayout, { Card, Btn } from "../../ship/home/_shared/HomeSectionLayout";

export default function ViewportTestPage() {
  const refDvh = useRef<HTMLDivElement | null>(null);
  const refVh = useRef<HTMLDivElement | null>(null);
  const refStyle = useRef<HTMLDivElement | null>(null);
  const [measure, setMeasure] = useState<any>({});

  function doMeasure() {
    const inner = typeof window !== "undefined" ? window.innerHeight : 0;
    const dvh = refDvh.current?.clientHeight ?? 0;
    const vh = refVh.current?.clientHeight ?? 0;
    const styled = refStyle.current?.clientHeight ?? 0;
    setMeasure({ inner, dvh, vh, styled, ts: new Date().toISOString() });
  }

  useEffect(() => { doMeasure(); window.addEventListener("resize", doMeasure); return () => window.removeEventListener("resize", doMeasure); }, []);

  return (
    <HomeSectionLayout title="Dev • Viewport test" hint="Compare min-h-dvh vs min-h-screen and 100dvh style">
      <Card title="Viewport measures" hint="Resize the window / rotate device to observe differences">
        <div className="space-y-3">
          <div className="flex gap-3">
            <Btn onClick={doMeasure}>Measure now</Btn>
            <Btn variant="secondary" onClick={() => { localStorage.removeItem('ascend:profile'); alert('ascend:profile removed'); }}>Clear ascend:profile</Btn>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-zinc-800 p-3">
              <div className="text-xs text-zinc-400">Browser innerHeight</div>
              <div className="text-lg font-semibold">{measure.inner ?? '—'} px</div>
            </div>

            <div className="rounded border border-zinc-800 p-3">
              <div className="text-xs text-zinc-400">CSS min-h-dvh element</div>
              <div ref={refDvh} className="min-h-dvh bg-zinc-900/40 mt-2 rounded">&nbsp;</div>
              <div className="text-sm text-zinc-300 mt-2">Measured: {measure.dvh ?? '—'} px</div>
            </div>

            <div className="rounded border border-zinc-800 p-3">
              <div className="text-xs text-zinc-400">CSS min-h-screen element (100vh)</div>
              <div ref={refVh} className="min-h-screen bg-zinc-900/40 mt-2 rounded">&nbsp;</div>
              <div className="text-sm text-zinc-300 mt-2">Measured: {measure.vh ?? '—'} px</div>
            </div>

            <div className="rounded border border-zinc-800 p-3">
              <div className="text-xs text-zinc-400">Inline style 100dvh</div>
              <div ref={refStyle} style={{ minHeight: '100dvh' }} className="bg-zinc-900/40 mt-2 rounded">&nbsp;</div>
              <div className="text-sm text-zinc-300 mt-2">Measured: {measure.styled ?? '—'} px</div>
            </div>
          </div>

          <div className="text-xs text-zinc-400">Last measured: {measure.ts ?? '—'}</div>
        </div>
      </Card>
    </HomeSectionLayout>
  );
}
