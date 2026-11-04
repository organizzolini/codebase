import { createContext } from "react";

import type { CalendarSymbols } from "./calendar-symbols.types";

// ♟️ Constants

export const DEFAULT_CALENDAR_SYMBOLS: CalendarSymbols = "glyphs";

/**
 * Carries the symbols the calendar draws with to the chips that draw them.
 */
export const CalendarSymbolsContext = createContext<CalendarSymbols>(
  DEFAULT_CALENDAR_SYMBOLS,
);
