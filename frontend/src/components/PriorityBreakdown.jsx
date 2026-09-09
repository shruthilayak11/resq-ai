const FACTORS = [
  { key: "severity_score", label: "Severity", max: 30 },
  { key: "people_affected_score", label: "People affected", max: 25 },
  { key: "vulnerability_score", label: "Vulnerability", max: 20 },
  { key: "urgency_score", label: "Urgency", max: 15 },
  { key: "resource_gap_score", label: "Resource gap", max: 10 },
];

export default function PriorityBreakdown({ factors, score, level }) {
  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Priority Breakdown</h3>
        <span className="font-mono text-xl font-bold">{score}<span className="text-[var(--color-dim)] text-xs">/100</span></span>
      </div>
      <div className="space-y-2">
        {FACTORS.map((f) => {
          const val = factors[f.key] ?? 0;
          const pct = Math.min(100, (val / f.max) * 100);
          return (
            <div key={f.key}>
              <div className="flex justify-between text-[11px] text-[var(--color-muted)] mb-0.5">
                <span>{f.label}</span>
                <span className="font-mono">{val}/{f.max}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--color-border-soft)] overflow-hidden">
                <div className="h-full bg-[var(--color-system)] rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
