export function PoweredByBadge({ show = true }: { show?: boolean }) {
  if (!show) return null as any;
  return (
    <span className="inline-flex items-center text-xs text-slate-400">Powered by corAe</span>
  );
}

export default PoweredByBadge;
