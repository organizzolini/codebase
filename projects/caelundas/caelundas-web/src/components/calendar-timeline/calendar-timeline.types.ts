import type { EventGroupNode } from "../calendar-group-by/event-groups.types";
import type { CalendarEventRecord } from "../events-calendar/calendar-records.types";
import type { GanttEvent, GanttResource } from "@codebase/presentation";

// 🏷️ Types

/**
 * A group still to lay out, and where its rows go.
 */
export interface PendingGroup {
  node: EventGroupNode;
  /**
   * The rows the group's own rows join, and the id they are scoped under.
   */
  parent: { children: GanttResource[]; id: string };
}

/**
 * Laid-out rows: their nested rows and member events, by id.
 */
export interface RowLayout {
  children: Map<string, GanttResource[]>;
  members: Map<string, Set<string>>;
}

/**
 * A timeline bar: one event, or a cluster of them.
 */
export interface TimelineBar {
  /**
   * The English name of each record, in order, which a cluster previews.
   */
  names: string[];
  records: CalendarEventRecord[];
}

/**
 * The timeline's rows and bars, with each row's event count.
 */
export interface TimelineRows {
  counts: ReadonlyMap<string, number>;
  events: GanttEvent<TimelineBar>[];
  resources: GanttResource[];
}
