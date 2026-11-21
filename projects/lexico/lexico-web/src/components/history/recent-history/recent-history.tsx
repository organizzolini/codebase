import { Button } from "@codebase/presentation";

import { HistoryList } from "../history-list/history-list";

import type { HistoryEntry } from "../../../hooks/use-lookup-history/use-lookup-history.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties RecentHistory accepts.
 */
export interface RecentHistoryProperties {
  className?: string;
  entries: HistoryEntry[];
  onClear: () => void;
  onOpenEntry: (entry: HistoryEntry) => void;
}

// 🧩 Component

/**
 * The combined history of lookups and searches, shown on the search page as
 * Recent. Shows nothing until there is some history to show.
 */
export function RecentHistory(
  properties: Readonly<RecentHistoryProperties>,
): ReactNode {
  const { className, entries, onClear, onOpenEntry } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (entries.length === 0) {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="recent-history"
    >
      <h2 className="text-lg font-semibold">Recent</h2>
      <HistoryList
        emptyMessage=""
        entries={entries}
        onOpenEntry={onOpenEntry}
      />
      <Button
        onClick={() => {
          onClear();
        }}
        variant="outline"
      >
        Clear history
      </Button>
    </div>
  );
}
