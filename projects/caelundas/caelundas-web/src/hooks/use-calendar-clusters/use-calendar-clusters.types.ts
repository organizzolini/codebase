import type { CalendarViewName } from "../../components/events-calendar/calendar-views.types";
import type { CalendarEventRecord } from "../../components/events-calendar/events-database.types";
import type { EventCalendarOccurrence } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🏷️ Types

/**
 * The events a view draws, and how and whether it merges them.
 */
export interface UseCalendarClustersProperties {
  anchor: Date;
  /**
   * Whether the view is one narrow column, which merges as a week does.
   */
  compact?: boolean | undefined;
  enabled: boolean;
  events: readonly CalendarEventRecord[];
  timeZone: string;
  view: CalendarViewName;
}

/**
 * What the views of hours draw instead of every event, how a click on a
 * cluster opens the events in it, and the dialog that lists them.
 */
export interface UseCalendarClustersResult {
  /**
   * The dialog listing the open cluster's events, closed while none is open.
   */
  dialog: ReactNode;
  events: CalendarEventRecord[];
  handleEventClick: (occurrence: EventCalendarOccurrence) => void;
}
