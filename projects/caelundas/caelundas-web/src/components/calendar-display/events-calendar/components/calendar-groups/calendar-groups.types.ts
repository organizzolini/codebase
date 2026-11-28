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
   * The names of the roots that group by default; every root when absent.
   */
  roots: ReadonlySet<string> | undefined;
  sorts: readonly GroupSort[] | undefined;
}

/**
 * One group's events as gathered, with its sort rank.
 */
export interface GroupBucket {
  events: CalendarEventRecord[];
  rank: string;
  ref: CalendarGroupReference;
}
