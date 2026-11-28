import type {
  GroupSort,
  TagRanks,
} from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { CalendarEventRecord } from "../calendar-loader/calendar-records.types";

// 🏷️ Types

/**
 * A cell's group: its events and its chip's color.
 */
export interface CalendarEventGroup extends CalendarGroupReference {
  /**
   * The group's color: its tag's own in the color scheme, else the one most of its events share; none when uncolored.
   */
  color: string | undefined;
  events: CalendarEventRecord[];
  /**
   * What orders the group among its siblings by tag: its tag's path.
   */
  rank: string;
}

/**
 * One group's events as gathered, with its sort rank.
 */
export interface CalendarGroupBucket {
  events: CalendarEventRecord[];
  order: number;
  rank: string;
  ref: CalendarGroupReference;
}

/**
 * Names a group: its id, its tag's id, and label.
 */
export interface CalendarGroupReference {
  id: string;
  /**
   * The tag's id, or null for the events that have no group.
   */
  key: null | string;
  label: string;
}

/**
 * The default roots, and the sorts and ranks ordering groups.
 */
export interface CalendarGroupSort {
  ranks: TagRanks | undefined;
  /**
   * Each root's place in order, default ones first; the first key when absent.
   */
  roots: ReadonlyMap<string, number> | undefined;
  sorts: readonly GroupSort[] | undefined;
}

/**
 * A group with its measure under each sort.
 */
export interface MeasuredGroup {
  group: CalendarEventGroup;
  values: (number | string)[];
}
