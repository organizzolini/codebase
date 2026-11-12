import type { EventFilterQuery } from "./event-filters.types";

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
