const SEVERITY_DOTS = [
  { label: "Critical", color: "#EF4444" },
  { label: "High", color: "#F97316" },
  { label: "Medium", color: "#EAB308" },
  { label: "Low", color: "#22C55E" },
];

const VOLUNTEER_DOTS = [
  { label: "Available", color: "#22C55E" },
  { label: "Assigned", color: "#EAB308" },
  { label: "En route", color: "#4C8DFF" },
  { label: "Busy", color: "#5B6577" },
];

export default function MapLegend({ layers, onToggle }) {
  return (
    <div className="absolute bottom-3 left-3 z-[400] w-52 rounded border border-[var(--color-border)] bg-[var(--color-panel)]/95 backdrop-blur px-3 py-2.5 text-[11px]">
      <LayerRow label="Incidents" checked={layers.incidents} onChange={() => onToggle("incidents")} />
      <div className="pl-5 grid grid-cols-2 gap-x-2 gap-y-0.5 mb-1.5">
        {SEVERITY_DOTS.map((d) => (
          <Dot key={d.label} {...d} />
        ))}
      </div>
      <LayerRow label="Volunteers" checked={layers.volunteers} onChange={() => onToggle("volunteers")} />
      <div className="pl-5 grid grid-cols-2 gap-x-2 gap-y-0.5 mb-1.5">
        {VOLUNTEER_DOTS.map((d) => (
          <Dot key={d.label} {...d} />
        ))}
      </div>
      <LayerRow label="Resources" checked={layers.resources} onChange={() => onToggle("resources")} />
    </div>
  );
}

function LayerRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 py-0.5 cursor-pointer select-none text-[var(--color-text)]">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-[var(--color-system)]" />
      <span className="font-medium">{label}</span>
    </label>
  );
}

function Dot({ label, color }) {
  return (
    <div className="flex items-center gap-1.5 text-[var(--color-muted)]">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}
