import { createContext } from "react";

import type { ReactNode } from "react";

// ♟️ Constants

/**
 * The date selector the toolbar hands the Filter strip to draw as part of itself; none when absent.
 */
export const CalendarNavigationSlot = createContext<ReactNode>(null);
