import { z } from "zod";

import { normalizeEventFilter } from "../event-filters/event-filter-tree";

import type { EventFilterQuery } from "../event-filters/event-filters.types";

const calendarDateSchema = z.iso.date();

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
   * The ReUI filter tree; no filter when absent.
   */
  filter?: EventFilterQuery | undefined;
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
    filter: filter === undefined ? undefined : normalizeEventFilter(filter),
  };
}
