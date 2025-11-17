"use client";
import React, { useEffect, useState } from "react";

type Domains = { home: boolean; work: boolean; business: boolean };

export default function ProgressOverviewClient({ initial }: { initial: Domains }) {
  const [domains, setDomains] = useState<Domains>(initial);

  useEffect(() => {
    let mounted = true;
    const fetchDomains = async () => {
      try {
        const res = await fetch("/api/social-contract/alignment");
        if (!res.ok) return;
        const j = await res.json();
        if (mounted && j?.domains) setDomains(j.domains);
      } catch (e) {
        // noop
      }
    };

    fetchDomains();
    const id = setInterval(fetchDomains, 10000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const completeCount = Object.values(domains).filter(Boolean).length;
  const percent = Math.round((completeCount / 3) * 100);

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-between mb-2">
        <div className="text-sm font-medium">Alignment</div>
        <div className="text-sm font-medium">{percent}%</div>
      </div>

      <div className="w-full bg-gray-200 h-3 rounded overflow-hidden">
        <div
          style={{ width: `${percent}%` }}
          className="bg-green-500 h-3 transition-all duration-300"
        />
      </div>

      <div className="flex justify-between mt-3 text-sm">
        <div className={domains.home ? "text-green-600" : "text-gray-500"}>Home</div>
        <div className={domains.work ? "text-green-600" : "text-gray-500"}>Work</div>
        <div className={domains.business ? "text-green-600" : "text-gray-500"}>Business</div>
      </div>
    </div>
  );
}
