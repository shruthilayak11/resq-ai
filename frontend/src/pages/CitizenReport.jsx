import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import TopBar from "../components/TopBar";
import PriorityBadge from "../components/PriorityBadge";
import { reportCitizenIncident } from "../api/client";
import { useToast } from "../components/Toast";

const TYPES = ["Flood", "Fire", "Medical Emergency", "Road Accident", "Building Collapse", "Missing Person", "Natural Disaster", "Other"];
const URGENCY = ["Immediate", "Urgent", "Normal"];

const EMPTY = {
  incident_type: "Flood",
  location: "",
  description: "",
  people_affected: 0,
  vulnerable_people: false,
  urgency: "Urgent",
  contact: "",
};

export default function CitizenReport() {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location.trim() || !form.description.trim()) {
      toast("Location and description are required.", "error");
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const incident = await reportCitizenIncident({ ...form, people_affected: Number(form.people_affected) || 0 });
      setResult(incident);
      toast("Report submitted. AI analysis and priority scoring complete.", "success");
      setForm(EMPTY);
    } catch {
      toast("Could not submit the report. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Report Emergency" />
      <div className="flex-1 overflow-y-auto p-5 max-w-3xl mx-auto w-full">
        <p className="text-sm text-[var(--color-muted)] mb-5">
          Describe what you're seeing in your own words. RESQ-AI's AI will extract the structured
          details automatically and route this to coordinators.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Incident type">
              <select
                value={form.incident_type}
                onChange={(e) => set("incident_type", e.target.value)}
                className="input"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Urgency">
              <select value={form.urgency} onChange={(e) => set("urgency", e.target.value)} className="input">
                {URGENCY.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Location">
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Katpadi, Vellore"
              className="input"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={5}
              placeholder="There is severe flooding near Katpadi. Around 30 people are stranded and several elderly residents need immediate medical assistance."
              className="input resize-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3 items-end">
            <Field label="Number of people affected">
              <input
                type="number"
                min={0}
                value={form.people_affected}
                onChange={(e) => set("people_affected", e.target.value)}
                className="input"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-[var(--color-text)] pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.vulnerable_people}
                onChange={(e) => set("vulnerable_people", e.target.checked)}
                className="accent-[var(--color-system)]"
              />
              Vulnerable people involved (elderly, children, disabled)
            </label>
          </div>

          <Field label="Contact information (optional)">
            <input
              value={form.contact}
              onChange={(e) => set("contact", e.target.value)}
              placeholder="Phone number or name"
              className="input"
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2.5 rounded bg-[var(--color-system)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Send size={15} />
            {submitting ? "Analysing report..." : "Submit Emergency Report"}
          </button>
        </form>

        {result && (
          <div className="mt-6 rounded border border-green-500/30 bg-green-500/5 p-4">
            <div className="flex items-center gap-2 mb-2 text-green-400">
              <CheckCircle2 size={16} />
              <span className="text-sm font-semibold">Report processed</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <PriorityBadge level={result.priority_level} size="lg" />
              <span className="font-mono text-lg font-bold">{result.priority_score}/100</span>
            </div>
            <p className="text-xs text-[var(--color-muted)] leading-relaxed">{result.priority_explanation}</p>
            <p className="text-[11px] text-[var(--color-dim)] mt-2">
              This incident is now visible on the Command Center dashboard and map.
            </p>
          </div>
        )}
      </div>
      <style>{`
        .input {
          width: 100%;
          background: var(--color-panel);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          padding: 0.5rem 0.65rem;
          font-size: 0.875rem;
          color: var(--color-text);
        }
        .input:focus { outline: none; border-color: var(--color-system); }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs text-[var(--color-muted)] mb-1">{label}</span>
      {children}
    </label>
  );
}
