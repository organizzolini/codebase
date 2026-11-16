import {
  useCallback,
  useEffect,
  useRef as useReference,
  useState,
} from "react";

import {
  readLookupHistory,
  recordLookup,
  writeLookupHistory,
} from "./use-lookup-history.utilities";

import type {
  LookupDraft,
  LookupEntry,
  UseLookupHistoryResult,
} from "./use-lookup-history.types";

// 🧩 Hook

/**
 * The lookup history this browser keeps, newest first, with functions to
 * record a lookup and to clear the history.
 */
export function useLookupHistory(): UseLookupHistoryResult {
  // 🪝 Hooks
  const [entries, setEntries] = useState<LookupEntry[]>([]);
  const latest = useReference<LookupEntry[]>([]);

  // 🏗 Setup

  // 💪 Handlers
  const replace = useCallback((next: LookupEntry[]): void => {
    latest.current = next;
    setEntries(next);
    writeLookupHistory(next);
  }, []);

  const record = useCallback(
    (draft: LookupDraft): void => {
      replace(recordLookup(latest.current, draft, Date.now()));
    },
    [replace],
  );

  const clear = useCallback((): void => {
    replace([]);
  }, [replace]);

  // ♻️ Lifecycle
  useEffect(() => {
    latest.current = readLookupHistory();
    setEntries(latest.current);
  }, []);

  // 🎁 Result
  return { clear, entries, record };
}
