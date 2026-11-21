import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";

import { RecentHistory } from "../components/history/recent-history/recent-history";
import { useLookupHistory } from "../hooks/use-lookup-history/use-lookup-history";
import { isLookupEntry } from "../hooks/use-lookup-history/use-lookup-history.utilities";

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
      if (isLookupEntry(entry)) {
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
    <section className="mx-auto w-full max-w-2xl space-y-4">
      <h1 className="sr-only">History</h1>
      {entries.length === 0 ? (
        <p
          className="text-center text-muted-foreground"
          data-testid="history-empty"
        >
          No words looked up or searches yet.
        </p>
      ) : (
        <RecentHistory
          entries={entries}
          onClear={clear}
          onOpenEntry={handleOpenEntry}
        />
      )}
    </section>
  );
}
