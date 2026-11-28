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
  path: readonly string[];
  rank: string;
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
  /**
   * The group's name, which a "No …" group under it takes.
   */
  label?: string;
  /**
   * The tag's full path, none for the top and null for a "No …" group, which has no tag.
   */
  tagPath?: null | string;
}

/**
 * How the timeline orders its groups, at every level.
 */
export interface GroupSort {
  direction: "asc" | "desc";
  key: GroupSortKey;
  /**
   * For the `metric` key, the name of the metric the metric layouts order by.
   */
  metric?: string | undefined;
  /**
   * For the `tag` key, the id of the tag root's field or of the tag whose children's order the group's events are ranked by.
   */
  tag?: string | undefined;
}

/** What groups are ordered by: tag order, name, count, time, duration, metric. */
export type GroupSortKey =
  | "count"
  | "duration"
  | "end"
  | "first"
  | "metric"
  | "name"
  | "order"
  | "start"
  | "tag";

/**
 * What describes a level's groups: field, name, parent depth, only group.
 */
export interface LevelContext {
  field: string;
  fieldLabel: string;
  /**
   * The tag id of the only group this level splits, when it refines the level before it.
   */
  only?: string | undefined;
  /**
   * Whether the level's groups are the tags beneath its parent group's tag, for a level over every root's tags.
   */
  scoped?: boolean;
  /**
   * The names of a tag's path, from beneath the root, that the level's parent already holds.
   */
  skip: number;
}

/**
 * A group that may hold subgroups, whatever it measures.
 */
export interface NestedGroup<Group> {
  children?: readonly Group[] | undefined;
}

/**
 * A group, with the rank it sorts among its siblings by.
 */
export interface RankedGroupNode {
  node: EventGroupNode;
  rank: string;
  /**
   * The tag's full path, null for a "No …" group.
   */
  tagPath: null | string;
}

/**
 * How tags rank when sorting by a tag.
 */
export interface TagRanks {
  prefixes: ReadonlyMap<string, string>;
  ranks: ReadonlyMap<string, number>;
}
