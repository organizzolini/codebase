import { normalizeEventFilter } from "../../components/calendar-filters/event-filter-tree.utilities";
import { MAXIMUM_GROUP_LEVELS } from "../../components/calendar-group-by/event-groups.constants";
import {
  parseCalendarView,
  parseTimelineScale,
} from "../../components/events-calendar/calendar-views.utilities";

import {
  agendaDaysSchema,
  calendarDateSchema,
  filterGroupSchema,
  groupLevelSchema,
  levelsSchema,
} from "./calendar-search.constants";
import { parseCalendarSymbols } from "./calendar-symbols.utilities";

import type { EventGrouping } from "../../components/calendar-group-by/event-groups.types";
import type { CalendarSearch } from "./calendar-search.types";

/**
 * Reads the calendar's search parameters. A value that does not parse falls
 * back to its default rather than failing, so a stale link still opens.
 */
export function validateCalendarSearch(
  search: Readonly<Record<string, unknown>>,
): CalendarSearch {
  const filter = filterGroupSchema.safeParse(search["filter"]).data;

  return {
    clusters:
      search["clusters"] === false || search["clusters"] === "false"
        ? false
        : undefined,
    color: groupLevelSchema.safeParse(search["color"]).data,
    colors:
      search["colors"] === false || search["colors"] === "false"
        ? false
        : undefined,
    date: calendarDateSchema.safeParse(search["date"]).data,
    days: agendaDaysSchema.safeParse(search["days"]).data,
    filter: filter === undefined ? undefined : normalizeEventFilter(filter),
    group: parseGrouping(search["group"]),
    scale: parseTimelineScale(search["scale"]),
    symbols: parseCalendarSymbols(search["symbols"]),
    view: parseCalendarView(search["view"]),
  };
}

/**
 * Reads a grouping from the link: a list whose levels that do not parse are
 * dropped one by one, cut to the most levels a grouping nests, so a link
 * from an older grouping keeps what it still can. Anything but a list is no
 * grouping, which leaves the view's default.
 */
function parseGrouping(value: unknown): EventGrouping | undefined {
  return levelsSchema
    .safeParse(value)
    .data?.flatMap((level) => groupLevelSchema.safeParse(level).data ?? [])
    .slice(0, MAXIMUM_GROUP_LEVELS);
}
