import { useCallback, useRef as useReference, useState } from "react";

import { findMeanders } from "../../components/meander-gallery/meanders-api.utilities";

import type { MeandersPage } from "../../components/meander-gallery/meanders-api.types";
import type {
  MeanderFilterGroupInput,
  MeanderSortInput,
} from "../../graphql/generated/operations";
import type { UseMeandersResult } from "./use-meanders.types";

// 🧩 Hook

/**
 * Collects the pages after the one the route loaded, in its sort and filter, by cursor.
 * A new first page starts over.
 */
export function useMeanders(
  first: MeandersPage,
  sort?: MeanderSortInput,
  filter?: MeanderFilterGroupInput,
): UseMeandersResult {
  // 🪝 Hooks
  const [loaded, setLoaded] = useState<{
    first: MeandersPage;
    pages: readonly MeandersPage[];
  }>({ first, pages: [] });
  const [loadError, setLoadError] = useState<unknown>();
  const isLoading = useReference(false);

  // 🏗 Setup
  const pages = loaded.first === first ? loaded.pages : [];
  const last = pages.at(-1) ?? first;
  const meanders = [first, ...pages].flatMap((page) =>
    page.edges.map(({ node }) => node),
  );

  // 💪 Handlers
  const loadMore = useCallback((): void => {
    if (isLoading.current || !last.pageInfo.hasNextPage) {
      return;
    }

    isLoading.current = true;
    setLoadError(undefined);
    findMeanders({ after: last.pageInfo.endCursor, filter, sort })
      .then((next) => {
        setLoaded({ first, pages: [...pages, next] });
      })
      .catch((error: unknown) => {
        setLoadError(error);
      })
      .finally(() => {
        isLoading.current = false;
      });
  }, [filter, first, last, pages, sort]);

  // ♻️ Lifecycle

  // 🎁 Result
  return {
    hasMore: last.pageInfo.hasNextPage,
    loadError,
    loadMore,
    meanders,
  };
}
