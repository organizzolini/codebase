import type { EventGroupNode } from "./event-groups.types";
import type {
  CalendarEventGroupKey,
  CalendarEventRecord,
} from "./events-database.types";

/**
 * The events of one group at one level, gathered under the first key that
 * named it.
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
 * A group whose events are split at the next level, and the list its
 * sub-groups go in.
 */
export interface GroupParent {
  children: EventGroupNode[];
  events: readonly CalendarEventRecord[];
  id: string;
}
