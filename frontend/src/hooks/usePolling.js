import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Polls `fetchFn` every `intervalMs` and returns { data, loading, error, refresh }.
 * Used for the "LIVE" dashboard behaviour: incident queue, counters, map,
 * volunteer/assignment status all refresh automatically without WebSockets.
 */
export function usePolling(fetchFn, intervalMs = 4000, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timer = useRef(null);
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  const refresh = useCallback(async () => {
    try {
      const result = await fetchRef.current();
      setData(result);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    timer.current = setInterval(refresh, intervalMs);
    return () => clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);

  return { data, loading, error, refresh };
}
