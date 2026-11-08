import type { EventFilterQuery } from "./event-filters.types";

// 🏷️ Types

/**
 * A named set of filters the calendar applies in one step, with its names
 * resolved to the tags of the data by the API.
 */
export interface ResolvedEventFilterCollection {
  description: string;
  filter: EventFilterQuery;
  id: string;
  name: string;
}
