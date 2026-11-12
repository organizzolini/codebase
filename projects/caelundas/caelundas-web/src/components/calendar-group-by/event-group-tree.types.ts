import type {
  CalendarEventGroupKey,
  CalendarEventRecord,
} from "../events-calendar/calendar-records.types";
import type { EventGroupNode } from "./event-groups.types";

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
