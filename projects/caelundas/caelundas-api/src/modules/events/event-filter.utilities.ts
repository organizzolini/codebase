import { eventFilterGroupSchema } from "./event-filter.constants";

import type { EventFilterGroup } from "./event-filter.types";

/**
 * Validates a query's filter, returning `null` when absent; a malformed one
 * throws a `ZodError` naming the field.
 */
export function parseEventFilter(filter: unknown): EventFilterGroup | null {
  return filter === null || filter === undefined
    ? null
    : eventFilterGroupSchema.parse(filter);
}
