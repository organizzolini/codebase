import type { EventFilterQuery } from "../../components/calendar-filters/event-filters.types";

// 🏷️ Types

/**
 * The filter tree, and its edit and preset handlers.
 */
export interface UseFilterQueryResult {
  /**
   * Replaces the whole tree with a preset's, and writes it to the link.
   */
  handlePresetSelect: (next: EventFilterQuery) => void;
  handleQueryChange: (next: EventFilterQuery) => void;
  query: EventFilterQuery;
}
