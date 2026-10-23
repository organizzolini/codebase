import { z } from "zod";

import { normalizeEventFilter } from "../event-filters/event-filter-tree";
import {
  MAXIMUM_GROUP_DEPTH,
  MAXIMUM_GROUP_LEVELS,
} from "../event-groups/event-groups.constants";

import { parseCalendarSymbols } from "./calendar-symbols";
import {
  type CalendarViewName,
  MAXIMUM_AGENDA_DAYS,
  parseCalendarView,
  parseTimelineScale,
  type TimelineScale,
} from "./calendar-views";

import type { EventFilterQuery } from "../event-filters/event-filters.types";
import type { EventGrouping } from "../event-groups/event-groups.types";

const calendarDateSchema = z.iso.date();

// The agenda lists up to a year at a time, so a link can never ask for the
// whole dataset at once.
const agendaDaysSchema = z.number().int().min(1).max(MAXIMUM_AGENDA_DAYS);

const levelsSchema = z.array(z.unknown());

// A depth out of range is forgotten rather than the level dropped: the
// level's depth is brought within its root's tree once the tree is read.
const groupDepthSchema = z.number().int().min(1).max(MAXIMUM_GROUP_DEPTH);

const groupLevelSchema = z.object({
  depth: z
    .unknown()
    .transform((depth) => groupDepthSchema.safeParse(depth).data)
    .optional(),
  field: z.string().min(1),
  // Anything but a list of ids is forgotten, like a depth out of range.
  tags: z
    .unknown()
    .transform((tags) => z.array(z.string()).safeParse(tags).data)
    .optional(),
});

const filterValueSchema = z.union([
  z.array(z.union([z.null(), z.number(), z.string()])),
  z.null(),
  z.number(),
  z.string(),
]);

const filterRuleSchema = z.object({
  id: z.string(),
  negated: z.boolean().optional(),
  operator: z.string(),
  path: z.array(z.string()),
  type: z.literal("rule"),
  value: filterValueSchema.optional(),
});

const filterGroupSchema = z.object({
  combinator: z.enum(["and", "or"]),
  id: z.string(),
  get rules() {
    return z.array(z.union([filterRuleSchema, filterGroupSchema]));
  },
  type: z.literal("group"),
});

/**
 * The calendar's URL search parameters.
 */
export interface CalendarSearch {
  /**
   * `false` when the views of hours leave events unmerged; merged when
   * absent.
   */
  clusters?: false | undefined;
  /**
   * `false` when events are drawn without their colors; colored when absent.
   */
  colors?: false | undefined;
  /**
   * The day the calendar shows, as `YYYY-MM-DD`; today when absent.
   */
  date?: string | undefined;
  /**
   * How many days the agenda lists, grown as it scrolls; a month's worth
   * when absent.
   */
  days?: number | undefined;
  /**
   * The ReUI filter tree; no filter when absent.
   */
  filter?: EventFilterQuery | undefined;
  /**
   * The levels the agenda and the timeline group events by, outermost
   * first, empty for none; each view's default when absent.
   */
  group?: EventGrouping | undefined;
  /**
   * The span the timeline shows at once; a month when absent.
   */
  scale?: TimelineScale | undefined;
  /**
   * `emojis` when events are drawn with their emoji; their icons when absent.
   */
  symbols?: "emojis" | undefined;
  /**
   * The view the calendar shows; the month when absent.
   */
  view?: CalendarViewName | undefined;
}

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
