import { eventGroupingSchema } from "./event-grouping.constants";

import type { EventGroupLevel } from "./event-grouping.types";

/**
 * Validates the grouping a query was given and appends the level the events
 * are colored by, so the color's keys come last. Throws a `ZodError` that
 * names the offending field for a malformed one, including more than three
 * levels of grouping.
 */
export function parseEventGrouping(grouping: unknown): EventGroupLevel[] {
  const { colorBy, levels } = eventGroupingSchema.parse(grouping ?? {});

  return colorBy === undefined ? levels : [...levels, colorBy];
}
