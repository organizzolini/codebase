import type { CalendarEmptiness } from "../events-calendar/calendar-loader.types";

// 🏷️ Types

/**
 * Emptiness kinds shown with just a title and sentence.
 */
export type PlainEmptiness = Exclude<CalendarEmptiness["kind"], "range">;
