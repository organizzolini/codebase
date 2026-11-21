import { findMeanders } from "../../components/gallery/meander-gallery/meanders-api.utilities";

import type { MeandersPage } from "../../components/gallery/meander-gallery/meanders-api.types";
import type { PagingQuery, PagingState } from "./use-meanders.types";
import type { RefObject as ReferenceObject } from "react";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Whether a place may be shown: a page that exists, while no read is under way.
 */
export function canGoTo(
  request: Readonly<{ isLoading: boolean; pageCount: number; target: number }>,
): boolean {
  const { isLoading, pageCount, target } = request;

  return !isLoading && target >= 0 && target < pageCount;
}

/**
 * How to read a page: after the cursor before it when one sort orders it,
 * else past an offset.
 */
export function planRead(
  request: Readonly<{
    first: MeandersPage;
    pages: Readonly<Record<number, MeandersPage>>;
    size: number;
    sorts: number;
    target: number;
  }>,
): { after: null | string; offset: number } {
  const { first, pages, size, sorts, target } = request;
  // A cursor holds one sort's place; several are paged by offset.
  const before =
    sorts > 1 ? undefined : target === 1 ? first : pages[target - 1];

  return {
    after: before?.pageInfo.endCursor ?? null,
    offset: before === undefined ? target * size : 0,
  };
}

/**
 * Reads a page after a cursor or past an offset and keeps it; a failed read steps back.
 */
export function readPage(
  request: Readonly<{
    after: null | string;
    fallback: number;
    first: MeandersPage;
    offset: number;
    position: number;
    query: Readonly<PagingQuery>;
    setState: (update: (previous: PagingState) => PagingState) => void;
    showing: Readonly<ReferenceObject<MeandersPage | undefined>>;
  }>,
): void {
  const { after, fallback, first, offset, position, query, setState, showing } =
    request;

  findMeanders({
    after,
    filter: query.filter,
    first: query.size,
    offset,
    repeats: query.repeats,
    sort: query.sort === undefined ? undefined : [...query.sort],
  })
    .then((read) => {
      if (showing.current === first) {
        setState((previous) => ({
          first,
          pages: { ...previous.pages, [position]: read },
          position: previous.position,
        }));
      }
    })
    .catch((error: unknown) => {
      if (showing.current === first) {
        setState((previous) => ({
          failure: { error },
          first,
          pages: previous.pages,
          position: fallback,
        }));
      }
    });
}

/**
 * Reads the page showing out of the state: it, whether it loads, and the page count.
 */
export function resolvePaging(
  first: MeandersPage | undefined,
  state: PagingState,
  size: number,
): {
  isLoading: boolean;
  page: MeandersPage | undefined;
  pageCount: number;
  pages: Readonly<Record<number, MeandersPage>>;
  position: number;
} {
  const isCurrent = state.first === first;
  const position = isCurrent ? state.position : 0;
  const pages = isCurrent ? state.pages : {};
  const page = position === 0 ? first : pages[position];

  return {
    isLoading: first !== undefined && page === undefined,
    page,
    pageCount: Math.ceil((first?.totalCount ?? 0) / size),
    pages,
    position,
  };
}
