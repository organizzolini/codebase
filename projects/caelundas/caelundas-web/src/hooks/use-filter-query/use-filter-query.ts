import { useState } from "react";

import { toEventFilterInput } from "../../components/calendar-filters/event-filter-input.utilities";
import {
  isSameEventFilter,
  toLinkedEventFilter,
} from "../../components/calendar-filters/event-filter-tree.utilities";

import { getDefaultFilter } from "./use-filter-query.utilities";

import type { ResolvedEventFilterCollection } from "../../components/calendar-filters/event-filter-collections.types";
import type { EventFilterQuery } from "../../components/calendar-filters/event-filters.types";
import type { UseFilterQueryResult } from "./use-filter-query.types";

// 🧩 Hook

/**
 * Holds the filter tree the builder edits; a link with no filter opens on the default collection, and only link changes replace the tree.
 */
export function useFilterQuery(
  filter: EventFilterQuery | undefined,
  collections: readonly ResolvedEventFilterCollection[],
  onFilterChange: (filter: EventFilterQuery) => void,
): UseFilterQueryResult {
  // 🪝 Hooks
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
      JSON.stringify(toEventFilterInput(next)) !==
      JSON.stringify(toEventFilterInput(query))
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
    handleCollectionSelect,
    handleQueryChange,
    query,
  };
}
