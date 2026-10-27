import { DEFAULT_EVENT_FILTER_COLLECTION_ID } from "../../constants/event-filter-collections.constants";
import { EMPTY_EVENT_FILTER } from "../../constants/event-filter-tree.constants";

import type { ResolvedEventFilterCollection } from "../../types/event-filter-collections.types";
import type { EventFilterQuery } from "../../types/event-filters.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The filter of the default collection, or none when the data has no such
 * collection.
 */
export function getDefaultFilter(
  collections: readonly ResolvedEventFilterCollection[],
): EventFilterQuery {
  return (
    collections.find(
      (collection) => collection.id === DEFAULT_EVENT_FILTER_COLLECTION_ID,
    )?.filter ?? EMPTY_EVENT_FILTER
  );
}
