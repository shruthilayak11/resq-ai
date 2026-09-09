import { MapPin, CheckCircle2 } from "lucide-react";

export default function VolunteerRecommendations({ recommendations, onAssign, assigning }) {
  if (!recommendations?.length) {
    return <p className="text-xs text-[var(--color-dim)] py-3">No matching volunteers found.</p>;
  }
  return (
    <div className="space-y-2">
      {recommendations.map((r) => (
        <div key={r.volunteer_id} className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{r.name}</span>
            <span className="font-mono text-sm font-bold text-[var(--color-system)]">{r.match_score}% Match</span>
          </div>
          <div className="text-xs text-[var(--color-muted)] mt-0.5">
            {r.skills.join(" + ") || "General support"}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="flex items-center gap-1 text-[11px] text-[var(--color-dim)]">
              <MapPin size={11} /> {r.distance_km} km · {r.status}
            </span>
            <button
              disabled={r.status !== "AVAILABLE" || assigning === r.volunteer_id}
              onClick={() => onAssign(r.volunteer_id)}
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-[var(--color-system)] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
            >
              <CheckCircle2 size={12} />
              {assigning === r.volunteer_id ? "Assigning..." : "Assign"}
            </button>
          </div>
          <p className="text-[11px] text-[var(--color-muted)] mt-1.5 leading-relaxed">{r.reason}</p>
        </div>
      ))}
    </div>
  );
}
