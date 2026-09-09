import { useState } from "react";
import { X, MapPin, Clock, Radio } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import AIAnalysisPanel from "./AIAnalysisPanel";
import PriorityBreakdown from "./PriorityBreakdown";
import StatusTimeline from "./StatusTimeline";
import VolunteerRecommendations from "./VolunteerRecommendations";
import { createAssignment, updateIncidentStatus } from "../api/client";
import { useToast } from "./Toast";

const NEXT_STATUS = {
  REPORTED: "ANALYSED",
  ANALYSED: "PRIORITISED",
  PRIORITISED: "ASSIGNED",
  ASSIGNED: "DISPATCHED",
  DISPATCHED: "RESOLVED",
};

export default function IncidentDetail({ incident, onClose, onChanged }) {
  const [assigning, setAssigning] = useState(null);
  const toast = useToast();

  if (!incident) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-[var(--color-dim)] px-4 text-center">
        Select an incident from the queue or the map to view details.
      </div>
    );
  }

  const handleAssign = async (volunteerId) => {
    setAssigning(volunteerId);
    try {
      await createAssignment(incident.id, volunteerId);
      toast("Volunteer assigned and dispatched to the incident.", "success");
      onChanged();
    } catch {
      toast("Could not assign volunteer. Please try again.", "error");
    } finally {
      setAssigning(null);
    }
  };

  const advanceStatus = async () => {
    const next = NEXT_STATUS[incident.status];
    if (!next) return;
    try {
      await updateIncidentStatus(incident.id, next);
      toast(`Incident marked ${next}.`, "success");
      onChanged();
    } catch {
      toast("Could not update status.", "error");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between px-3 py-2.5 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[var(--color-dim)]">{incident.id}</span>
            <PriorityBadge level={incident.priority_level} size="lg" />
          </div>
          <h2 className="text-base font-semibold mt-1">{incident.incident_type}</h2>
        </div>
        <button onClick={onClose} className="text-[var(--color-dim)] hover:text-[var(--color-text)]">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="text-xs text-[var(--color-muted)] space-y-1">
          <div className="flex items-center gap-1.5"><MapPin size={11} /> {incident.location}</div>
          <div className="flex items-center gap-1.5"><Clock size={11} /> {new Date(incident.created_at).toLocaleString("en-IN")}</div>
          <div className="flex items-center gap-1.5"><Radio size={11} /> SOURCE: {incident.source_type}</div>
        </div>

        <p className="text-xs text-[var(--color-text)] bg-[var(--color-panel)] border border-[var(--color-border)] rounded p-2.5 leading-relaxed">
          &ldquo;{incident.raw_description}&rdquo;
        </p>

        <div className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
          <StatusTimeline status={incident.status} />
          {NEXT_STATUS[incident.status] && (
            <button
              onClick={advanceStatus}
              className="mt-3 w-full text-xs py-1.5 rounded border border-[var(--color-border)] hover:border-[var(--color-system)] hover:text-[var(--color-system)]"
            >
              Mark as {NEXT_STATUS[incident.status]}
            </button>
          )}
        </div>

        <AIAnalysisPanel incident={incident} />
        <PriorityBreakdown factors={incident.priority_factors} score={incident.priority_score} level={incident.priority_level} />

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-2">
            Recommended Volunteers
          </h3>
          <VolunteerRecommendations
            recommendations={incident.recommended_volunteers}
            onAssign={handleAssign}
            assigning={assigning}
          />
        </div>
      </div>
    </div>
  );
}
