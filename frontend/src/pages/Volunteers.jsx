import { useState } from "react";
import TopBar from "../components/TopBar";
import VolunteerCard from "../components/VolunteerCard";
import { LoadingState, ErrorState } from "../components/LoadingState";
import { usePolling } from "../hooks/usePolling";
import { getVolunteers } from "../api/client";

const STATUS_FILTERS = ["ALL", "AVAILABLE", "ASSIGNED", "EN_ROUTE", "BUSY"];

export default function Volunteers() {
  const { data, loading, error, refresh } = usePolling(getVolunteers, 6000);
  const [filter, setFilter] = useState("ALL");

  if (loading && !data) return <><TopBar title="Volunteers" /><LoadingState /></>;
  if (error) return <><TopBar title="Volunteers" /><ErrorState onRetry={refresh} /></>;

  const volunteers = (data || []).filter((v) => filter === "ALL" || v.status === filter);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Volunteer Management" />
      <div className="flex items-center gap-1.5 px-5 pt-4">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-2.5 py-1 rounded border ${
              filter === f
                ? "border-[var(--color-system)] text-[var(--color-system)] bg-[var(--color-system-dim)]/40"
                : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
        <span className="ml-auto text-xs text-[var(--color-dim)]">{volunteers.length} volunteers</span>
      </div>
      <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {volunteers.map((v) => (
          <VolunteerCard key={v.id} volunteer={v} />
        ))}
      </div>
    </div>
  );
}
