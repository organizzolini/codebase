import { useState } from "react";

import { toEventFilterInput } from "../../components/calendar-filters/event-filter-input.utilities";
import {
  isSameEventFilter,
  toLinkedEventFilter,
} from "../../components/calendar-filters/event-filter-tree.utilities";

import { getDefaultFilter } from "./use-filter-query.utilities";

import type { EventFilterQuery } from "../../components/calendar-filters/event-filters.types";
import type { ResolvedPreset } from "../../components/calendar-filters/presets.types";
import type { UseFilterQueryResult } from "./use-filter-query.types";

// 🧩 Hook

/**
 * Holds the filter tree and presets. Only a link change replaces the tree, so
 * an edit is not undone.
 */
export function useFilterQuery(
  filter: EventFilterQuery | undefined,
  presets: readonly ResolvedPreset[],
  onFilterChange: (filter: EventFilterQuery) => void,
): UseFilterQueryResult {
  // 🪝 Hooks
  const defaultFilter = getDefaultFilter(presets);
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
  const handlePresetSelect = (next: EventFilterQuery): void => {
    setQuery(next);
    onFilterChange(toLinkedEventFilter(next));
  };

  // ♻️ Lifecycle

  // 🎁 Result
  return {
    handlePresetSelect,
    handleQueryChange,
    query,
  };
}
