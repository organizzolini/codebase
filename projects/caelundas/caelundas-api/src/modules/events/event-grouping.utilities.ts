import { eventGroupingSchema } from "./event-grouping.constants";

import type { EventGroupLevel } from "./event-grouping.types";

/**
 * Validates a query's grouping and appends the color level last. Throws a
 * `ZodError` naming the field, including for more than three levels.
 */
export function parseEventGrouping(grouping: unknown): EventGroupLevel[] {
  const { colorBy, levels } = eventGroupingSchema.parse(grouping ?? {});

  return colorBy === undefined ? levels : [...levels, colorBy];
}
