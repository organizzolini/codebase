import { toGroupLevel } from "../calendar-group-by/components/event-group-model/event-group-fields.utilities";
import { MAXIMUM_GROUP_LEVELS } from "../calendar-group-by/components/event-group-model/event-groups.constants";

import type {
  EventGroupField,
  EventGroupLevel,
} from "../calendar-group-by/components/event-group-model/event-groups.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The name a level's chip shows: its field's label, or the field's id when the data no longer has it.
 */
export function labelGroupLevel(
  level: EventGroupLevel,
  fields: readonly EventGroupField[],
): string {
  return fields.find((field) => field.id === level.field)?.label ?? level.field;
}

/**
 * Takes the field's level out of the grouping, or appends it while there is room for another.
 */
export function toggleGroupLevel(
  grouping: readonly EventGroupLevel[],
  field: EventGroupField,
): EventGroupLevel[] {
  if (grouping.some((level) => level.field === field.id)) {
    return grouping.filter((level) => level.field !== field.id);
  }

  return grouping.length < MAXIMUM_GROUP_LEVELS
    ? [...grouping, toGroupLevel(field)]
    : [...grouping];
}
