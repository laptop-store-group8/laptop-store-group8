import { useCallback, useEffect, useState } from 'react';
import { isCancel } from '../api/axiosClient';

/**
 * Fetch data with cancellation, loading/error state, and a manual refetch.
 *
 * Keep `fetcher` stable with `useCallback`; pass values that should trigger a
 * new request in `deps`. The fetcher receives the request's AbortSignal.
 *
 * @template T
 * @param {(signal: AbortSignal) => Promise<T>} fetcher
 * @param {unknown[]} deps
 * @returns {{ data: T | null, loading: boolean, error: unknown, refetch: () => void, setData: import('react').Dispatch<import('react').SetStateAction<T | null>> }}
 *
 * @example
 * const fetchLaptops = useCallback(
 *   (signal) => laptopApi.getAll({ _page: page }, signal),
 *   [page],
 * );
 * const { data, loading, error, refetch, setData } = useAxios(fetchLaptops, [page]);
 */
export default function useAxios(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestVersion, setRequestVersion] = useState(0);

  const refetch = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      await Promise.resolve();
      if (controller.signal.aborted) {
        return;
      }

      setLoading(true);
      setError(null);

      let wasCancelled = false;
      try {
        const result = await fetcher(controller.signal);
        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (requestError) {
        const isCancelledRequest =
          isCancel(requestError) ||
          requestError?.name === 'AbortError' ||
          requestError?.code === 'ERR_CANCELED';

        if (isCancelledRequest) {
          wasCancelled = true;
        } else if (!controller.signal.aborted) {
          setError(requestError);
        }
      } finally {
        if (!wasCancelled && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();
    // `deps` is intentionally spread to match useAxios(fetcher, deps).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, requestVersion, ...deps]);

  return { data, loading, error, refetch, setData };
}
