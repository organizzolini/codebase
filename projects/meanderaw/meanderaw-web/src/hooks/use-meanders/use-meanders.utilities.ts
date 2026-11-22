import { findMeanders } from "../../components/gallery/meander-gallery/meanders-api.utilities";

import type { MeandersPage } from "../../components/gallery/meander-gallery/meanders-api.types";
import type {
  PageWindow,
  PagingQuery,
  PagingState,
} from "./use-meanders.types";
import type { RefObject as ReferenceObject } from "react";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Whether a window may be shown: pages that exist, in order.
 */
export function fitsWindow(range: PageWindow, pageCount: number): boolean {
  return (
    range.first >= 1 && range.first <= range.last && range.last <= pageCount
  );
}

/**
 * Lists the pages of a window not read yet, by their number from 2.
 */
export function listMissing(
  range: PageWindow,
  pages: Readonly<Record<number, MeandersPage>>,
): number[] {
  const missing: number[] = [];

  for (let page = Math.max(range.first, 2); page <= range.last; page += 1) {
    if (pages[page] === undefined) {
      missing.push(page);
    }
  }

  return missing;
}

/**
 * Reads a page past the offset its number makes and keeps it; a failed read
 * keeps its error and steps back.
 */
export async function readPage(
  request: Readonly<{
    fallback: PageWindow;
    first: MeandersPage;
    page: number;
    query: Readonly<PagingQuery>;
    setState: (update: (previous: PagingState) => PagingState) => void;
    showing: Readonly<ReferenceObject<MeandersPage | undefined>>;
    target: PageWindow;
  }>,
): Promise<void> {
  const { fallback, first, page, query, setState, showing, target } = request;

  return findMeanders({
    filter: query.filter,
    first: query.size,
    offset: (page - 1) * query.size,
    repeats: query.repeats,
    sort: query.sort === undefined ? undefined : [...query.sort],
  })
    .then((read) => {
      if (showing.current === first) {
        setState((previous) => ({
          ...previous,
          pages: { ...previous.pages, [page]: read },
        }));
      }
    })
    .catch((error: unknown) => {
      if (showing.current === first) {
        setState((previous) => ({
          ...previous,
          failure: { error, range: target },
          // Steps back only if the window failing is still the one showing.
          range:
            previous.range.first === target.first &&
            previous.range.last === target.last
              ? fallback
              : previous.range,
        }));
      }
    });
}

/**
 * Reads the window showing out of the state: the meanders of its pages read,
 * whether any waits, and the page count.
 */
export function resolvePaging(
  first: MeandersPage,
  state: PagingState,
  size: number,
): {
  isLoading: boolean;
  meanders: MeandersPage["edges"][number]["node"][];
  pageCount: number;
  pages: Readonly<Record<number, MeandersPage>>;
  range: PageWindow;
} {
  const isCurrent = state.first === first;
  const range = isCurrent ? state.range : { first: 1, last: 1 };
  const pages = isCurrent ? state.pages : {};
  const meanders: MeandersPage["edges"][number]["node"][] = [];
  let isLoading = false;

  for (let number = range.first; number <= range.last; number += 1) {
    const page = number === 1 ? first : pages[number];

    if (page === undefined) {
      isLoading = true;
      continue;
    }

    for (const { node } of page.edges) {
      meanders.push(node);
    }
  }

  return {
    isLoading,
    meanders,
    pageCount: Math.ceil(first.totalCount / size),
    pages,
    range,
  };
}
