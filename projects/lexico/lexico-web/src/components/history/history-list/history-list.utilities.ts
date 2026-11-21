import {
  isLookupEntry,
  isTextEntry,
} from "../../../hooks/use-lookup-history/use-lookup-history.utilities";

import type { HistoryEntry } from "../../../hooks/use-lookup-history/use-lookup-history.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The grey detail beside the title: the form of a lookup, nothing otherwise.
 */
export function entryDetail(entry: HistoryEntry): string {
  return isLookupEntry(entry) ? entry.form : "";
}

/**
 * A key that is unique among history entries.
 */
export function entryKey(entry: HistoryEntry): string {
  if (isLookupEntry(entry)) {
    return `lookup-${entry.slug}-${entry.line}-${entry.token}`;
  }

  return isTextEntry(entry)
    ? `text-${entry.slug}-${String(entry.recordedAt)}`
    : `search-${entry.query.toLowerCase()}`;
}

/**
 * Where an entry came from, shown beneath it.
 */
export function entryOrigin(entry: HistoryEntry): string {
  if (isLookupEntry(entry)) {
    return entry.title ?? entry.slug;
  }

  return isTextEntry(entry) ? `Opened text by ${entry.authorName}` : "Search";
}

/**
 * The bold line an entry shows: the word looked up, the search query, or the
 * title of the text opened.
 */
export function entryTitle(entry: HistoryEntry): string {
  if (isLookupEntry(entry)) {
    return entry.word;
  }

  return isTextEntry(entry) ? entry.title : entry.query;
}
