'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

type Demo = { id: string; name: string; path: string };

// OBARI is ship-specific → all demos land in the same OBARI hub.
// We still store which demo (company) was chosen for branding/data seeding.
const DEMOS: Demo[] = [
  { id: 'choiceplus', name: 'Choice Plus Supermarket', path: '/business/oms/obari' },
  { id: 'alamba',     name: 'Al Amba Restaurant',     path: '/business/oms/obari' },
  { id: 'glamglow',   name: 'Glam & Glow Salon',      path: '/business/oms/obari' },
  { id: 'vsprop',     name: 'VS Property Group',      path: '/business/oms/obari' },
  { id: 'gracegrit',  name: 'Grace & Grit Gym',       path: '/business/oms/obari' },
];

export default function ShipRootSignIn() {
  const router = useRouter();
  const [user, setUser] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If a session already exists, jump straight in
  useEffect(() => {
    const u = localStorage.getItem('corae.user');
    const d = localStorage.getItem('corae.demo');
      if (u && d) {
      const demo = DEMOS.find(x => x.id === d) ?? DEMOS[0];
      // Some router typings here are narrow in this workspace; use push which is present.
      router.push(demo.path);
    }
  }, [router]);

  function handleEnter() {
    if (!user.trim()) {
      setError('Please enter your name or role');
      return;
    }
    if (!selected) {
      setError('Please select a demo company');
      return;
    }
    setError(null);
    localStorage.setItem('corae.user', user.trim());
    localStorage.setItem('corae.demo', selected);
    const demo = DEMOS.find((d) => d.id === selected) ?? DEMOS[0];
    router.push(demo.path);
  }

  function clearSession() {
    localStorage.removeItem('corae.user');
    localStorage.removeItem('corae.demo');
    setError(null);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-slate-100 to-slate-200 p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <Card className="shadow-xl border-none">
          <CardContent className="p-6 space-y-4">
            <h1 className="text-2xl font-bold text-center">Welcome to corAe Ship</h1>
            <p className="text-center text-sm text-muted-foreground">
              Sign in and choose a demo company to start the OBARI flow.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Name / Role</label>
              <Input
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="e.g. Manager, Owner, Staff"
              />
            </div>

            <Separator />

            <div className="grid gap-2">
              {DEMOS.map((d) => (
                <Button
                  key={d.id}
                  variant={selected === d.id ? 'default' : 'outline'}
                  onClick={() => setSelected(d.id)}
                  className="justify-start"
                >
                  {d.name}
                </Button>
              ))}
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="pt-4 flex gap-2">
              <Button className="w-full" onClick={handleEnter}>
                Enter corAe Ship
              </Button>
              <Button variant="secondary" onClick={clearSession}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}