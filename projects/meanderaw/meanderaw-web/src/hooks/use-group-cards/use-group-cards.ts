import { useCallback, useRef as useReference, useState } from "react";

import { findMeanders } from "../../components/meander-gallery/meanders-api.utilities";

import { appendPage, recordFailure } from "./use-group-cards.utilities";

import type {
  GroupCards,
  GroupLeaf,
} from "../../components/grouped-gallery/grouped-gallery.types";
import type { MeanderSortInput } from "../../graphql/generated/operations";
import type { UseGroupCardsResult } from "./use-group-cards.types";

// 🧩 Hook

/**
 * Reads each last-level group's cards on request, page by page by cursor, in
 * the sort given. Remount it to start over.
 */
export function useGroupCards(
  query: Readonly<{ repeats: number; sort: MeanderSortInput | undefined }>,
): UseGroupCardsResult {
  // 🪝 Hooks
  const [cards, setCards] = useState<Readonly<Record<string, GroupCards>>>({});
  // What was read is kept here too, so a read starting before React commits
  // the last one still sees its cursor.
  const store = useReference<Readonly<Record<string, GroupCards>>>({});
  const inFlight = useReference(new Set<string>());

  // 🏗 Setup

  // 💪 Handlers
  const commit = (next: Readonly<Record<string, GroupCards>>): void => {
    store.current = next;
    setCards(next);
  };
  const load = useCallback(
    (leaf: GroupLeaf): void => {
      const current = store.current[leaf.id];

      if (inFlight.current.has(leaf.id) || current?.hasMore === false) {
        return;
      }

      inFlight.current.add(leaf.id);
      findMeanders({
        after: current?.endCursor,
        filter: leaf.filter,
        repeats: query.repeats,
        sort: query.sort,
      })
        .then((page) => {
          commit(appendPage(store.current, leaf.id, page));
        })
        .catch((error: unknown) => {
          commit(recordFailure(store.current, leaf.id, error));
        })
        .finally(() => {
          inFlight.current.delete(leaf.id);
        });
    },
    [query.repeats, query.sort],
  );

  // ♻️ Lifecycle

  // 🎁 Result
  return { cards, load };
}
