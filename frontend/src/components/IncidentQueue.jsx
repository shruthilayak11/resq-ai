import { useState } from "react";
import IncidentCard from "./IncidentCard";

const FILTERS = ["ALL", "ACTIVE", "RESOLVED"];

export default function IncidentQueue({ incidents, selectedId, onSelect }) {
  const [filter, setFilter] = useState("ACTIVE");

  const filtered = incidents.filter((i) => {
    if (filter === "ACTIVE") return i.status !== "RESOLVED";
    if (filter === "RESOLVED") return i.status === "RESOLVED";
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Priority Queue ({filtered.length})
        </h2>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                filter === f ? "bg-[var(--color-system-dim)] text-[var(--color-system)]" : "text-[var(--color-dim)] hover:text-[var(--color-text)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.length === 0 && (
          <p className="text-xs text-[var(--color-dim)] text-center py-6">No incidents in this view.</p>
        )}
        {filtered.map((inc, idx) => (
          <IncidentCard
            key={inc.id}
            incident={inc}
            rank={idx + 1}
            active={inc.id === selectedId}
            onClick={() => onSelect(inc)}
          />
        ))}
      </div>
    </div>
  );
}
