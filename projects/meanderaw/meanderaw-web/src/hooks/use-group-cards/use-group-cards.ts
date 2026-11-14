import {
  useCallback,
  useEffect,
  useRef as useReference,
  useState,
} from "react";

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
export function useGroupCards(sort?: MeanderSortInput): UseGroupCardsResult {
  // 🪝 Hooks
  const [cards, setCards] = useState<Readonly<Record<string, GroupCards>>>({});
  const latest = useReference(cards);
  const inFlight = useReference(new Set<string>());

  // 🏗 Setup

  // 💪 Handlers
  const load = useCallback(
    (leaf: GroupLeaf): void => {
      const current = latest.current[leaf.id];

      if (inFlight.current.has(leaf.id) || current?.hasMore === false) {
        return;
      }

      inFlight.current.add(leaf.id);
      findMeanders({ after: current?.endCursor, filter: leaf.filter, sort })
        .then((page) => {
          setCards((previous) => appendPage(previous, leaf.id, page));
        })
        .catch((error: unknown) => {
          setCards((previous) => recordFailure(previous, leaf.id, error));
        })
        .finally(() => {
          inFlight.current.delete(leaf.id);
        });
    },
    [sort],
  );

  // ♻️ Lifecycle
  useEffect(() => {
    latest.current = cards;
  }, [cards]);

  // 🎁 Result
  return { cards, load };
}
