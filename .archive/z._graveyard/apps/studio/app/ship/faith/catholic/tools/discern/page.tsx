// @ts-ignore: Allow importing JSON without type declarations
import sin from "@/content/faith/catholic/assessments/sin.v1.json";
import React, { useEffect, useState } from "react";

export const metadata = {
  title: "Discern — Catholic",
  description: "AI-assisted spiritual discernment & sin examination.",
};

export default function Page() {
  const [DiscernComp, setDiscernComp] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    // Dynamically import the DiscernForm on the client to avoid build-time failures
    // @ts-ignore: optional dependency; suppress 'Cannot find module' when it's not installed
    import("@corae/faith-discern/render/DiscernForm")
      .then((mod) => {
        if (mounted && mod?.DiscernForm) setDiscernComp(() => mod.DiscernForm);
      })
      .catch(() => {
        // Ignore — we'll show a helpful fallback if the package isn't present
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="prose max-w-3xl mx-auto py-8">
      <h1>Discern</h1>
      <p className="text-sm opacity-80">Private. Local by default. Confession recommended for mortal findings.</p>
      <div className="mt-6">
        {DiscernComp ? (
          // DiscernForm expects a survey JSON; cast as any to avoid strict typing here
          <DiscernComp survey={sin as any} />
        ) : (
          <div className="rounded-lg border p-4 text-sm text-neutral-600">
            Discern tools are not available. To enable interactive discernment, install the
            optional package <code>@corae/faith-discern</code> or provide a client-side build that
            exposes <code>DiscernForm</code>.
          </div>
        )}
      </div>
    </div>
  );
}
