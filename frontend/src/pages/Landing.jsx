import { Link } from "react-router-dom";
import {
  ShieldHalf, ArrowRight, Radio, Brain, ScaleIcon, Users, Map, Activity,
  Waves, Flame, HeartPulse,
} from "lucide-react";

const WORKFLOW = ["Collect", "Understand", "Prioritise", "Match", "Coordinate"];

const CAPABILITIES = [
  {
    Icon: Radio,
    title: "Multi-source ingestion",
    body: "Citizen reports, agency feeds, and sensor alerts all normalize into one incident structure, so nothing is lost between systems.",
  },
  {
    Icon: Brain,
    title: "AI incident understanding",
    body: "Free-form reports like \u201cflooding near Katpadi, 30 stranded, elderly residents need help\u201d become structured, validated data automatically.",
  },
  {
    Icon: ScaleIcon,
    title: "Explainable prioritisation",
    body: "A deterministic scoring engine \u2014 not a black box \u2014 ranks incidents by severity, people affected, vulnerability, urgency, and resource gap.",
  },
  {
    Icon: Users,
    title: "AI volunteer matching",
    body: "Every incident gets ranked, explained volunteer recommendations based on skills, distance, availability, and experience.",
  },
  {
    Icon: Map,
    title: "Live operational map",
    body: "Incidents, volunteers, and resources plotted together, updating automatically as the situation develops.",
  },
  {
    Icon: Activity,
    title: "Coordinator workflow",
    body: "Assign, dispatch, and resolve incidents with status tracking from first report to resolution.",
  },
];

export default function Landing() {
  return (
    <div className="h-full overflow-y-auto bg-[var(--color-base)]">
      {/* Nav */}
      <div className="flex items-center justify-between px-6 md:px-12 h-16 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <ShieldHalf size={20} className="text-[var(--color-system)]" />
          <span className="font-semibold tracking-tight">RESQ-AI</span>
        </div>
        <Link
          to="/dashboard"
          className="text-sm px-3.5 py-1.5 rounded border border-[var(--color-border)] hover:border-[var(--color-system)] hover:text-[var(--color-system)] transition-colors"
        >
          Enter Command Center
        </Link>
      </div>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 pb-14 max-w-4xl">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-dim)] mb-5">
          <Radio size={11} className="text-green-400 pulse-dot" />
          SYSTEM OPERATIONAL &middot; Real-Time Emergency Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight text-[var(--color-text)] max-w-3xl">
          Transform fragmented emergency reports into real-time, explainable response decisions.
        </h1>
        <p className="text-base text-[var(--color-muted)] mt-5 max-w-xl leading-relaxed">
          RESQ-AI unifies citizen reports, agency feeds, and sensor data, understands them with AI,
          and shows coordinators where help is needed, why it's urgent, and who can respond.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 rounded bg-[var(--color-system)] text-white text-sm font-medium hover:opacity-90"
          >
            Enter Command Center <ArrowRight size={15} />
          </Link>
          <Link
            to="/report"
            className="flex items-center gap-2 px-4 py-2.5 rounded border border-[var(--color-border)] text-sm font-medium hover:border-[var(--color-dim)]"
          >
            Report Emergency
          </Link>
        </div>
      </section>

      {/* Workflow */}
      <section className="px-6 md:px-12 py-8 border-y border-[var(--color-border)] bg-[var(--color-panel)]">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-3 max-w-4xl">
          {WORKFLOW.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span className="font-mono text-sm px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-panel-raised)]">
                {step}
              </span>
              {i < WORKFLOW.length - 1 && <ArrowRight size={14} className="text-[var(--color-dim)]" />}
            </span>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="px-6 md:px-12 py-14 max-w-5xl">
        <h2 className="text-xl font-semibold mb-1">How it works</h2>
        <p className="text-sm text-[var(--color-muted)] mb-8 max-w-xl">
          Six components carry a report from a panicked message to a coordinated response.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
          {CAPABILITIES.map(({ Icon, title, body }) => (
            <div key={title} className="border-t border-[var(--color-border)] pt-3">
              <Icon size={16} className="text-[var(--color-system)] mb-2" />
              <h3 className="text-sm font-semibold mb-1.5">{title}</h3>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact / example */}
      <section className="px-6 md:px-12 py-14 border-t border-[var(--color-border)] bg-[var(--color-panel)]">
        <div className="max-w-4xl">
          <h2 className="text-xl font-semibold mb-6">From a message to a match, in seconds</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ExampleStep
              Icon={Waves}
              label="Reported"
              text="\u201cSevere flooding near Katpadi. ~30 people stranded, elderly residents need help.\u201d"
            />
            <ExampleStep
              Icon={Flame}
              label="Understood & prioritised"
              text="Flood \u00b7 Critical severity \u00b7 30 affected \u00b7 Elderly vulnerable group \u00b7 Immediate urgency"
            />
            <ExampleStep
              Icon={HeartPulse}
              label="Matched"
              text="Anita \u2014 96% match (Water Rescue + Medical, 2.1 km, available)"
            />
          </div>
        </div>
      </section>

      <footer className="px-6 md:px-12 py-8 text-[11px] text-[var(--color-dim)] flex items-center justify-between">
        <span>RESQ-AI \u2014 hackathon prototype for emergency coordination</span>
        <span className="font-mono">v1.0.0</span>
      </footer>
    </div>
  );
}

function ExampleStep({ Icon, label, text }) {
  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-panel-raised)] p-4">
      <Icon size={15} className="text-[var(--color-system)] mb-2" />
      <div className="text-[10px] uppercase tracking-wide text-[var(--color-dim)] mb-1.5">{label}</div>
      <p className="text-xs text-[var(--color-text)] leading-relaxed">{text}</p>
    </div>
  );
}
