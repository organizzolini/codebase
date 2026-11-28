import type { AllDayMode } from "../../components/calendar-display/events-calendar/components/calendar-grid/components/calendar-all-day/calendar-all-day.types";
import type { CalendarEventRecord } from "../../components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { DayOpener } from "../../components/calendar-display/events-calendar/components/calendar-month/calendar-month.types";
import type { EventGrouping } from "../../components/calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { UseCalendarClustersResult } from "./hooks/use-calendar-clusters/use-calendar-clusters.types";
import type {
  EventCalendarRenderEventProps,
  EventCalendarSegment,
} from "@codebase/presentation";
import type { ReactNode } from "react";

// 🏷️ Types

/**
 * What the renderers draw, and how the all-day row and headings behave.
 */
export interface UseCalendarGridRenderersProperties {
  allDayMode: AllDayMode;
  clustered: UseCalendarClustersResult;
  events: readonly CalendarEventRecord[];
  groupColors: ReadonlyMap<string, string> | undefined;
  grouping: EventGrouping;
  onAllDayModeChange: ((mode: AllDayMode) => void) | undefined;
  onOpenDay: DayOpener | undefined;
  timeZone: string;
}

/**
 * The functions the event calendar calls to draw its parts.
 */
export interface UseCalendarGridRenderersResult {
  renderAllDaySection: (section: {
    days: Date[];
    segments: EventCalendarSegment<CalendarEventRecord>[];
  }) => ReactNode;
  /**
   * A week's day heading as a button that opens the day; nothing for any other heading, which the calendar draws itself.
   */
  renderDayHeader: (heading: { day: Date; view: string }) => ReactNode;
  renderEvent: (
    properties: EventCalendarRenderEventProps<CalendarEventRecord>,
  ) => ReactNode;
  renderMoreContent: (properties: { day: Date }) => ReactNode;
}
