import TopBar from "../components/TopBar";
import SimulationConsole from "../components/SimulationConsole";

export default function Simulation() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Simulation Console" />
      <div className="flex-1 overflow-y-auto p-5 max-w-2xl">
        <p className="text-sm text-[var(--color-muted)] mb-5">
          Trigger realistic incidents from citizen, agency, or sensor sources to demonstrate the
          full COLLECT → UNDERSTAND → PRIORITISE → MATCH → COORDINATE pipeline live. Each simulated
          incident is analysed by AI, scored by the priority engine, matched to volunteers, and
          appears immediately on the Command Center dashboard and map.
        </p>
        <SimulationConsole />
      </div>
    </div>
  );
}
