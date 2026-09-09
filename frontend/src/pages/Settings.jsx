import TopBar from "../components/TopBar";
import { LoadingState } from "../components/LoadingState";
import { usePolling } from "../hooks/usePolling";
import { getDashboardStats } from "../api/client";

const PIPELINE = ["Collect", "Understand", "Prioritise", "Match", "Coordinate", "Respond"];

export default function Settings() {
  const { data, loading } = usePolling(getDashboardStats, 10000);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="System Information" />
      <div className="flex-1 overflow-y-auto p-5 max-w-2xl space-y-5">
        <section className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">
            Core workflow
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            {PIPELINE.map((p, i) => (
              <span key={p} className="flex items-center gap-1.5">
                <span className="px-2 py-1 rounded bg-[var(--color-border-soft)]">{p}</span>
                {i < PIPELINE.length - 1 && <span className="text-[var(--color-dim)]">→</span>}
              </span>
            ))}
          </div>
        </section>

        {loading && !data ? (
          <LoadingState />
        ) : (
          <section className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] p-4 text-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">
              Runtime status
            </h2>
            <dl className="space-y-2">
              <Row label="AI mode" value={data?.ai_mode === "REAL" ? "Real AI analysis (Anthropic)" : "AI simulation mode (deterministic mock)"} />
              <Row label="Data store" value={data?.storage_mode} />
              <Row label="Total incidents on record" value={data?.total_incidents} />
              <Row label="Total volunteers on record" value={data?.total_volunteers} />
              <Row label="Server time" value={data ? new Date(data.server_time).toLocaleString("en-IN") : "—"} />
            </dl>
          </section>
        )}

        <section className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] p-4 text-sm text-[var(--color-muted)] leading-relaxed">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-2">
            About RESQ-AI
          </h2>
          <p>
            RESQ-AI aggregates fragmented emergency reports from citizens, agencies, and simulated
            sensor feeds, understands them with AI, prioritises them with an explainable deterministic
            scoring engine, matches suitable volunteers, and gives coordinators a live operational
            dashboard. The priority score is always computed by a fixed, auditable formula — AI never
            sets it directly, only explains it in plain language afterward.
          </p>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-[var(--color-border-soft)] pb-2">
      <dt className="text-[var(--color-muted)]">{label}</dt>
      <dd className="font-mono text-[var(--color-text)]">{value}</dd>
    </div>
  );
}
