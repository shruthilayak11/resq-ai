const STATUS_COLOR = {
  AVAILABLE: "text-green-400 border-green-500/40 bg-green-500/10",
  ASSIGNED: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  EN_ROUTE: "text-[var(--color-system)] border-[var(--color-system)]/40 bg-[var(--color-system-dim)]/40",
  BUSY: "text-[var(--color-dim)] border-[var(--color-border)] bg-white/5",
};

export default function VolunteerCard({ volunteer }) {
  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold">{volunteer.name}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${STATUS_COLOR[volunteer.status]}`}>
          {volunteer.status.replace("_", " ")}
        </span>
      </div>
      <div className="text-xs text-[var(--color-muted)] mb-1.5">{volunteer.location}</div>
      <div className="flex flex-wrap gap-1 mb-2">
        {volunteer.skills.map((s) => (
          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-border-soft)] text-[var(--color-muted)]">
            {s}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px] text-[var(--color-dim)]">
        <span>{volunteer.experience}</span>
        <span>{volunteer.current_assignments}/{volunteer.capacity} assignments</span>
      </div>
    </div>
  );
}
