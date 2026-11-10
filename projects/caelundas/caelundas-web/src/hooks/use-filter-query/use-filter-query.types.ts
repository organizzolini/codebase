import type { EventFilterQuery } from "../../components/calendar-filters/event-filters.types";

// 🏷️ Types

/**
 * The filter tree the builder edits, with what to do with an edit.
 */
export interface UseFilterQueryResult {
  /**
   * Replaces the whole tree with a preset's, and writes it to the link.
   */
  handlePresetSelect: (next: EventFilterQuery) => void;
  handleQueryChange: (next: EventFilterQuery) => void;
  query: EventFilterQuery;
}
