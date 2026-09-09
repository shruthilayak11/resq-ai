import PriorityBadge from "./PriorityBadge";
import { Users, Clock, Radio } from "lucide-react";

const SOURCE_COLOR = { CITIZEN: "text-[var(--color-system)]", AGENCY: "text-yellow-400", SENSOR: "text-purple-400" };

function timeAgo(iso) {
  const diffMin = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function IncidentCard({ incident, rank, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded border px-3 py-2.5 transition-colors ${
        active
          ? "border-[var(--color-system)] bg-[var(--color-system-dim)]/40"
          : "border-[var(--color-border)] bg-[var(--color-panel)] hover:border-[var(--color-dim)]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[var(--color-dim)]">#{rank}</span>
          <span className="text-sm font-semibold">{incident.incident_type}</span>
        </div>
        <span className="font-mono text-lg font-bold leading-none">{incident.priority_score}</span>
      </div>
      <div className="text-xs text-[var(--color-muted)] mt-0.5">{incident.location}</div>
      <div className="flex items-center justify-between mt-2">
        <PriorityBadge level={incident.priority_level} />
        <div className="flex items-center gap-2 text-[11px] text-[var(--color-dim)]">
          <span className="flex items-center gap-1">
            <Users size={11} /> {incident.people_affected}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} /> {timeAgo(incident.created_at)}
          </span>
        </div>
      </div>
      <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-mono ${SOURCE_COLOR[incident.source_type] || ""}`}>
        <Radio size={10} /> SOURCE: {incident.source_type} · {incident.status}
      </div>
    </button>
  );
}
