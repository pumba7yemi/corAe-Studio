// apps/studio/app/oms/forge/page.tsx
import { enqueueSelfTest, devPassChecks, builderConfirm } from "../../../../../lib/forge/actions";

export default function ForgePage() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600 }}>Forge Control</h1>

      <div style={{ display: "grid", gap: 16, marginTop: 16, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <form action={enqueueSelfTest} style={{ border: "1px solid #ccc", padding: 16, borderRadius: 12 }}>
          <h2 style={{ fontWeight: 600 }}>Agent</h2>
          <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 12 }}>Enqueue self-test job</p>
          <button type="submit">Enqueue</button>
        </form>

        <form action={devPassChecks} style={{ border: "1px solid #ccc", padding: 16, borderRadius: 12 }}>
          <h2 style={{ fontWeight: 600 }}>Developer</h2>
          <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 12 }}>Mark checks PASS + Ribbon GREEN</p>
          <button type="submit">Pass Checks</button>
        </form>

        <form action={builderConfirm} style={{ border: "1px solid #ccc", padding: 16, borderRadius: 12 }}>
          <h2 style={{ fontWeight: 600 }}>Builder</h2>
          <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 12 }}>Write Confirm tag</p>
          <button type="submit">Confirm</button>
        </form>
      </div>
    </div>
  );
}
