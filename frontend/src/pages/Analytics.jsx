import TopBar from "../components/TopBar";
import { ChartCard, AnalyticsBar, AnalyticsPie, AnalyticsLine } from "../components/AnalyticsChart";
import { LoadingState, ErrorState } from "../components/LoadingState";
import { usePolling } from "../hooks/usePolling";
import { getAnalytics } from "../api/client";

export default function Analytics() {
  const { data, loading, error, refresh } = usePolling(getAnalytics, 8000);

  if (loading && !data) return <><TopBar title="Analytics" /><LoadingState /></>;
  if (error) return <><TopBar title="Analytics" /><ErrorState onRetry={refresh} /></>;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Analytics" />
      <div className="flex-1 overflow-y-auto p-5">
        <div className="mb-4 rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 flex items-center gap-6">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[var(--color-dim)]">Avg. Response Time</div>
            <div className="font-mono text-2xl font-semibold">{data.avg_response_time_minutes} min</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <ChartCard title="Incident Type Distribution">
            <AnalyticsBar data={data.incidents_by_type} />
          </ChartCard>
          <ChartCard title="Severity Distribution">
            <AnalyticsPie data={data.incidents_by_severity} />
          </ChartCard>
          <ChartCard title="Source Distribution">
            <AnalyticsPie data={data.incidents_by_source} />
          </ChartCard>
          <ChartCard title="Incident Timeline">
            <AnalyticsLine data={data.timeline} xKey="date" yKey="count" />
          </ChartCard>
          <ChartCard title="Volunteer Status">
            <AnalyticsBar data={data.volunteer_status} />
          </ChartCard>
          <ChartCard title="Resolved vs Active">
            <AnalyticsPie data={data.resolved_vs_active} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
