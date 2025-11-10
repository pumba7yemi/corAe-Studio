import React from "react";
import SignPledge from "@/components/social/SignPledge.client";

export const metadata = {
  title: "The Social Contract — It Starts With You",
  description: "A calm, civic appeal to restore respect in daily life — small acts that rebuild community.",
  openGraph: { title: "The Social Contract — It Starts With You" },
  // tag used by internal nav tooling (developer hint)
  tags: ["Respect", "Community", "#Respect"],
};

// Server component — renders content and a small client CTA for interactive sign/pledge
export default function Page() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-6 prose">
      <header className="text-center">
        <h1 className="text-4xl font-bold">The Social Contract</h1>
        <p className="mt-2 text-lg text-muted-foreground">It Starts With You — Respect begins at home.</p>
      </header>

      <section className="mt-8">
        <h2>The Decline of Respect</h2>
        <p>
          Everyday civility has frayed — litter on sidewalks, abrupt driving, curt interactions, and a drifting apathy.
          These small acts add up, eroding trust and the dignity of shared life. Rebuilding respect starts in the
          quiet places: home, the street, and the way we treat our neighbours.
        </p>
      </section>

      <section className="mt-6">
        <h2>The Singapore Example</h2>
        <p>
          Singapore’s rise shows the power of civic discipline and widely-shared norms. Orderly streets and a culture
          of mutual respect create space for prosperity and safety. Structure and pride in public life are choices —
          everyday commitments that every citizen contributes to.
        </p>
      </section>

      <section className="mt-6">
        <h2>The Home Rule</h2>
        <p>
          Change begins at home. Teach respect by example. Small household practices — picking up litter, speaking
          kindly, slowing down in traffic, and honoring communal spaces — ripple outward. When households model
          dignity, communities follow.
        </p>
      </section>

      <section className="mt-8 border rounded-lg p-6 bg-neutral-50">
        <h3 className="mb-3">Sign the Contract</h3>
        <p className="text-sm text-muted-foreground">Join a simple civic pledge: one respectful act a day.</p>
        <div className="mt-4">
          <SignPledge />
        </div>
      </section>

      <section className="mt-8">
        <h3>Reflection</h3>
        <p className="italic">What one respectful act can you start today?</p>
        <textarea
          aria-label="reflection"
          className="w-full rounded-md border p-2 mt-2"
          placeholder="e.g. Leave the park cleaner than you found it"
        />
      </section>

      <footer className="mt-12 text-sm text-muted-foreground">Respect begins at home — The Social Contract returns.</footer>
    </main>
  );
}

// SignPledge is implemented as a client component at
// apps/studio/components/social/SignPledge.client.tsx
