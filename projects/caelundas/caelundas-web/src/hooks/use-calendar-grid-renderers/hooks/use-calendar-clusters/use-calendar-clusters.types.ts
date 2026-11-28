import type { CalendarGroupReference } from "../../../../components/calendar-display/events-calendar/components/calendar-groups/calendar-groups.types";
import type { CalendarEventRecord } from "../../../../components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../../../components/calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventGrouping } from "../../../../components/calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type {
  CalendarEvent,
  EventCalendarOccurrence,
} from "@codebase/presentation";

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
  /**
   * The groups' colors by tag, which clusters are drawn in.
   */
  groupColors?: ReadonlyMap<string, string> | undefined;
  /**
   * The grouping whose first level names the groups clusters are of.
   */
  grouping: EventGrouping;
  /**
   * The names of the roots that group by default; every root when absent.
   */
  roots?: ReadonlyMap<string, number> | undefined;
  timeZone: string;
  view: CalendarViewName;
}

/**
 * What the hour views draw, and what stands behind each cluster.
 */
export interface UseCalendarClustersResult {
  /**
   * What the event calendar is handed: none for the month, which the app draws.
   */
  calendarEvents: CalendarEvent<CalendarEventRecord>[];
  events: CalendarEventRecord[];
  /**
   * The ids of the clusters open, whose events are drawn beside them.
   */
  expanded: ReadonlySet<string>;
  /**
   * The group each cluster is of, by the cluster's id.
   */
  groups: ReadonlyMap<string, CalendarGroupReference>;
  handleEventClick: (occurrence: EventCalendarOccurrence) => void;
  /**
   * The events behind each cluster, by the cluster's id.
   */
  members: ReadonlyMap<string, readonly CalendarEventRecord[]>;
  /**
   * The long event each start or end block stands for, by the block's id.
   */
  origins: ReadonlyMap<string, CalendarEventRecord>;
}
