import { useMemo, useState } from "react";

import {
  DEFAULT_EVENT_FILTER_COLLECTION_ID,
  type ResolvedEventFilterCollection,
  resolveEventFilterCollections,
} from "../lib/event-filters/event-filter-collections";
import { compileEventFilter } from "../lib/event-filters/event-filter-compiler";
import {
  EMPTY_EVENT_FILTER,
  isSameEventFilter,
  toLinkedEventFilter,
} from "../lib/event-filters/event-filter-tree";

import type { EventFilterQuery } from "../lib/event-filters/event-filters.types";
import type { EventFacet } from "../lib/events-database/events-database.types";

// 🔖 Type

/**
 * The filter tree the builder edits, with what to do with an edit.
 */
export interface FilterQueryState {
  collections: ResolvedEventFilterCollection[];
  handleCollectionSelect: (next: EventFilterQuery) => void;
  handleQueryChange: (next: EventFilterQuery) => void;
  query: EventFilterQuery;
}

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
): FilterQueryState {
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

  return {
    collections,
    handleCollectionSelect,
    handleQueryChange,
    query,
  };
}

/**
 * The filter of the default collection, or none when the data has no such
 * collection.
 */
function getDefaultFilter(
  collections: readonly ResolvedEventFilterCollection[],
): EventFilterQuery {
  return (
    collections.find(
      (collection) => collection.id === DEFAULT_EVENT_FILTER_COLLECTION_ID,
    )?.filter ?? EMPTY_EVENT_FILTER
  );
}
