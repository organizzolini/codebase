import type { CalendarGroupReference } from "../../../../components/calendar-display/events-calendar/components/calendar-groups/calendar-groups.types";
import type { CalendarEventRecord } from "../../../../components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";

// 🏷️ Types

/**
 * Events to draw after merging, and each merge's members.
 */
export interface ClusteredEvents {
  /**
   * The events to draw: those that stay as they are and one stand-in for
   * each cluster.
   */
  events: CalendarEventRecord[];
  /**
   * The group each stand-in is of, by the stand-in's id.
   */
  groups: ReadonlyMap<string, CalendarGroupReference>;
  /**
   * The events behind each stand-in, by the stand-in's id.
   */
  members: ReadonlyMap<string, readonly CalendarEventRecord[]>;
}

/**
 * What decides which events are merged, and where.
 */
export interface ClusterOptions {
  /**
   * Each group's color by its tag, which a cluster is drawn in; the first event's when absent.
   */
  colors?: ReadonlyMap<string, string> | undefined;
  enabled: boolean;
  /**
   * The first and last day the view shows, as `YYYY-MM-DD`.
   */
  firstDay: string;
  /**
   * Minutes apart that events in a day may start and still cluster; views with room keep it short.
   */
  gapMinutes: number;
  /**
   * The group an event falls under; only events of one group merge.
   */
  groupOf: (event: CalendarEventRecord) => CalendarGroupReference;
  lastDay: string;
  /**
   * The fewest events that make a cluster; fewer are left as they are, so a
   * view with room merges only what would crowd it.
   */
  minimum: number;
  timeZone: string;
}
