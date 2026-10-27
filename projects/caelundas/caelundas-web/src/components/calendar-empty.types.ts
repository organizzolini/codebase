import type { CalendarEmptiness } from "../types/calendar-loader.types";

/**
 * The kinds of emptiness that need no more than a title and a sentence.
 */
export type PlainEmptiness = Exclude<CalendarEmptiness["kind"], "range">;
