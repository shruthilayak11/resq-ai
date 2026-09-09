import { useState } from "react";
import { AlertTriangle, Activity, Users, UserCheck, CheckCircle2, Timer } from "lucide-react";
import TopBar from "../components/TopBar";
import StatCard from "../components/StatCard";
import EmergencyMap from "../components/EmergencyMap";
import IncidentQueue from "../components/IncidentQueue";
import IncidentDetail from "../components/IncidentDetail";
import { LoadingState, ErrorState } from "../components/LoadingState";
import { usePolling } from "../hooks/usePolling";
import { getDashboardStats, getIncidents, getVolunteers, getResources } from "../api/client";

export default function Dashboard() {
  const [selected, setSelected] = useState(null);

  const stats = usePolling(getDashboardStats, 4000);
  const incidentsPoll = usePolling(getIncidents, 4000);
  const volunteersPoll = usePolling(getVolunteers, 5000);
  const resourcesPoll = usePolling(getResources, 15000);

  const incidents = incidentsPoll.data || [];
  const volunteers = volunteersPoll.data || [];
  const resources = resourcesPoll.data || [];

  // keep the selected incident in sync with fresh polled data
  const selectedFresh = selected ? incidents.find((i) => i.id === selected.id) || selected : null;

  const handleChanged = () => {
    incidentsPoll.refresh();
    volunteersPoll.refresh();
    stats.refresh();
  };

  if (incidentsPoll.loading && !incidentsPoll.data) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Command Center" />
        <LoadingState label="Booting emergency operations dashboard..." />
      </div>
    );
  }

  if (incidentsPoll.error) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Command Center" />
        <ErrorState message="Could not reach the RESQ-AI backend. Is it running on :8000?" onRetry={incidentsPoll.refresh} />
      </div>
    );
  }

  const s = stats.data || {};

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Command Center" aiMode={s.ai_mode} />

      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        <StatCard label="Active Incidents" value={s.active_incidents ?? "—"} Icon={Activity} />
        <StatCard label="Critical" value={s.critical_incidents ?? "—"} tone="critical" Icon={AlertTriangle} />
        <StatCard label="Volunteers Available" value={s.volunteers_available ?? "—"} tone="good" Icon={Users} />
        <StatCard label="Volunteers Deployed" value={s.volunteers_deployed ?? "—"} tone="system" Icon={UserCheck} />
        <StatCard label="Resolved" value={s.incidents_resolved ?? "—"} tone="good" Icon={CheckCircle2} />
        <StatCard label="Avg Response" value={`${s.avg_response_time_minutes ?? "—"}m`} Icon={Timer} />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px_360px] gap-0 min-h-0 border-t border-[var(--color-border)]">
        <div className="min-h-[300px] lg:min-h-0 border-r border-[var(--color-border)]">
          <EmergencyMap
            incidents={incidents}
            volunteers={volunteers}
            resources={resources}
            onSelectIncident={setSelected}
            onSelectVolunteer={() => {}}
          />
        </div>
        <div className="border-r border-[var(--color-border)] min-h-[300px] lg:min-h-0">
          <IncidentQueue incidents={incidents} selectedId={selectedFresh?.id} onSelect={setSelected} />
        </div>
        <div className="min-h-[300px] lg:min-h-0">
          <IncidentDetail incident={selectedFresh} onClose={() => setSelected(null)} onChanged={handleChanged} />
        </div>
      </div>
    </div>
  );
}
