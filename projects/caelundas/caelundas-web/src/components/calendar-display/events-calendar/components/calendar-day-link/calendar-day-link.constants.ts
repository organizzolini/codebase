import { Calendar, CalendarDays, CalendarRange } from "lucide-react";

// ♟️ Constants

/**
 * The levels a day's menu opens, with their icons.
 */
export const DAY_LEVELS = [
  { Icon: Calendar, label: "Open day", level: "day" },
  { Icon: CalendarRange, label: "Open week", level: "week" },
  { Icon: CalendarDays, label: "Open month", level: "month" },
] as const;
