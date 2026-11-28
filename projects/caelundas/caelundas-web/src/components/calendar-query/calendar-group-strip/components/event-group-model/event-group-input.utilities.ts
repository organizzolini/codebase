import type {
  EventGroupingInput,
  EventGroupLevelInput,
} from "../../../../../graphql/generated/operations";
import type { EventGrouping, EventGroupLevel } from "./event-groups.types";

/**
 * Writes the grouping as the API's grouping input, or `null` when there is none.
 */
export function toEventGroupingInput(
  grouping: EventGrouping,
): EventGroupingInput | null {
  if (grouping.length === 0) {
    return null;
  }

  const levels: EventGroupLevelInput[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const level of grouping) {
    levels.push(toLevelInput(level));
  }

  return { levels };
}

/**
 * Writes one level: the field, and for a tag root the tags it picks or else
 * the depth beneath the root.
 */
function toLevelInput(level: EventGroupLevel): EventGroupLevelInput {
  return {
    ...(level.depth === undefined ? {} : { depth: level.depth }),
    field: level.field,
    ...(level.parent === undefined ? {} : { parent: level.parent }),
    ...(level.tags === undefined || level.tags.length === 0
      ? {}
      : { tags: [...level.tags] }),
  };
}
