import {
  eventGroupLevelSchema,
  MAXIMUM_GROUP_LEVELS,
} from "./event-grouping.constants";

import type { EventGroupLevel } from "./event-grouping.types";

/**
 * Validates the grouping a query was given and appends the level the events
 * are colored by, so the color's keys come last. Throws a `ZodError` that
 * names the offending field for a malformed one, including a grouping of
 * more than {@link MAXIMUM_GROUP_LEVELS} levels.
 */
export function parseEventGrouping(
  grouping: unknown,
  colorBy: unknown,
): EventGroupLevel[] {
  const levels = eventGroupLevelSchema
    .array()
    .max(MAXIMUM_GROUP_LEVELS)
    .nullish()
    .transform((parsed) => parsed ?? [])
    .parse(grouping);

  return colorBy === null || colorBy === undefined
    ? levels
    : [...levels, eventGroupLevelSchema.parse(colorBy)];
}
