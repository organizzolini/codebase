import { createContext } from "react";

import type { ReactNode } from "react";

// ♟️ Constants

/** The date selector handed to the Filter strip; none when absent. */
export const CalendarNavigationSlot = createContext<ReactNode>(null);
