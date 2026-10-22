import { createContext } from "react";

// 🔖 Type

/**
 * How the calendar draws the symbols of an event's name: as the icons
 * drawn for them, or as the emoji and Unicode symbols they are written in.
 */
export type CalendarSymbols = "emojis" | "glyphs";

// 🔖 Constants

export const DEFAULT_CALENDAR_SYMBOLS: CalendarSymbols = "glyphs";

/**
 * Carries the symbols the calendar draws with to the chips that draw them.
 */
export const CalendarSymbolsContext = createContext<CalendarSymbols>(
  DEFAULT_CALENDAR_SYMBOLS,
);

// 🧩 Functions

/**
 * Reads the symbols from a link, falling back to the default for a value that
 * is not one.
 */
export function parseCalendarSymbols(value: unknown): "emojis" | undefined {
  return value === "emojis" ? "emojis" : undefined;
}
