import { NAMED_TAGS } from "./group-level-row.constants";

import type {
  EventGroupField,
  EventGroupLevel,
} from "../types/event-groups.types";

/**
 * Names what a level goes by: the tags picked, or the level of the root's
 * tree it goes by, the first unless an older link says otherwise.
 */
export function describeTags(
  field: EventGroupField,
  level: EventGroupLevel,
): string {
  const tags = level.tags ?? [];

  if (tags.length === 0) {
    const depth = level.depth ?? 1;

    return depth > 1 ? `Level ${String(depth)}` : "First level";
  }

  const names = tags.flatMap((tag) => {
    const option = field.options.find((candidate) => candidate.value === tag);

    return option === undefined ? [] : [option.label];
  });
  const shown = names.slice(0, NAMED_TAGS).join(", ");

  return names.length > NAMED_TAGS
    ? `${shown} +${String(names.length - NAMED_TAGS)}`
    : shown;
}
