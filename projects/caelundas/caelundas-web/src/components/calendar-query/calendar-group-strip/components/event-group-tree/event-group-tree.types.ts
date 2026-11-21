import type {
  CalendarEventGroupKey,
  CalendarEventRecord,
} from "../../../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { EventGroupNode } from "../event-group-model/event-groups.types";

/**
 * Events of one group, under the first key that named it.
 */
export interface GroupBucket {
  events: CalendarEventRecord[];
  groupKey: CalendarEventGroupKey | null;
}

/**
 * How a group reads and sorts, apart from the events in it.
 */
export interface GroupDescription {
  label: string;
  order: string;
  path: readonly string[];
}

/**
 * A group split at the next level, with its sub-groups.
 */
export interface GroupParent {
  children: EventGroupNode[];
  events: readonly CalendarEventRecord[];
  id: string;
}

/**
 * How the timeline orders its groups, at every level.
 */
export interface GroupSort {
  direction: "asc" | "desc";
  key: GroupSortKey;
}

/**
 * What groups are ordered by: their name, how many events, or the first one's time.
 */
export type GroupSortKey = "count" | "first" | "name";
