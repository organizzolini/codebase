import type { EventGroupNode } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { CalendarEventRecord } from "../events-calendar/components/calendar-loader/calendar-records.types";
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
  /**
   * Each group node's color by node id; absent when colors are off.
   */
  colors?: ReadonlyMap<string, string> | undefined;
  /**
   * How many distinct events each row holds, by id.
   */
  counts: Map<string, number>;
  groups: Map<string, TimelineGroup>;
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
 * What a group row knows: its color, tag, and level.
 */
export interface TimelineGroup {
  color?: string | undefined;
  /**
   * Whether the group holds the events with no value at its level.
   */
  fallback: boolean;
  /**
   * The group's tag id; null for a fallback, and for the upper rows of a deep tag's path.
   */
  key: null | string;
  level: number;
}

/**
 * The timeline's rows and bars, with each row's event count.
 */
export interface TimelineRows {
  counts: ReadonlyMap<string, number>;
  events: GanttEvent<TimelineBar>[];
  /**
   * The group rows by id; the rows holding bars, lanes and the one ungrouped row are not here.
   */
  groups: ReadonlyMap<string, TimelineGroup>;
  resources: GanttResource[];
}
