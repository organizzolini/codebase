import type { ResolvedEventFilterCollection } from "../../components/calendar-filters/event-filter-collections.types";
import type { EventFilterQuery } from "../../components/calendar-filters/event-filters.types";

// 🏷️ Types

/**
 * The filter tree the builder edits, with what to do with an edit.
 */
export interface UseFilterQueryResult {
  /**
   * The collections a whole tree can be replaced with.
   */
  collections: ResolvedEventFilterCollection[];
  handleCollectionSelect: (next: EventFilterQuery) => void;
  handleQueryChange: (next: EventFilterQuery) => void;
  query: EventFilterQuery;
}
