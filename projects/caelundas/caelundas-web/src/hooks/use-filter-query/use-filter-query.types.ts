import type { EventFilterQuery } from "../../components/calendar-filters/event-filters.types";

// 🏷️ Types

/**
 * The filter tree the builder edits, with what to do with an edit.
 */
export interface UseFilterQueryResult {
  /**
   * Replaces the whole tree with a collection's, and writes it to the link.
   */
  handleCollectionSelect: (next: EventFilterQuery) => void;
  handleQueryChange: (next: EventFilterQuery) => void;
  query: EventFilterQuery;
}
