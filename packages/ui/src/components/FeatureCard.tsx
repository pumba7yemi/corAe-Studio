// packages/ui/src/components/FeatureCard.tsx
import Link from "next/link";
type Props = { title: string; subtitle?: string; href: string; cta?: string; hotkey?: string; };
export function FeatureCard({ title, subtitle, href, cta = "Open", hotkey }: Props) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {subtitle && <div className="subtitle">{subtitle}</div>}
      <div className="row" style={{ marginTop: 12, gap: 8 }}>
        <Link className="btn" href={href}>{cta}</Link>
        {hotkey && <span className="small muted">{hotkey}</span>}
      </div>
    </div>
  );
}
