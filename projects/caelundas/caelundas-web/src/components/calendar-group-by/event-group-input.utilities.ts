import type {
  EventGroupingInput,
  EventGroupLevelInput,
} from "../../graphql/generated/operations";
import type { EventGrouping, EventGroupLevel } from "./event-groups.types";

/**
 * Writes the grouping and color levels as the API's grouping input, or `null` when neither is set.
 */
export function toEventGroupingInput(
  grouping: EventGrouping,
  colorBy: EventGroupLevel | undefined,
): EventGroupingInput | null {
  if (grouping.length === 0 && colorBy === undefined) {
    return null;
  }

  const levels: EventGroupLevelInput[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const level of grouping) {
    levels.push(toLevelInput(level));
  }

  return {
    ...(levels.length === 0 ? {} : { levels }),
    ...(colorBy === undefined ? {} : { colorBy: toLevelInput(colorBy) }),
  };
}

/**
 * Writes one level: the field, and for a tag root the tags it picks or else
 * the depth beneath the root.
 */
function toLevelInput(level: EventGroupLevel): EventGroupLevelInput {
  return {
    ...(level.depth === undefined ? {} : { depth: level.depth }),
    field: level.field,
    ...(level.tags === undefined || level.tags.length === 0
      ? {}
      : { tags: [...level.tags] }),
  };
}
