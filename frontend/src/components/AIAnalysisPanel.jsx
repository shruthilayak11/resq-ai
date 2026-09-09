import { Cpu, Sparkles } from "lucide-react";

export default function AIAnalysisPanel({ incident }) {
  const isReal = incident.ai_mode === "REAL";
  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
      <div className="flex items-center gap-1.5 mb-3">
        <Cpu size={13} className={isReal ? "text-[var(--color-system)]" : "text-[var(--color-dim)]"} />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          AI {isReal ? "Analysis" : "Simulation Mode"}
        </h3>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs mb-3">
        <Field label="Detected type" value={incident.incident_type} />
        <Field label="Severity" value={incident.severity} />
        <Field label="People affected" value={incident.people_affected} />
        <Field label="Urgency" value={incident.urgency} />
        <Field label="Vulnerable groups" value={incident.vulnerable_groups.join(", ") || "None detected"} span />
        <Field label="Required skills" value={incident.required_skills.join(", ") || "None detected"} span />
        <Field label="Required resources" value={incident.required_resources.join(", ") || "None detected"} span />
      </dl>

      <div className="rounded bg-[var(--color-border-soft)] border border-[var(--color-border)] p-2.5">
        <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wide text-[var(--color-dim)]">
          <Sparkles size={11} /> Explanation
        </div>
        <p className="text-xs text-[var(--color-text)] leading-relaxed">{incident.priority_explanation}</p>
      </div>
    </div>
  );
}

function Field({ label, value, span }) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <dt className="text-[10px] uppercase tracking-wide text-[var(--color-dim)]">{label}</dt>
      <dd className="text-[var(--color-text)] mt-0.5">{value}</dd>
    </div>
  );
}
