import {
  useCallback,
  useEffect,
  useRef as useReference,
  useState,
} from "react";

import {
  readLookupHistory,
  recordLookup,
  recordSearch,
  recordText,
  writeLookupHistory,
} from "./use-lookup-history.utilities";

import type {
  HistoryEntry,
  LookupDraft,
  TextDraft,
  UseLookupHistoryResult,
} from "./use-lookup-history.types";

// 🧩 Hook

/**
 * The history this browser keeps, newest first, with functions to record a
 * word lookup, a search, or a text opening and to clear the history.
 */
export function useLookupHistory(): UseLookupHistoryResult {
  // 🪝 Hooks
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const latest = useReference<HistoryEntry[]>([]);

  // 🏗 Setup

  // 💪 Handlers
  const replace = useCallback((next: HistoryEntry[]): void => {
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

  const recordSearchQuery = useCallback(
    (query: string): void => {
      replace(recordSearch(latest.current, { query }, Date.now()));
    },
    [replace],
  );

  const recordTextOpening = useCallback(
    (draft: TextDraft): void => {
      replace(recordText(latest.current, draft, Date.now()));
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
  return {
    clear,
    entries,
    record,
    recordSearch: recordSearchQuery,
    recordText: recordTextOpening,
  };
}
