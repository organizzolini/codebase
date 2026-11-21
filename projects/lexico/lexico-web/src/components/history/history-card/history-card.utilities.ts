import { isLookupEntry } from "../../../hooks/use-lookup-history/use-lookup-history.utilities";

import type { HistoryEntry } from "../../../hooks/use-lookup-history/use-lookup-history.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The sentence in a card's body: a lookup's translation and source text, a
 * search's term, or the text opened.
 */
export function cardSummary(entry: HistoryEntry): string {
  if (isLookupEntry(entry)) {
    const source = `From ${entry.title ?? entry.slug}`;

    return entry.definition === null
      ? source
      : `${entry.definition}. ${source}`;
  }

  return entry.kind === "text"
    ? `Opened ${entry.title} by ${entry.authorName}`
    : `Searched for ${entry.query}`;
}

/**
 * The time an entry was recorded, as the reader's locale writes it.
 */
export function formatRecordedAt(recordedAt: number): string {
  return new Date(recordedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
