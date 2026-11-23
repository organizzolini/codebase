import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";

import { Button } from "@codebase/presentation";

import { HistoryCard } from "../components/history/history-card/history-card";
import { entryKey } from "../components/history/history-list/history-list.utilities";
import { useLookupHistory } from "../hooks/use-lookup-history/use-lookup-history";
import {
  isLookupEntry,
  isTextEntry,
} from "../hooks/use-lookup-history/use-lookup-history.utilities";

import type { HistoryEntry } from "../hooks/use-lookup-history/use-lookup-history.types";
import type { ReactNode } from "react";

// 🧭 Route

/** Lists the words looked up and the searches made, newest first. */
export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({
    meta: [
      { title: "Lexico - History" },
      {
        content:
          "The Latin words you looked up and the searches you made, newest first",
        name: "description",
      },
    ],
  }),
});

// 🧩 Component

/**
 * The history page: every lookup and search, with a way to clear them.
 */
function HistoryPage(): ReactNode {
  // 🪝 Hooks
  const navigate = Route.useNavigate();
  const { clear, entries } = useLookupHistory();

  // 🏗 Setup

  // 💪 Handlers
  const handleOpenEntry = useCallback(
    (entry: HistoryEntry): void => {
      if (isTextEntry(entry)) {
        void navigate({ params: { slug: entry.slug }, to: "/texts/$slug" });
      } else if (isLookupEntry(entry)) {
        void navigate({
          params: { slug: entry.slug },
          search: { line: entry.line },
          to: "/texts/$slug",
        });
      } else {
        void navigate({ search: { query: entry.query }, to: "/search" });
      }
    },
    [navigate],
  );

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <section className="mx-auto grid w-full max-w-2xl grid-cols-[1fr_auto] items-center gap-4">
      <h1 className="text-2xl font-semibold">History</h1>
      {entries.length === 0 ? null : (
        <Button
          onClick={() => {
            clear();
          }}
          variant="outline"
        >
          Clear history
        </Button>
      )}
      {entries.length === 0 ? (
        <p
          className="col-span-full text-muted-foreground"
          data-testid="history-empty"
        >
          No words looked up, searches, or texts opened yet.
        </p>
      ) : (
        <ul className="col-span-full space-y-3">
          {entries.map((entry) => (
            <li key={entryKey(entry)}>
              <HistoryCard
                entry={entry}
                onOpen={handleOpenEntry}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
