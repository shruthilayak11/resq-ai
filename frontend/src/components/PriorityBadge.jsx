import { AlertTriangle, ArrowUp, ArrowRight, ArrowDown } from "lucide-react";

const STYLES = {
  CRITICAL: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/40", Icon: AlertTriangle },
  HIGH: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/40", Icon: ArrowUp },
  MEDIUM: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/40", Icon: ArrowRight },
  LOW: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/40", Icon: ArrowDown },
};

export default function PriorityBadge({ level, size = "sm" }) {
  const s = STYLES[level] || STYLES.MEDIUM;
  const pad = size === "lg" ? "px-2.5 py-1 text-xs" : "px-1.5 py-0.5 text-[10px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border ${s.bg} ${s.text} ${s.border} ${pad} font-semibold tracking-wide`}
    >
      <s.Icon size={size === "lg" ? 12 : 10} strokeWidth={2.5} />
      {level}
    </span>
  );
}
