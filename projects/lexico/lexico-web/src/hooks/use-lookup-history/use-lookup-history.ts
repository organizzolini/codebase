import { useCallback, useEffect, useState } from "react";

import {
  readLookupHistory,
  recordLookup,
  recordSearch,
  writeLookupHistory,
} from "./use-lookup-history.utilities";

import type {
  HistoryEntry,
  LookupDraft,
  UseLookupHistoryResult,
} from "./use-lookup-history.types";

// 🧩 Hook

/**
 * The history this browser keeps, newest first, with functions to record a
 * word lookup or a search and to clear the history.
 */
export function useLookupHistory(): UseLookupHistoryResult {
  // 🪝 Hooks
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  // 🏗 Setup

  // 💪 Handlers
  const record = useCallback((draft: LookupDraft): void => {
    setEntries((current) => {
      const next = recordLookup(current, draft, Date.now());

      writeLookupHistory(next);
      return next;
    });
  }, []);

  const recordSearchQuery = useCallback((query: string): void => {
    setEntries((current) => {
      const next = recordSearch(current, { query }, Date.now());

      writeLookupHistory(next);
      return next;
    });
  }, []);

  const clear = useCallback((): void => {
    setEntries([]);
    writeLookupHistory([]);
  }, []);

  // ♻️ Lifecycle
  useEffect(() => {
    setEntries(readLookupHistory());
  }, []);

  // 🎁 Result
  return { clear, entries, record, recordSearch: recordSearchQuery };
}
