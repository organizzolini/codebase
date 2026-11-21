import type { EventFilterQuery } from "../event-filter-model/event-filters.types";

// 🏷️ Types

/**
 * A named filter set, with tags resolved against the data.
 */
export interface ResolvedPreset {
  description: string;
  filter: EventFilterQuery;
  id: string;
  name: string;
}
