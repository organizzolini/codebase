import {
  LOOKUP_HISTORY_CAP,
  LOOKUP_HISTORY_KEY,
  lookupHistorySchema,
} from "./use-lookup-history.constants";

import type {
  HistoryEntry,
  LookupDraft,
  LookupEntry,
  SearchDraft,
} from "./use-lookup-history.types";

// 🔏 Private Functions

/**
 * Whether a history entry is a word lookup, narrowing its type.
 */
export function isLookupEntry(entry: HistoryEntry): entry is LookupEntry {
  return entry.kind === "lookup";
}

/**
 * The stored history, or none when storage is unavailable, empty, or invalid.
 */
export function readLookupHistory(): HistoryEntry[] {
  try {
    const raw = globalThis.localStorage.getItem(LOOKUP_HISTORY_KEY);

    if (raw === null) {
      return [];
    }

    const parsed = lookupHistorySchema.safeParse(JSON.parse(raw));

    return parsed.success ? parsed.data : [];
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
  entries: readonly HistoryEntry[],
  draft: LookupDraft,
  now: number,
): HistoryEntry[] {
  const entry: HistoryEntry = { ...draft, kind: "lookup", recordedAt: now };

  return capped([entry, ...entries.filter((kept) => !isSameWord(kept, draft))]);
}

/**
 * Puts a search at the top, replacing an earlier identical search, and drops
 * the oldest entries beyond the cap. A blank query records nothing.
 */
export function recordSearch(
  entries: readonly HistoryEntry[],
  draft: SearchDraft,
  now: number,
): HistoryEntry[] {
  if (draft.query.trim() === "") {
    return [...entries];
  }

  const entry: HistoryEntry = { ...draft, kind: "search", recordedAt: now };

  return capped([
    entry,
    ...entries.filter((kept) => !isSameSearch(kept, draft)),
  ]);
}

/**
 * Remembers the history in this browser, if storage allows.
 */
export function writeLookupHistory(entries: readonly HistoryEntry[]): void {
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
 * Keeps the newest entries up to the shared cap.
 */
function capped(entries: HistoryEntry[]): HistoryEntry[] {
  return entries.slice(0, LOOKUP_HISTORY_CAP);
}

/**
 * Whether an entry is a search for the same query, ignoring case.
 */
function isSameSearch(entry: HistoryEntry, draft: SearchDraft): boolean {
  return (
    entry.kind === "search" &&
    entry.query.toLowerCase() === draft.query.toLowerCase()
  );
}

/**
 * Whether an entry is a lookup of the same word in the same text.
 */
function isSameWord(entry: HistoryEntry, draft: LookupDraft): boolean {
  return (
    entry.kind === "lookup" &&
    entry.slug === draft.slug &&
    entry.word.toLowerCase() === draft.word.toLowerCase()
  );
}
