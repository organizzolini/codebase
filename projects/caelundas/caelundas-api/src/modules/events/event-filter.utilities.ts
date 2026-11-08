import { eventFilterGroupSchema } from "./event-filter.constants";

import type { EventFilterGroup } from "./event-filter.types";

/**
 * Validates the filter a query was given, answering `null` for no filter and
 * throwing a `ZodError` that names the offending field for a malformed one.
 */
export function parseEventFilter(filter: unknown): EventFilterGroup | null {
  return filter === null || filter === undefined
    ? null
    : eventFilterGroupSchema.parse(filter);
}
