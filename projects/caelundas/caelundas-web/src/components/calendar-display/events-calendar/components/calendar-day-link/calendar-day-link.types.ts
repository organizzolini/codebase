import type { DayLevel } from "../calendar-month/calendar-month.types";
import type { LucideIcon } from "lucide-react";

// 🏷️ Types

/**
 * A day menu's item: a level, its icon, and whether current.
 */
export interface DayLevelItem {
  Icon: LucideIcon;
  isCurrent: boolean;
  label: string;
  level: DayLevel;
}
