import type { CalendarEventRecord } from "../../../calendar-loader/calendar-records.types";

// 🏷️ Types

/**
 * The blocks marking long events' ends, and each one's event.
 */
export interface EdgeBlocks {
  blocks: CalendarEventRecord[];
  origins: Map<string, CalendarEventRecord>;
}

/**
 * The view's days as `YYYY-MM-DD`, and their zone.
 */
export interface EdgeOptions {
  firstDay: string;
  lastDay: string;
  timeZone: string;
}
