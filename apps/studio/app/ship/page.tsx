// apps/studio/apps/ship/app/ship/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
// keep shadcn buttons/inputs, but drop Card to avoid bg-card white
import { Button } from '../../../../src/components/ui/button';
import { Input } from '../../../../src/components/ui/input';
import { Separator } from '../../../../src/components/ui/separator';

const DEMOS = [
  { id: 'choiceplus', name: 'Choice Plus Supermarket', path: '/business/oms/obari' },
  { id: 'alamba', name: 'Al Amba Restaurant', path: '/business/oms/obari' },
  { id: 'glamglow', name: 'Glam & Glow Salon', path: '/business/oms/obari' },
  { id: 'vsprop', name: 'VS Property Group', path: '/business/oms/obari' },
  { id: 'gracegrit', name: 'Grace & Grit Gym', path: '/business/oms/obari' },
];

export default function ShipRootSignIn() {
  const router = useRouter();
  const [user, setUser] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleEnter() {
    if (!user.trim()) return setError('Please enter your name or role');
    if (!selected) return setError('Please select a demo company');
    setError(null);
    localStorage.setItem('corae.user', user.trim());
    localStorage.setItem('corae.demo', selected);
    const demo = DEMOS.find((d) => d.id === selected);
    if (demo) (router as any).push(demo.path);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0d12] text-slate-100">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90rem_60rem_at_80%_-10%,rgba(21,122,255,0.18),transparent_60%),radial-gradient(70rem_50rem_at_-20%_110%,rgba(16,185,129,0.15),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 mask-[radial-gradient(ellipse_at_center,black,transparent_70%)] bg-linear-to-r from-gray-100 to-gray-200 bg-size-[32px_32px]" />

      <section className="relative z-10 mx-auto w-full max-w-md px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* corAe header */}
          <div className="flex items-center justify-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-sky-500 to-emerald-500 text-white shadow-lg shadow-sky-900/30">
              <span className="text-xs font-semibold">cA</span>
            </div>
            <h1 className="text-center text-[26px] font-semibold tracking-tight text-slate-100">
              corAe • Ship
            </h1>
          </div>

          {/* DARK PANEL (no Card) */}
          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/85 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] p-6 space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-center">Select a company & sign in</h2>
              <p className="text-center text-xs text-slate-400">
                Your session is local to this browser. Change anytime.
              </p>
            </div>

            {/* user input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Your name / role</label>
              <Input
                value={user}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser(e.target.value)}
                placeholder="e.g. Manager, Owner, Staff"
                className="bg-slate-900/60! border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <Separator className="bg-slate-800/60" />

            {/* demo list */}
            <div className="grid gap-2">
              {DEMOS.map((d) => (
                <Button
                  key={d.id}
                  variant={selected === d.id ? 'default' : 'outline'}
                  onClick={() => setSelected(d.id)}
                  className={`justify-start transition-colors ${
                    selected === d.id
                      ? 'bg-sky-600! hover:bg-sky-500! text-white border-transparent!'
                      : 'bg-slate-900/40! hover:bg-slate-900/70! text-slate-200 border-slate-700!'
                  }`}
                >
                  <span className="mr-2 text-xs opacity-70">●</span>
                  {d.name}
                </Button>
              ))}
            </div>

            {/* errors */}
            {error && (
              <div className="rounded-md border border-rose-700/50 bg-rose-900/30 px-3 py-2 text-xs text-rose-200">
                {error}
              </div>
            )}

            {/* enter button */}
            <div className="pt-2">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30"
                onClick={handleEnter}
              >
                Enter corAe Ship
              </Button>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-500">
            Demos: ChoicePlus • AlAmba • Glam&Glow • VS Property • Grace&Grit
          </p>
        </motion.div>
      </section>
    </main>
  );
}