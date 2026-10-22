import { z } from "zod";

const calendarDateSchema = z.iso.date();

/**
 * The calendar's URL search parameters.
 */
export interface CalendarSearch {
  /**
   * The day the calendar shows, as `YYYY-MM-DD`; today when absent.
   */
  date?: string | undefined;
}

/**
 * Reads the calendar's search parameters. A value that does not parse falls
 * back to its default rather than failing, so a stale link still opens.
 */
export function validateCalendarSearch(
  search: Readonly<Record<string, unknown>>,
): CalendarSearch {
  return { date: calendarDateSchema.safeParse(search["date"]).data };
}
