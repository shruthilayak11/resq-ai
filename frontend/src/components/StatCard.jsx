export default function StatCard({ label, value, sub, tone = "default", Icon }) {
  const toneColor = {
    default: "text-[var(--color-text)]",
    critical: "text-red-400",
    system: "text-[var(--color-system)]",
    good: "text-green-400",
  }[tone];

  return (
    <div className="flex-1 min-w-[140px] rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-wide text-[var(--color-dim)]">{label}</span>
        {Icon && <Icon size={14} className="text-[var(--color-dim)]" />}
      </div>
      <div className={`font-mono text-2xl font-semibold ${toneColor}`}>{value}</div>
      {sub && <div className="text-[11px] text-[var(--color-muted)] mt-0.5">{sub}</div>}
    </div>
  );
}
