import { useCallback, useEffect, useState } from "react";
import { ApiError } from "./client";

type State<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = [], pollMs?: number) {
  const [state, setState] = useState<State<T>>({ status: "loading" });

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setState({ status: "loading" });
      try {
        const data = await fetcher();
        setState({ status: "success", data });
      } catch (err) {
        setState({ status: "error", message: err instanceof ApiError ? err.message : "Unexpected error" });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  useEffect(() => {
    load();
    if (!pollMs) return;
    const interval = setInterval(() => load(true), pollMs);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, pollMs]);

  return { state, reload: () => load() };
}
