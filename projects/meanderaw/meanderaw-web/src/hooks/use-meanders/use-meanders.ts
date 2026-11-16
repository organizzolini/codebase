import {
  useCallback,
  useEffect,
  useRef as useReference,
  useState,
} from "react";

import { findMeanders } from "../../components/meander-gallery/meanders-api.utilities";

import type { MeandersPage } from "../../components/meander-gallery/meanders-api.types";
import type { MeanderSortInput } from "../../graphql/generated/operations";
import type { UseMeandersResult } from "./use-meanders.types";

// 🧩 Hook

/**
 * Collects the pages after the loaded first, in its sort and repeats. A new
 * first page starts over.
 */
export function useMeanders(
  first: MeandersPage,
  query: Readonly<{ repeats: number; sort?: MeanderSortInput | undefined }>,
): UseMeandersResult {
  // 🪝 Hooks
  const [loaded, setLoaded] = useState<{
    first: MeandersPage;
    pages: readonly MeandersPage[];
  }>({ first, pages: [] });
  const [failure, setFailure] = useState<{
    error: unknown;
    first: MeandersPage;
  }>();
  // The first page a read is in flight for, and the one now showing: a read
  // belongs to the first page it began under, whatever shows when it ends.
  const inFlight = useReference<MeandersPage | null>(null);
  const showing = useReference(first);

  // 🏗 Setup
  const pages = loaded.first === first ? loaded.pages : [];
  const last = pages.at(-1) ?? first;
  const meanders = [first, ...pages].flatMap((page) =>
    page.edges.map(({ node }) => node),
  );

  // 💪 Handlers
  const loadMore = useCallback((): void => {
    if (inFlight.current === first || !last.pageInfo.hasNextPage) {
      return;
    }

    inFlight.current = first;
    setFailure(undefined);
    findMeanders({ after: last.pageInfo.endCursor, ...query })
      .then((next) => {
        if (showing.current === first) {
          setLoaded((previous) => ({
            first,
            pages: [...(previous.first === first ? previous.pages : []), next],
          }));
        }
      })
      .catch((error: unknown) => {
        if (showing.current === first) {
          setFailure({ error, first });
        }
      })
      .finally(() => {
        if (inFlight.current === first) {
          inFlight.current = null;
        }
      });
  }, [first, last, query]);

  // ♻️ Lifecycle
  useEffect(() => {
    showing.current = first;
  }, [first]);

  // 🎁 Result
  return {
    hasMore: last.pageInfo.hasNextPage,
    loadError: failure?.first === first ? failure.error : undefined,
    loadMore,
    meanders,
  };
}
