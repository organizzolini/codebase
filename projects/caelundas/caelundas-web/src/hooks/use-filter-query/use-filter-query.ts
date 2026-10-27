import { useMemo, useState } from "react";

import { resolveEventFilterCollections } from "../../utilities/event-filter-collections.utilities";
import { compileEventFilter } from "../../utilities/event-filter-compiler.utilities";
import {
  isSameEventFilter,
  toLinkedEventFilter,
} from "../../utilities/event-filter-tree.utilities";

import { getDefaultFilter } from "./use-filter-query.utilities";

import type { EventFilterQuery } from "../../types/event-filters.types";
import type { EventFacet } from "../../types/events-database.types";
import type { UseFilterQueryResult } from "./use-filter-query.types";

// 🧩 Hook

/**
 * Holds the filter tree the builder edits and the collections it can be
 * replaced with. A link with no filter opens on the default collection. Only
 * a change to the link itself replaces the tree: the link lags an edit until
 * the calendar has reloaded, and must not undo it meanwhile. An edit that
 * leaves the query as it was, such as a rule that is not finished yet, stays
 * here rather than reloading the calendar, and a collection replaces the
 * whole tree and is written to the link at once.
 */
export function useFilterQuery(
  filter: EventFilterQuery | undefined,
  facets: readonly EventFacet[],
  onFilterChange: (filter: EventFilterQuery) => void,
): UseFilterQueryResult {
  // 🪝 Hooks
  const collections = useMemo(
    () => resolveEventFilterCollections(facets),
    [facets],
  );
  const defaultFilter = getDefaultFilter(collections);
  const [query, setQuery] = useState(filter ?? defaultFilter);
  const [seenFilter, setSeenFilter] = useState(filter);

  // 🏗 Setup
  if (!isSameEventFilter(filter, seenFilter)) {
    setSeenFilter(filter);

    if (!isSameEventFilter(filter, toLinkedEventFilter(query))) {
      setQuery(filter ?? defaultFilter);
    }
  }

  // 💪 Handlers
  const handleQueryChange = (next: EventFilterQuery): void => {
    setQuery(next);

    if (
      JSON.stringify(compileEventFilter(next)) !==
      JSON.stringify(compileEventFilter(query))
    ) {
      onFilterChange(toLinkedEventFilter(next));
    }
  };
  const handleCollectionSelect = (next: EventFilterQuery): void => {
    setQuery(next);
    onFilterChange(toLinkedEventFilter(next));
  };

  // ♻️ Lifecycle

  // 🎁 Result
  return {
    collections,
    handleCollectionSelect,
    handleQueryChange,
    query,
  };
}
