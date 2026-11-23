import { useEffect, useRef as useReference, useState } from "react";

import {
  fitsWindow,
  listMissing,
  readPage,
  resolvePaging,
} from "./use-meanders.utilities";

import type { MeandersPage } from "../../components/gallery/meander-gallery/meanders-api.types";
import type {
  PageWindow,
  PagingQuery,
  PagingState,
  UseMeandersResult,
} from "./use-meanders.types";

// 🧩 Hook

/**
 * Pages through meanders as a window of consecutive pages, each read once
 * and kept; a new first page starts over.
 */
export function useMeanders(
  first: MeandersPage,
  query: Readonly<PagingQuery>,
): UseMeandersResult {
  // 🪝 Hooks
  const [state, setState] = useState<PagingState>({
    first,
    pages: {},
    range: { first: 1, last: 1 },
  });
  // The first page now showing: a read belongs to the first page it began
  // under, whatever shows when it ends.
  const showing = useReference(first);
  // The pages being read, so a page asked for twice is read once.
  const inFlight = useReference(new Set<number>());

  // 🏗 Setup
  const { isLoading, meanders, pageCount, pages, range } = resolvePaging(
    first,
    state,
    query.size,
  );
  const failure = state.first === first ? state.failure : undefined;

  // 💪 Handlers
  // Shows the pages of a window, reading those not read yet.
  const show = (target: PageWindow, shouldScroll: boolean): void => {
    if (!fitsWindow(target, pageCount)) {
      return;
    }

    setState({ first, pages, range: target });

    if (shouldScroll) {
      globalThis.scrollTo({ top: 0 });
    }

    for (const page of listMissing(target, pages)) {
      if (!inFlight.current.has(page)) {
        inFlight.current.add(page);
        void readPage({
          fallback: range,
          first,
          page,
          query,
          setState,
          showing,
          target,
        }).finally(() => {
          inFlight.current.delete(page);
        });
      }
    }
  };
  const select = (page: number): void => {
    show({ first: page, last: page }, true);
  };

  // ♻️ Lifecycle
  useEffect(() => {
    showing.current = first;
    inFlight.current.clear();
  }, [first]);

  // 🎁 Result
  return {
    append: () => {
      show({ first: range.first, last: range.last + 1 }, false);
    },
    hasMore: !isLoading && failure === undefined && range.last < pageCount,
    isLoading,
    loadError: failure?.error,
    meanders,
    next: () => {
      select(range.last + 1);
    },
    pageCount,
    previous: () => {
      select(range.first - 1);
    },
    range,
    retry: () => {
      if (failure !== undefined) {
        show(failure.range, false);
      }
    },
    select,
  };
}
