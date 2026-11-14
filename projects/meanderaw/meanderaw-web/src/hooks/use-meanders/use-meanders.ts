import { useCallback, useRef as useReference, useState } from "react";

import { findMeanders } from "../../components/meander-gallery/meanders-api.utilities";

import type { MeandersPage } from "../../components/meander-gallery/meanders-api.types";
import type { UseMeandersResult } from "./use-meanders.types";

// 🧩 Hook

/**
 * Collects the pages of meanders after the first, which the route loaded,
 * reading each by the cursor the page before it ended on. A new first page
 * starts the collection over.
 */
export function useMeanders(first: MeandersPage): UseMeandersResult {
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
    findMeanders({ after: last.pageInfo.endCursor })
      .then((next) => {
        setLoaded({ first, pages: [...pages, next] });
      })
      .catch((error: unknown) => {
        setLoadError(error);
      })
      .finally(() => {
        isLoading.current = false;
      });
  }, [first, last, pages]);

  // ♻️ Lifecycle

  // 🎁 Result
  return {
    hasMore: last.pageInfo.hasNextPage,
    loadError,
    loadMore,
    meanders,
  };
}
