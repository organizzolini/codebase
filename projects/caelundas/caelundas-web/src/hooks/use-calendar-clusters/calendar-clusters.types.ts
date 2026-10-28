import type { CalendarEventRecord } from "../../components/events-calendar/events-database.types";

// 🏷️ Types

/**
 * The events a view draws once similar ones are merged, and what each
 * merged one stands for.
 */
export interface ClusteredEvents {
  /**
   * The events to draw: those that stay as they are and one stand-in for
   * each cluster.
   */
  events: CalendarEventRecord[];
  /**
   * The events behind each stand-in, by the stand-in's id.
   */
  members: ReadonlyMap<string, readonly CalendarEventRecord[]>;
}

/**
 * What decides which events are merged, and where.
 */
export interface ClusterOptions {
  enabled: boolean;
  /**
   * The first and last day the view shows, as `YYYY-MM-DD`.
   */
  firstDay: string;
  /**
   * How far apart, in minutes, two events inside a day may start and still
   * be one cluster. A view with room to draw many events side by side keeps
   * it short.
   */
  gapMinutes: number;
  lastDay: string;
  /**
   * The fewest events that make a cluster; fewer are left as they are, so a
   * view with room merges only what would crowd it.
   */
  minimum: number;
  timeZone: string;
}
