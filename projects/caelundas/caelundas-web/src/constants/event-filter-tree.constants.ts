import type { EventFilterQuery } from "../types/event-filters.types";

/**
 * The tree the builder starts from when the link holds no filter.
 */
export const EMPTY_EVENT_FILTER: EventFilterQuery = {
  combinator: "and",
  id: "filter",
  rules: [],
  type: "group",
};
