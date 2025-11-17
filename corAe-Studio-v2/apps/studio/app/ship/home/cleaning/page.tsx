"use client";

import React, { useEffect, useState } from "react";
import HomeSectionLayout, { Card, Btn, Input, Chip, Textarea } from "../_shared/HomeSectionLayout";
import { loadDraft, saveDraft } from "../_shared/homeDraft";

const KEY = "cleaning";

type Task = { id: string; title: string; checklist?: string[] };

export default function CleaningPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [list, setList] = useState("");

  useEffect(() => {
    const d = loadDraft<Record<string, any>>();
    setTasks(Array.isArray(d?.[KEY]) ? d[KEY] : []);
  }, []);

  const add = () => {
    if (!title.trim()) return;
    const next = [
      ...tasks,
      {
        id: (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        title: title.trim(),
        checklist: list
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean),
      },
    ];
    setTasks(next);
    saveDraft((p: any) => ({ ...(p || {}), [KEY]: next }));
    setTitle("");
    setList("");
  };

  const remove = (id: string) => {
    const n = tasks.filter((t) => t.id !== id);
    setTasks(n);
    saveDraft((p: any) => ({ ...(p || {}), [KEY]: n }));
  };

  return (
    <HomeSectionLayout title="Home • Cleaning" hint="Routines & checklists">
      <Card title="Add Cleaning Task">
        <Input placeholder="e.g., Kitchen Reset (Nightly)" value={title} onChange={(e: any) => setTitle(e.target.value)} />
        <Textarea
          placeholder={"Checklist (one per line)\nWipe counters\nLoad dishwasher\nSweep floor"}
          value={list}
          onChange={(e: any) => setList(e.target.value)}
        />
        <Btn variant="secondary" onClick={add}>
          + Add Task
        </Btn>

        {tasks.length > 0 && (
          <div className="mt-3 space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <strong>{t.title}</strong>
                  <Btn variant="danger" onClick={() => remove(t.id)}>
                    Remove
                  </Btn>
                </div>
                {t.checklist && t.checklist.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-zinc-300">
                    {t.checklist?.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </HomeSectionLayout>
  );
}
