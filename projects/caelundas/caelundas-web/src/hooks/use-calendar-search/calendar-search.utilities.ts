import {
  parseCalendarView,
  parseTimelineScale,
} from "../../components/calendar-display/events-calendar/components/calendar-views/calendar-views.utilities";
import { parseCalendarSymbols } from "../../components/calendar-events/event-glyphs/calendar-symbols.utilities";
import { normalizeEventFilter } from "../../components/calendar-query/calendar-filters/components/event-filter-model/event-filter-tree.utilities";
import { MAXIMUM_GROUP_LEVELS } from "../../components/calendar-query/calendar-group-strip/components/event-group-model/event-groups.constants";

import {
  agendaDaysSchema,
  calendarDateSchema,
  columnsSchema,
  filterGroupSchema,
  groupLevelSchema,
  groupSortsSchema,
  levelsSchema,
  skySearchValueSchema,
} from "./calendar-search.constants";

import type { EventGrouping } from "../../components/calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../../components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { CalendarSearch, SkySearchValue } from "./calendar-search.types";

/**
 * The loader's result depends on the calendar's own search, so the route reloads for a calendar change, not a sky one.
 */
export function getCalendarReloadKey(
  search: Readonly<Record<string, unknown>>,
): string {
  return JSON.stringify(readCalendarSearch(search));
}

/**
 * Reads the calendar's own search parameters, leaving out the backdrop's, so a sky change does not re-render the page.
 */
export function readCalendarSearch(
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
    columns: parseColumns(search["columns"]),
    date: calendarDateSchema.safeParse(search["date"]).data,
    days: agendaDaysSchema.safeParse(search["days"]).data,
    filter: filter === undefined ? undefined : normalizeEventFilter(filter),
    group: parseGrouping(search["group"]),
    scale: parseTimelineScale(search["scale"]),
    sort: parseSorts(search["sort"]),
    symbols: parseCalendarSymbols(search["symbols"]),
    view: parseCalendarView(search["view"]),
  };
}

/**
 * Reads the calendar's search parameters; a value that does not parse falls back to its default, so a stale link still opens.
 */
export function validateCalendarSearch(
  search: Readonly<Record<string, unknown>>,
): CalendarSearch {
  return {
    ...readCalendarSearch(search),
    sky: parseSkyValue(search["sky"]),
    "sky.altBottom": parseSkyValue(search["sky.altBottom"]),
    "sky.bottom": parseSkyValue(search["sky.bottom"]),
    "sky.constellations": parseSkyValue(search["sky.constellations"]),
    "sky.debug": parseSkyValue(search["sky.debug"]),
    "sky.ecliptic": parseSkyValue(search["sky.ecliptic"]),
    "sky.eclipticColor": parseSkyValue(search["sky.eclipticColor"]),
    "sky.eclipticOpacity": parseSkyValue(search["sky.eclipticOpacity"]),
    "sky.eclipticWidth": parseSkyValue(search["sky.eclipticWidth"]),
    "sky.lat": parseSkyValue(search["sky.lat"]),
    "sky.lineColor": parseSkyValue(search["sky.lineColor"]),
    "sky.lineOpacity": parseSkyValue(search["sky.lineOpacity"]),
    "sky.lineWidth": parseSkyValue(search["sky.lineWidth"]),
    "sky.lon": parseSkyValue(search["sky.lon"]),
    "sky.maxMag": parseSkyValue(search["sky.maxMag"]),
    "sky.opacity": parseSkyValue(search["sky.opacity"]),
    "sky.pixelsPerSecond": parseSkyValue(search["sky.pixelsPerSecond"]),
    "sky.starScale": parseSkyValue(search["sky.starScale"]),
    "sky.surfaceOpacity": parseSkyValue(search["sky.surfaceOpacity"]),
    "sky.top": parseSkyValue(search["sky.top"]),
    "sky.vFov": parseSkyValue(search["sky.vFov"]),
  };
}

/**
 * Reads the table's columns from the link, one value or a list; none when there are none.
 */
function parseColumns(value: unknown): string[] | undefined {
  const columns = columnsSchema.safeParse(
    Array.isArray(value) ? value : [value],
  ).data;

  return columns === undefined || columns.length === 0 ? undefined : columns;
}

/**
 * Reads a grouping from the link, dropping unparsable levels and keeping at most the levels a grouping nests.
 */
function parseGrouping(value: unknown): EventGrouping | undefined {
  return levelsSchema
    .safeParse(value)
    .data?.flatMap((level) => groupLevelSchema.safeParse(level).data ?? [])
    .slice(0, MAXIMUM_GROUP_LEVELS);
}

/**
 * Keeps a sky key's value when it parses as a number, boolean or text, and forgets anything else.
 */
function parseSkyValue(value: unknown): SkySearchValue | undefined {
  return skySearchValueSchema.safeParse(value).data;
}

/**
 * Reads the sorts from the link, one object or a list of them, first sort first; none when there are none.
 */
function parseSorts(value: unknown): GroupSort[] | undefined {
  const sorts = groupSortsSchema.safeParse(
    Array.isArray(value) ? value : [value],
  ).data;

  return sorts === undefined || sorts.length === 0 ? undefined : sorts;
}
