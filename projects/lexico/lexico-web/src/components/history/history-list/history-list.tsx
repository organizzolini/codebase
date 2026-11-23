import { isLookupEntry } from "../../../hooks/use-lookup-history/use-lookup-history.utilities";
import { HistoryLexeme } from "../history-lexeme/history-lexeme";

import {
  entryDetail,
  entryKey,
  entryOrigin,
  entryTitle,
} from "./history-list.utilities";

import type { HistoryEntry } from "../../../hooks/use-lookup-history/use-lookup-history.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties HistoryList accepts.
 */
export interface HistoryListProperties {
  className?: string;
  emptyMessage: string;
  entries: HistoryEntry[];
  onFocusEntry?: ((entry: HistoryEntry | null) => void) | undefined;
  onOpenEntry: (entry: HistoryEntry) => void;
  /** Shows the dictionary card of each looked-up word beneath its entry. */
  showLexemes?: boolean;
}

// 🧩 Component

/**
 * Lists history entries, newest first, each labelled with where it came from.
 * Clicking an entry opens it; hovering a word lookup reports it. Each lookup
 * can carry its full lexeme card.
 */
export function HistoryList(
  properties: Readonly<HistoryListProperties>,
): ReactNode {
  const {
    className,
    emptyMessage,
    entries,
    onFocusEntry,
    onOpenEntry,
    showLexemes = false,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="history-list"
    >
      {entries.length === 0 ? (
        <p className="text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className={showLexemes ? "space-y-4" : "space-y-1"}>
          {entries.map((entry) => (
            <li
              key={entryKey(entry)}
              data-testid="history-entry"
            >
              <button
                className="w-full rounded-md p-2 text-left hover:bg-accent"
                onBlur={() => {
                  onFocusEntry?.(null);
                }}
                onClick={() => {
                  onOpenEntry(entry);
                }}
                onFocus={() => {
                  onFocusEntry?.(entry);
                }}
                onMouseEnter={() => {
                  onFocusEntry?.(entry);
                }}
                onMouseLeave={() => {
                  onFocusEntry?.(null);
                }}
                type="button"
              >
                <span className="font-medium">{entryTitle(entry)}</span>{" "}
                <span className="text-muted-foreground">
                  {entryDetail(entry)}
                </span>
                {isLookupEntry(entry) &&
                entry.definition !== null &&
                !showLexemes ? (
                  <span className="block">{entry.definition}</span>
                ) : null}
                <span className="block text-xs text-muted-foreground">
                  {entryOrigin(entry)}
                </span>
              </button>
              {showLexemes && isLookupEntry(entry) ? (
                <HistoryLexeme
                  className="mt-1"
                  entry={entry}
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
