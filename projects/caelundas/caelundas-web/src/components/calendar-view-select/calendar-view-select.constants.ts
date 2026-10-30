import {
  CalendarDays,
  CalendarRange,
  ChartGantt,
  Columns3,
  List,
  Square,
} from "lucide-react";

import type { CalendarViewName } from "../events-calendar/calendar-views.types";
import type { LucideIcon } from "lucide-react";

// ♟️ Constants

export const VIEW_ICONS: Readonly<Record<CalendarViewName, LucideIcon>> = {
  agenda: List,
  day: Square,
  month: CalendarDays,
  "three-day": Columns3,
  timeline: ChartGantt,
  week: CalendarRange,
};
