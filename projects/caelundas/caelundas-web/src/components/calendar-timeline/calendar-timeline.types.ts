import type { EventGroupNode } from "../calendar-group-by/event-groups.types";
import type { CalendarEventRecord } from "../events-calendar/events-database.types";
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
 * The rows laid out so far: the list each row's nested rows go in, and the
 * events each row holds, by row id.
 */
export interface RowLayout {
  children: Map<string, GanttResource[]>;
  members: Map<string, Set<string>>;
}

/**
 * What a timeline bar draws: one event, or a cluster of crowded ones.
 */
export interface TimelineBar {
  /**
   * The English name of each record, in order, which a cluster previews.
   */
  names: string[];
  records: CalendarEventRecord[];
}

/**
 * The timeline's rows and the bars drawn in them: a row per group, nested
 * as the grouping nests, with a tag group nested under each tag above it in
 * its tree, and how many distinct events each row holds.
 */
export interface TimelineRows {
  counts: ReadonlyMap<string, number>;
  events: GanttEvent<TimelineBar>[];
  resources: GanttResource[];
}
