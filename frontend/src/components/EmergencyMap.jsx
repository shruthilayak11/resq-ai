import { useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import MapLegend from "./MapLegend";
import PriorityBadge from "./PriorityBadge";

const SEVERITY_COLOR = { CRITICAL: "#EF4444", HIGH: "#F97316", MEDIUM: "#EAB308", LOW: "#22C55E" };
const VOLUNTEER_COLOR = { AVAILABLE: "#22C55E", ASSIGNED: "#EAB308", EN_ROUTE: "#4C8DFF", BUSY: "#5B6577" };
const RESOURCE_COLOR = "#8592A6";

const CENTER = [12.95, 79.2];

export default function EmergencyMap({ incidents = [], volunteers = [], resources = [], onSelectIncident, onSelectVolunteer }) {
  const [layers, setLayers] = useState({ incidents: true, volunteers: true, resources: true });
  const toggle = (key) => setLayers((l) => ({ ...l, [key]: !l[key] }));

  const bounds = useMemo(() => CENTER, []);

  return (
    <div className="relative h-full w-full">
      <MapContainer center={bounds} zoom={10} className="h-full w-full" zoomControl={true}>
        <TileLayer
          className="map-dark-tiles"
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {layers.incidents &&
          incidents.map((inc) => (
            <CircleMarker
              key={inc.id}
              center={[inc.latitude, inc.longitude]}
              radius={inc.priority_level === "CRITICAL" ? 10 : 7}
              pathOptions={{
                color: SEVERITY_COLOR[inc.priority_level] || "#8592A6",
                fillColor: SEVERITY_COLOR[inc.priority_level] || "#8592A6",
                fillOpacity: 0.55,
                weight: 2,
              }}
              eventHandlers={{ click: () => onSelectIncident && onSelectIncident(inc) }}
            >
              <Popup>
                <div className="font-sans min-w-[180px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm">{inc.incident_type}</span>
                    <PriorityBadge level={inc.priority_level} />
                  </div>
                  <div className="text-xs opacity-80 mb-1">{inc.location}</div>
                  <div className="text-xs opacity-70">
                    {inc.people_affected} affected · {inc.status}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {layers.volunteers &&
          volunteers.map((v) => (
            <CircleMarker
              key={v.id}
              center={[v.latitude, v.longitude]}
              radius={5}
              pathOptions={{
                color: VOLUNTEER_COLOR[v.status] || "#5B6577",
                fillColor: VOLUNTEER_COLOR[v.status] || "#5B6577",
                fillOpacity: 0.85,
                weight: 1,
              }}
              eventHandlers={{ click: () => onSelectVolunteer && onSelectVolunteer(v) }}
            >
              <Popup>
                <div className="font-sans min-w-[160px]">
                  <div className="font-semibold text-sm mb-1">{v.name}</div>
                  <div className="text-xs opacity-80 mb-1">{v.skills.join(", ")}</div>
                  <div className="text-xs opacity-70">{v.status} · {v.location}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {layers.resources &&
          resources.map((r) => (
            <CircleMarker
              key={r.id}
              center={[r.latitude, r.longitude]}
              radius={4}
              pathOptions={{ color: RESOURCE_COLOR, fillColor: RESOURCE_COLOR, fillOpacity: 0.6, weight: 1 }}
            >
              <Popup>
                <div className="font-sans min-w-[160px]">
                  <div className="font-semibold text-sm mb-1">{r.name}</div>
                  <div className="text-xs opacity-70">{r.type} · capacity {r.capacity}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
      </MapContainer>
      <MapLegend layers={layers} onToggle={toggle} />
    </div>
  );
}
