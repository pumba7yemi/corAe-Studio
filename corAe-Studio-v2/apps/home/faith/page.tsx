"use client";

/* ──────────────────────────────────────────────────────────────
   corAe — Ship/Home/Faith (Overview)
   Inclusive directory of faith traditions living *inside* Home.
   - Local, no external deps
   - Search + filter
   - Links into /ship/home/faith/discern (works even if params are ignored)
────────────────────────────────────────────────────────────── */

import { useMemo, useState } from "react";

type Tradition = {
  id: string;
  name: string;
  family: string; // broad grouping
  summary: string;
  aliases?: string[];
};

const TRADITIONS: Tradition[] = [
  { id: "christianity", name: "Christianity", family: "Abrahamic",
    summary: "Following Jesus Christ; Scripture, prayer, sacraments, love of God and neighbour.",
    aliases: ["Catholic", "Orthodox", "Protestant"] },
  { id: "islam", name: "Islam", family: "Abrahamic",
    summary: "Submission to God (Allah); Qur’an, prayer (salat), fasting, charity, pilgrimage.",
    aliases: ["Sunni", "Shia", "Sufi"] },
  { id: "judaism", name: "Judaism", family: "Abrahamic",
    summary: "Covenant with the God of Israel; Torah, prayer, mitzvot, community and remembrance." },
  { id: "hinduism", name: "Hinduism", family: "Dharmic",
    summary: "Dharma (duty), yoga, devotion and knowledge paths; diverse traditions and deities." },
  { id: "buddhism", name: "Buddhism", family: "Dharmic",
    summary: "Four Noble Truths, Noble Eightfold Path; mindfulness, compassion, liberation (nirvana)." },
  { id: "sikhism", name: "Sikhism", family: "Dharmic",
    summary: "One God, equality, seva (service), the Guru Granth Sahib; disciplined daily remembrance." },
  { id: "bahai", name: "Bahá’í Faith", family: "Abrahamic (post-Islamic)",
    summary: "Unity of God, religion, and humanity; progressive revelation and global community." },
  { id: "jainism", name: "Jainism", family: "Dharmic",
    summary: "Ahimsa (non-violence), truth, self-discipline; liberation through non-attachment." },
  { id: "taoism", name: "Taoism", family: "Chinese",
    summary: "Harmony with the Tao (Way); simplicity, wu-wei (non-forcing), inner cultivation." },
  { id: "confucianism", name: "Confucianism", family: "Chinese",
    summary: "Virtue, ritual, family reverence; moral cultivation for social harmony." },
  { id: "shinto", name: "Shintō", family: "Japanese",
    summary: "Way of the kami; purity, gratitude, seasonal rites and reverence for place." },
  { id: "indigenous", name: "Indigenous / Traditional", family: "Various",
    summary: "Ancestral lifeways, land-based wisdom, ceremony, kinship with creation." },
  { id: "seeking", name: "Seeking / Secular Spirituality", family: "Open",
    summary: "Meaning, ethics, and contemplation without formal affiliation; honest search." },
];

export default function FaithHomePage() {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<string>("All");

  const families = useMemo<string[]>(
    () => ["All", ...Array.from(new Set(TRADITIONS.map(t => t.family)))],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TRADITIONS.filter(t => {
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        (t.aliases || []).some(a => a.toLowerCase().includes(q));
      const matchesFamily = family === "All" || t.family === family;
      return matchesQuery && matchesFamily;
    });
  }, [query, family]);

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">🙏 Faith inside Home</h1>
        <p className="text-sm text-neutral-600">
          corAe welcomes your path to peace. Explore different traditions below.
          Choose one to enter Discernment with your lens in mind.
        </p>
      </header>

      {/* Controls */}
      <section className="rounded-2xl border p-4 bg-white shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex-1 text-sm">
            <span className="mr-2 text-neutral-600">Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, family, or alias…"
              className="w-full md:w-80 rounded-lg border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="mr-2 text-neutral-600">Family</span>
            <select
              value={family}
              onChange={(e) => setFamily(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              {families.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
          <a
            href="/ship/home"
            className="ml-auto rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
          >
            Back to Home
          </a>
        </div>
      </section>

      {/* List */}
      <section className="grid gap-4 md:grid-cols-2">
        {filtered.map(t => (
          <article key={t.id} className="rounded-2xl border p-4 bg-white shadow-sm">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">{t.name}</h2>
                <p className="text-xs text-neutral-500">{t.family}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/ship/home/faith/discern?tradition=${encodeURIComponent(t.id)}`}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
                  title="Enter Discernment with this lens"
                >
                  Discern with this lens
                </a>
                {t.id === "christianity" && (
                  <a
                    href="/ship/faith/catholic/core-beliefs"
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
                  >
                    Core Beliefs (Catholic)
                  </a>
                )}
              </div>
            </header>
            <p className="text-sm text-neutral-700 mt-2">{t.summary}</p>
            {t.aliases && t.aliases.length > 0 && (
              <p className="text-xs text-neutral-500 mt-2">
                Includes: {t.aliases.join(", ")}
              </p>
            )}
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border p-6 text-sm text-neutral-600">
            No matches. Try a different search or family.
          </div>
        )}
      </section>
    </main>
  );
}
