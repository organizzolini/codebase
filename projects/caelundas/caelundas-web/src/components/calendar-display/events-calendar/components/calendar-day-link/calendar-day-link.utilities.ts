import { DAY_LEVELS } from "./calendar-day-link.constants";

import type { DayLevel } from "../calendar-month/calendar-month.types";
import type { DayLevelItem } from "./calendar-day-link.types";

// 🌎 Public Functions

/**
 * The menu items of a day shown at a level: every level, the current one marked.
 */
export function listDayLevelItems(current: DayLevel): DayLevelItem[] {
  const items: DayLevelItem[] = [];

  for (const { Icon, label, level } of DAY_LEVELS) {
    items.push({
      Icon,
      isCurrent: level === current,
      label: level === current ? `${label} (current)` : label,
      level,
    });
  }

  return items;
}
