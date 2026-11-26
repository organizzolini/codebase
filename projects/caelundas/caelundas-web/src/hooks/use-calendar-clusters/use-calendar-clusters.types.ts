import type { CalendarEventRecord } from "../../components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../components/calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventCalendarOccurrence } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🏷️ Types

/**
 * The events a view draws, and how it merges them.
 */
export interface UseCalendarClustersProperties {
  anchor: Date;
  /**
   * Whether the view is one narrow column, which merges as a week does.
   */
  compact?: boolean | undefined;
  events: readonly CalendarEventRecord[];
  timeZone: string;
  view: CalendarViewName;
}

/**
 * What the hour views draw, and the cluster dialog.
 */
export interface UseCalendarClustersResult {
  /**
   * The dialog listing the open cluster's events, closed while none is open.
   */
  dialog: ReactNode;
  events: CalendarEventRecord[];
  handleEventClick: (occurrence: EventCalendarOccurrence) => void;
}
