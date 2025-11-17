type AscendCardProps = {
  label: string;
  href: string;
};

export default function AscendCard({ label, href }: AscendCardProps) {
  return (
    <a
      href={href}
      className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col justify-between hover:border-sky-500 transition"
    >
      <p className="text-sm font-semibold text-slate-50">{label}</p>
      <span className="mt-4 text-xs text-sky-400 group-hover:translate-x-1 inline-flex items-center gap-1 transition">
        Go →
      </span>
    </a>
  );
}
