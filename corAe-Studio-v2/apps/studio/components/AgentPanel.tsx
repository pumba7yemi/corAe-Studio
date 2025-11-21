"use client";
import { useState } from "react";

export default function AgentPanel() {
  const [task, setTask] = useState("Wire MorningExec to /api/morning-exec and render KPIs.");
  const [log, setLog] = useState("");

  async function run() {
    setLog("Running…");
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task }),
    });
    const data = await res.json();
    setLog(data.output || JSON.stringify(data, null, 2));
  }

  return (
    <div className="card">
      <h3>Developer Agent</h3>
      <p className="small muted">Describe the change; CAIA proposes patches & applies them.</p>
      <textarea className="input" rows={4} value={task} onChange={(e)=>setTask(e.target.value)} />
      <div className="row" style={{ marginTop: 8, gap: 8 }}>
        <button className="btn primary" onClick={run}>Run Agent</button>
      </div>
      <pre className="small" style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{log}</pre>
    </div>
  );
}
