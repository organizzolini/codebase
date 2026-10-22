import { z } from "zod";

import { normalizeEventFilter } from "../event-filters/event-filter-tree";

import {
  type CalendarViewName,
  MAXIMUM_AGENDA_DAYS,
  parseCalendarView,
} from "./calendar-views";

import type { EventFilterQuery } from "../event-filters/event-filters.types";

const calendarDateSchema = z.iso.date();

// The agenda lists up to a year at a time, so a link can never ask for the
// whole dataset at once.
const agendaDaysSchema = z.number().int().min(1).max(MAXIMUM_AGENDA_DAYS);

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
    date: calendarDateSchema.safeParse(search["date"]).data,
    days: agendaDaysSchema.safeParse(search["days"]).data,
    filter: filter === undefined ? undefined : normalizeEventFilter(filter),
    view: parseCalendarView(search["view"]),
  };
}
