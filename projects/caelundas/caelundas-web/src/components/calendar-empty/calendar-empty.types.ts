import type { CalendarEmptiness } from "../events-calendar/calendar-loader.types";

// 🏷️ Types

/**
 * The kinds of emptiness that need no more than a title and a sentence.
 */
export type PlainEmptiness = Exclude<CalendarEmptiness["kind"], "range">;
