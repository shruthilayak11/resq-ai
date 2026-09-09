import TopBar from "../components/TopBar";
import ResourceCard from "../components/ResourceCard";
import { LoadingState, ErrorState } from "../components/LoadingState";
import { usePolling } from "../hooks/usePolling";
import { getResources } from "../api/client";

export default function Resources() {
  const { data, loading, error, refresh } = usePolling(getResources, 15000);

  if (loading && !data) return <><TopBar title="Resources" /><LoadingState /></>;
  if (error) return <><TopBar title="Resources" /><ErrorState onRetry={refresh} /></>;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Resource Management" />
      <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {(data || []).map((r) => (
          <ResourceCard key={r.id} resource={r} />
        ))}
      </div>
    </div>
  );
}
