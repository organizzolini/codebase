import { useEffect, useRef as useReference, useState } from "react";

import {
  canGoTo,
  planRead,
  readPage,
  resolvePaging,
} from "./use-meanders.utilities";

import type { MeandersPage } from "../../components/gallery/meander-gallery/meanders-api.types";
import type {
  PagingQuery,
  PagingState,
  UseMeandersResult,
} from "./use-meanders.types";

// 🧩 Hook

/**
 * Pages through meanders, each page read once and kept; a new first page starts over.
 */
export function useMeanders(
  first: MeandersPage | undefined,
  query: Readonly<PagingQuery>,
): UseMeandersResult {
  // 🪝 Hooks
  const [state, setState] = useState<PagingState>({
    first,
    pages: {},
    position: 0,
  });
  // The first page now showing: a read belongs to the first page it began
  // under, whatever shows when it ends.
  const showing = useReference(first);

  // 🏗 Setup
  const { isLoading, page, pageCount, pages, position } = resolvePaging(
    first,
    state,
    query.size,
  );

  // 💪 Handlers
  const goTo = (target: number): void => {
    if (first === undefined || !canGoTo({ isLoading, pageCount, target })) {
      return;
    }

    setState({ first, pages, position: target });

    if (target === 0 || pages[target] !== undefined) {
      return;
    }

    readPage({
      ...planRead({
        first,
        pages,
        size: query.size,
        sorts: query.sort?.length ?? 0,
        target,
      }),
      fallback: position,
      first,
      position: target,
      query,
      setState,
      showing,
    });
  };

  // ♻️ Lifecycle
  useEffect(() => {
    showing.current = first;
  }, [first]);

  // 🎁 Result
  return {
    goTo,
    isLoading,
    loadError: state.first === first ? state.failure?.error : undefined,
    meanders: page?.edges.map(({ node }) => node) ?? [],
    next: () => {
      goTo(position + 1);
    },
    pageCount,
    position,
    previous: () => {
      goTo(position - 1);
    },
  };
}
