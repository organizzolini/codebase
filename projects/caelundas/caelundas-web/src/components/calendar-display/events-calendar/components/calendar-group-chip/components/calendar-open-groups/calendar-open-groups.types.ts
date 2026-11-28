import type { CalendarEventGroup } from "../../../calendar-groups/calendar-groups.types";

// 🔖 Type

/**
 * The groups nested in a group, and their level.
 */
export interface SubGroups {
  groups: CalendarEventGroup[];
  level: number;
}
