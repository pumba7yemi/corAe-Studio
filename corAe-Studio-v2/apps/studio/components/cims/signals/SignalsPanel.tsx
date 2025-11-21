import React from "react";

type Level = "info" | "warn" | "critical";

type Signal = {
  id: string;
  source: string;
  text: string;
  time: string;
  level: Level;
};

export default function SignalsPanel() {
  // Demo feed (replace with live later)
  const signals: Signal[] = [
    { id: "sig-1", source: "Automate • Market", text: "Competitor price drop detected on SKU-PEPSI-500", level: "warn", time: "08:20" },
    { id: "sig-2", source: "POS", text: "Hourly sales below threshold for morning window", level: "info", time: "10:00" },
    { id: "sig-3", source: "Automate • Guard", text: "Guard `withinCeiling` blocked workflow run", level: "critical", time: "06:55" },
  ];

  const sortLevel = (l: Level) => (l === "critical" ? 2 : l === "warn" ? 1 : 0);
  const feed = [...signals].sort((a, b) => sortLevel(b.level) - sortLevel(a.level));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">Signals</h2>
        <div className="hidden sm:flex gap-2 items-center text-xs text-slate-500">
          <Chip tone="critical">Critical</Chip>
          <Chip tone="warn">Warning</Chip>
          <Chip tone="info">Info</Chip>
        </div>
      </div>

      <ul className="grid gap-4">
        {feed.map((s) => (
          <li
            key={s.id}
            className={[
              "rounded-2xl border p-4 bg-white transition shadow-sm",
              s.level === "critical"
                ? "border-rose-300/70 bg-rose-50/70"
                : s.level === "warn"
                ? "border-amber-300/70 bg-amber-50/70"
                : "border-slate-200 hover:bg-slate-50",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">{s.source}</span>
              <Chip tone={s.level}>{labelFor(s.level)}</Chip>
              <span className="text-xs text-slate-500 ml-auto">{s.time}</span>
            </div>
            <div className="mt-2 text-[15px] leading-6">{s.text}</div>

            <div className="mt-3 flex gap-2">
              {s.level !== "info" ? (
                <>
                  <PrimaryButton>Open</PrimaryButton>
                  <GhostButton>Acknowledge</GhostButton>
                </>
              ) : (
                <>
                  <GhostButton>Open</GhostButton>
                  <GhostButton>Acknowledge</GhostButton>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- tiny UI primitives ---------- */
function labelFor(level: Level) {
  return level === "critical" ? "Critical" : level === "warn" ? "Warning" : "Info";
}

function Chip({
  tone,
  children,
}: {
  tone: Level | "critical" | "warn" | "info";
  children: React.ReactNode;
}) {
  const map: Record<string, string> = {
    info: "bg-sky-100 text-sky-800 border-sky-200",
    warn: "bg-amber-100 text-amber-900 border-amber-200",
    critical: "bg-rose-100 text-rose-800 border-rose-200",
  };
  return (
    <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 border ${map[tone]}`}>
      {children}
    </span>
  );
}

function GhostButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm hover:bg-slate-100 transition">
      {children}
    </button>
  );
}

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-3 py-1.5 rounded-xl text-sm text-white bg-slate-900 hover:bg-slate-800 transition">
      {children}
    </button>
  );
}
