import { useState } from "react";
import { Waves, Flame, HeartPulse, Car, Building, Landmark, Satellite, RotateCcw } from "lucide-react";
import { simulateIncident, demoReset } from "../api/client";
import { useToast } from "./Toast";
import { ConfirmDialog } from "./Modal";

const SCENARIOS = [
  { key: "flood", label: "Simulate Flood", Icon: Waves },
  { key: "fire", label: "Simulate Fire", Icon: Flame },
  { key: "medical", label: "Simulate Medical", Icon: HeartPulse },
  { key: "accident", label: "Simulate Accident", Icon: Car },
  { key: "collapse", label: "Simulate Building Collapse", Icon: Building },
];

export default function SimulationConsole({ onSimulated }) {
  const [pending, setPending] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const toast = useToast();

  const run = async (scenario, sourceType = "CITIZEN") => {
    setPending(scenario + sourceType);
    try {
      const incident = await simulateIncident(scenario, sourceType);
      toast(`New ${incident.incident_type} incident simulated — priority ${incident.priority_score} (${incident.priority_level}).`, "success");
      onSimulated && onSimulated(incident);
    } catch {
      toast("Simulation failed. Check that the backend is running.", "error");
    } finally {
      setPending(null);
    }
  };

  const handleReset = async () => {
    try {
      const result = await demoReset();
      toast(`Demo scenario loaded: ${result.incidents} incidents, ${result.volunteers} volunteers.`, "success");
      onSimulated && onSimulated();
    } catch {
      toast("Could not reset demo scenario.", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-2">
          Citizen-reported scenarios
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SCENARIOS.map(({ key, label, Icon }) => (
            <button
              key={key}
              disabled={pending === key + "CITIZEN"}
              onClick={() => run(key, "CITIZEN")}
              className="flex items-center gap-2 rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2.5 text-sm hover:border-[var(--color-system)] hover:text-[var(--color-system)] disabled:opacity-40 transition-colors"
            >
              <Icon size={15} />
              {pending === key + "CITIZEN" ? "Submitting..." : label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-2">
          Multi-source ingestion
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            disabled={pending === "floodAGENCY"}
            onClick={() => run("flood", "AGENCY")}
            className="flex items-center gap-2 rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2.5 text-sm hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-40 transition-colors"
          >
            <Landmark size={15} />
            {pending === "floodAGENCY" ? "Submitting..." : "Simulate Agency Feed"}
          </button>
          <button
            disabled={pending === "floodSENSOR"}
            onClick={() => run("flood", "SENSOR")}
            className="flex items-center gap-2 rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2.5 text-sm hover:border-purple-400 hover:text-purple-400 disabled:opacity-40 transition-colors"
          >
            <Satellite size={15} />
            {pending === "floodSENSOR" ? "Submitting..." : "Simulate Sensor Feed"}
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-[var(--color-border)]">
        <button
          onClick={() => setConfirmReset(true)}
          className="flex items-center gap-2 text-xs px-3 py-2 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <RotateCcw size={13} />
          Load Demo Scenario (resets system)
        </button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleReset}
        title="Reset system for demo?"
        message="This clears all current incidents, volunteers, and assignments and reloads the controlled demo scenario. Use this right before presenting to judges."
        confirmLabel="Load Demo Scenario"
      />
    </div>
  );
}
