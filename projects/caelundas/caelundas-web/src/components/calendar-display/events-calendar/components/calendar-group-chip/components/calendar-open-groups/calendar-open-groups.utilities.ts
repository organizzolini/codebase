import {
  groupCalendarEvents,
  isDefaultGrouping,
} from "../../../calendar-groups/calendar-groups.utilities";

import type { EventGrouping } from "../../../../../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type {
  CalendarEventGroup,
  CalendarGroupSort,
} from "../../../calendar-groups/calendar-groups.types";
import type { SubGroups } from "./calendar-open-groups.types";

// 🌎 Public Functions

/**
 * The groups nested in a group: the next level that splits its events by a key; none for the default grouping.
 */
export function getSubGroups(
  group: CalendarEventGroup,
  options: Readonly<{
    colors: ReadonlyMap<string, string> | undefined;
    grouping: EventGrouping | undefined;
    level: number;
    sort: CalendarGroupSort;
  }>,
): SubGroups {
  const { colors, grouping, level, sort } = options;

  // The default grouping lists a level per depth beneath the roots; only a grouping the link names nests.
  if (grouping === undefined || isDefaultGrouping(grouping)) {
    return { groups: [], level };
  }

  for (let next = level + 1; next < grouping.length; next += 1) {
    const groups = groupCalendarEvents(group.events, {
      colors,
      grouping,
      level: next,
      ...sort,
    });

    // A level where no event has a key would be one "Other" group holding them all.
    if (groups.some((candidate) => candidate.key !== null)) {
      return { groups, level: next };
    }
  }

  return { groups: [], level };
}

/**
 * The open ids with one more opened, or closed again if it was open.
 */
export function toggleOpen(open: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(open);

  if (!next.delete(id)) {
    next.add(id);
  }

  return next;
}
