import { createContext } from "react";

import type { CalendarSymbols } from "./calendar-symbols.types";

// ♟️ Constants

export const DEFAULT_CALENDAR_SYMBOLS: CalendarSymbols = "glyphs";

/**
 * Passes the symbol style to the chips drawing them.
 */
export const CalendarSymbolsContext = createContext<CalendarSymbols>(
  DEFAULT_CALENDAR_SYMBOLS,
);
