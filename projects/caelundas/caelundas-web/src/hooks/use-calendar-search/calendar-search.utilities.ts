import { parseMetrics } from "../../components/calendar-display/calendar-metrics/calendar-metrics.utilities";
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
 * The route reloads for a calendar's search change, not a sky or metrics one, which the layouts read themselves.
 */
export function getCalendarReloadKey(
  search: Readonly<Record<string, unknown>>,
): string {
  return JSON.stringify({
    ...readCalendarSearch(search),
    compare: undefined,
    metrics: undefined,
  });
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
    colors:
      search["colors"] === false || search["colors"] === "false"
        ? false
        : undefined,
    columns: parseColumns(search["columns"]),
    compare:
      search["compare"] === true || search["compare"] === "true"
        ? true
        : undefined,
    date: calendarDateSchema.safeParse(search["date"]).data,
    days: agendaDaysSchema.safeParse(search["days"]).data,
    filter: filter === undefined ? undefined : normalizeEventFilter(filter),
    group: parseGrouping(search["group"]),
    metrics: parseMetrics(search["metrics"]),
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
    skyfield: readSkyValue(search, "skyfield"),
    "skyfield.altBottom": readSkyValue(search, "skyfield.altBottom"),
    "skyfield.bottom": readSkyValue(search, "skyfield.bottom"),
    "skyfield.constellations": readSkyValue(search, "skyfield.constellations"),
    "skyfield.debug": readSkyValue(search, "skyfield.debug"),
    "skyfield.ecliptic": readSkyValue(search, "skyfield.ecliptic"),
    "skyfield.eclipticColor": readSkyValue(search, "skyfield.eclipticColor"),
    "skyfield.eclipticOpacity": readSkyValue(
      search,
      "skyfield.eclipticOpacity",
    ),
    "skyfield.eclipticWidth": readSkyValue(search, "skyfield.eclipticWidth"),
    "skyfield.lat": readSkyValue(search, "skyfield.lat"),
    "skyfield.lineColor": readSkyValue(search, "skyfield.lineColor"),
    "skyfield.lineOpacity": readSkyValue(search, "skyfield.lineOpacity"),
    "skyfield.lineWidth": readSkyValue(search, "skyfield.lineWidth"),
    "skyfield.lon": readSkyValue(search, "skyfield.lon"),
    "skyfield.maxMag": readSkyValue(search, "skyfield.maxMag"),
    "skyfield.opacity": readSkyValue(search, "skyfield.opacity"),
    "skyfield.pixelsPerSecond": readSkyValue(
      search,
      "skyfield.pixelsPerSecond",
    ),
    "skyfield.starScale": readSkyValue(search, "skyfield.starScale"),
    "skyfield.top": readSkyValue(search, "skyfield.top"),
    "skyfield.vFov": readSkyValue(search, "skyfield.vFov"),
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
 * Reads a grouping from the link, dropping unparsable levels, keeping at most the levels a grouping nests; none when there are none.
 */
function parseGrouping(value: unknown): EventGrouping | undefined {
  const levels = levelsSchema
    .safeParse(value)
    .data?.flatMap((level) => groupLevelSchema.safeParse(level).data ?? [])
    .slice(0, MAXIMUM_GROUP_LEVELS);

  return levels === undefined || levels.length === 0 ? undefined : levels;
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

/**
 * Reads a skyfield key, falling back to its old `sky` spelling, so a link from before the rename still opens.
 */
function readSkyValue(
  search: Readonly<Record<string, unknown>>,
  key: string,
): SkySearchValue | undefined {
  return (
    parseSkyValue(search[key]) ??
    parseSkyValue(search[key.replace(/^skyfield/u, "sky")])
  );
}
