import { createContext } from "react";

import type { CalendarGroupSort } from "./calendar-groups.types";

// ♟️ Constants

/**
 * The sorts and tag ranks the busy cells order their groups by.
 */
export const CalendarGroupSortContext = createContext<CalendarGroupSort>({
  ranks: undefined,
  roots: undefined,
  sorts: undefined,
});

/**
 * The id of the group of events with no key.
 */
export const NO_GROUP_ID = "none";

/**
 * The name of the group of events with no key.
 */
export const NO_GROUP_LABEL = "Other";

/**
 * The separator of the names in a tag's path.
 */
export const TAG_PATH_SEPARATOR = " / ";
