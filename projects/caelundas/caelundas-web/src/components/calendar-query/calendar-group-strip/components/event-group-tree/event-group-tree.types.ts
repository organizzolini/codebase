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
  /**
   * The group's own key: a tag's id for a tag group.
   */
  key?: null | string;
}

/**
 * How the timeline orders its groups, at every level.
 */
export interface GroupSort {
  direction: "asc" | "desc";
  key: GroupSortKey;
  /**
   * For the `tag` key, the id of the tag root's field or of the tag whose children's order the group's events are ranked by.
   */
  tag?: string | undefined;
}

/** What groups are ordered by: tag order, name, event count, first time, or the place of their events' tags beneath one tag. */
export type GroupSortKey = "count" | "first" | "name" | "order" | "tag";

/**
 * What describes a level's groups: its field and the name of what is split, how many names of a tag's path its parent already holds, and, for a level that refines the one before it, the only group it splits.
 */
export interface LevelContext {
  field: string;
  fieldLabel: string;
  /**
   * The tag id of the only group this level splits, when it refines the level before it in the same tag root; the others stay whole.
   */
  only?: string | undefined;
  /**
   * The names of a tag's path, from beneath the root, that the level's parent already holds.
   */
  skip: number;
}

/**
 * A group, with the text it is ordered among its siblings by.
 */
export interface OrderedGroupNode {
  node: EventGroupNode;
  order: string;
}

/**
 * How tags rank for sorting groups by a tag: each tag's place in its root's tree order, and the path prefix beneath which a tag's children are, by the tag or root field's id.
 */
export interface TagRanks {
  prefixes: ReadonlyMap<string, string>;
  ranks: ReadonlyMap<string, number>;
}
