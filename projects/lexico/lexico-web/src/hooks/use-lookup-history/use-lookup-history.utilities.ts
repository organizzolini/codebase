import {
  LOOKUP_HISTORY_CAP,
  LOOKUP_HISTORY_KEY,
  lookupEntrySchema,
  storedListSchema,
} from "./use-lookup-history.constants";

import type { LookupDraft, LookupEntry } from "./use-lookup-history.types";

// 🔏 Private Functions

/**
 * The stored history, or none when storage is unavailable, empty, or invalid.
 */
export function readLookupHistory(): LookupEntry[] {
  try {
    const raw = globalThis.localStorage.getItem(LOOKUP_HISTORY_KEY);

    if (raw === null) {
      return [];
    }

    const stored = storedListSchema.safeParse(JSON.parse(raw));

    return stored.success
      ? stored.data.flatMap((item) => {
          const parsed = lookupEntrySchema.safeParse(item);

          return parsed.success ? [parsed.data] : [];
        })
      : [];
  } catch {
    return [];
  }
}

// 🌎 Public Functions

/**
 * Puts a lookup at the top, replacing an earlier lookup of the same word in
 * the same text, and drops the oldest entries beyond the cap.
 */
export function recordLookup(
  entries: readonly LookupEntry[],
  draft: LookupDraft,
  now: number,
): LookupEntry[] {
  const entry: LookupEntry = { ...draft, recordedAt: now };

  return [entry, ...entries.filter((kept) => !isSameWord(kept, draft))].slice(
    0,
    LOOKUP_HISTORY_CAP,
  );
}

/**
 * Remembers the history in this browser, if storage allows.
 */
export function writeLookupHistory(entries: readonly LookupEntry[]): void {
  try {
    globalThis.localStorage.setItem(
      LOOKUP_HISTORY_KEY,
      JSON.stringify(entries),
    );
  } catch {
    // Storage is unavailable or full: the history lasts while the reader is open.
  }
}

/**
 * Whether an entry is a lookup of the same word in the same text.
 */
function isSameWord(entry: LookupEntry, draft: LookupDraft): boolean {
  return (
    entry.slug === draft.slug &&
    entry.word.toLowerCase() === draft.word.toLowerCase()
  );
}
