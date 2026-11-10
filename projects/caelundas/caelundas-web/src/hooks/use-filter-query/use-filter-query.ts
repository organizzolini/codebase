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
 * Holds the filter tree the builder edits and the presets it can be
 * replaced with. A link with no filter opens on the default preset. Only
 * a change to the link itself replaces the tree: the link lags an edit until
 * the calendar has reloaded, and must not undo it meanwhile. An edit that
 * leaves the query as it was, such as a rule that is not finished yet, stays
 * here rather than reloading the calendar, and a preset replaces the
 * whole tree and is written to the link at once.
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
