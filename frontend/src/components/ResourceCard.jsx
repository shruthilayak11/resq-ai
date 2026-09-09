import { Building2, Warehouse, Siren, Ship, Truck, Briefcase, Wrench } from "lucide-react";

const ICONS = {
  Hospital: Building2,
  Shelter: Warehouse,
  "Emergency Response Center": Siren,
  Boat: Ship,
  Ambulance: Truck,
  "Medical Kit": Briefcase,
  "Rescue Equipment": Wrench,
};

export default function ResourceCard({ resource }) {
  const Icon = ICONS[resource.type] || Building2;
  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={15} className="text-[var(--color-system)]" />
        <span className="text-sm font-semibold">{resource.name}</span>
      </div>
      <div className="text-xs text-[var(--color-muted)]">{resource.type}</div>
      <div className="flex items-center justify-between mt-2 text-[11px] text-[var(--color-dim)]">
        <span className={resource.availability ? "text-green-400" : "text-[var(--color-dim)]"}>
          {resource.availability ? "Available" : "Unavailable"}
        </span>
        <span>Capacity: {resource.capacity}</span>
      </div>
    </div>
  );
}
