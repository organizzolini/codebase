import { isLookupEntry } from "../../hooks/use-lookup-history/use-lookup-history.utilities";

import type { HistoryEntry } from "../../hooks/use-lookup-history/use-lookup-history.types";

// 🔏 Private Functions

/**
 * The grey detail beside the title: the form of a lookup, nothing for a search.
 */
export function entryDetail(entry: HistoryEntry): string {
  return isLookupEntry(entry) ? entry.form : "";
}

// 🌎 Public Functions

/**
 * A key that is unique among history entries.
 */
export function entryKey(entry: HistoryEntry): string {
  return isLookupEntry(entry)
    ? `lookup-${entry.slug}-${entry.line}-${entry.token}`
    : `search-${entry.query.toLowerCase()}`;
}

/**
 * Where an entry came from, shown beneath it.
 */
export function entryOrigin(entry: HistoryEntry): string {
  return lookupOrigin(entry);
}

/**
 * The bold line an entry shows: the word looked up, or the search query.
 */
export function entryTitle(entry: HistoryEntry): string {
  return isLookupEntry(entry) ? entry.word : entry.query;
}

/**
 * Where a lookup came from: its text's title, or its slug if the title is unknown.
 */
function lookupOrigin(entry: HistoryEntry): string {
  return isLookupEntry(entry) ? (entry.title ?? entry.slug) : "Search";
}
