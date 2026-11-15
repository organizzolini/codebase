import { useCallback, useEffect, useState } from "react";

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

  // 🏗 Setup

  // 💪 Handlers
  const record = useCallback((draft: LookupDraft): void => {
    setEntries((current) => {
      const next = recordLookup(current, draft, Date.now());

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
  return { clear, entries, record };
}
