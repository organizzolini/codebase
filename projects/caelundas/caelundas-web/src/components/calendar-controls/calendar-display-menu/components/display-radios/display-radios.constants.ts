import {
  CalendarDays,
  CalendarRange,
  ChartGantt,
  Columns3,
  Grid2x2,
  List,
  Orbit,
  Square,
  Sun,
} from "lucide-react";

import {
  CALENDAR_VIEW_LABELS,
  CALENDAR_VIEWS,
  TIMELINE_SCALE_LABELS,
  TIMELINE_SCALES,
} from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.constants";

import type {
  CalendarViewName,
  TimelineScale,
} from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { LucideIcon } from "lucide-react";

// ♟️ Constants

/**
 * The icon each timeline scale carries beside its name.
 */
export const SCALE_ICONS: Readonly<Record<TimelineScale, LucideIcon>> = {
  day: Sun,
  month: CalendarDays,
  quarter: Grid2x2,
  week: CalendarRange,
  year: Orbit,
};

/**
 * The icon each calendar view carries beside its name.
 */
export const VIEW_ICONS: Readonly<Record<CalendarViewName, LucideIcon>> = {
  agenda: List,
  day: Square,
  month: CalendarDays,
  "three-day": Columns3,
  timeline: ChartGantt,
  week: CalendarRange,
};

/**
 * The timeline scales as radio choices, from the finest to the coarsest.
 */
export const SCALE_OPTIONS = TIMELINE_SCALES.map((value) => ({
  icon: SCALE_ICONS[value],
  label: TIMELINE_SCALE_LABELS[value],
  value,
}));

/**
 * The calendar views as radio choices.
 */
export const VIEW_OPTIONS = CALENDAR_VIEWS.map((value) => ({
  icon: VIEW_ICONS[value],
  label: CALENDAR_VIEW_LABELS[value],
  value,
}));
